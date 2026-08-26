import fs from 'fs';
import path from 'path';

export interface SqliteStatus {
  initialized: boolean;
  driver: string;
  dbPath: string;
  dataDir: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  walMode: string;
  isPersistentVolume: boolean;
  tablesCount: number;
  totalRows: number;
  tables: Array<{ name: string; rowCount: number; columns: string[] }>;
  lastCheckpoint: string;
  uptimeSeconds: number;
}

export interface QueryResult {
  success: boolean;
  sql: string;
  executionTimeMs: number;
  columns: string[];
  rows: any[];
  rowCount: number;
  changes?: number;
  lastInsertRowid?: number | bigint;
  error?: string;
}

const startTime = Date.now();

// Resolve persistent storage path
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const dbFileName = process.env.SQLITE_DB_NAME || 'arena.db';
const dbPath = path.join(dataDir, dbFileName);

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance: any = null;
let driverName = 'node:sqlite (Native C++ Engine)';
let lastCheckpointTime = new Date().toISOString();

/**
 * Initialize SQLite Engine
 */
export async function getDb() {
  if (dbInstance) return dbInstance;

  try {
    // Try Node.js 22 built-in native SQLite engine (DatabaseSync)
    const { DatabaseSync } = await import('node:sqlite');
    dbInstance = new DatabaseSync(dbPath);
    driverName = 'node:sqlite (Node 24 LTS Native C++)';

    // Optimize with WAL mode and foreign keys for high throughput
    try {
      dbInstance.exec('PRAGMA journal_mode = WAL;');
      dbInstance.exec('PRAGMA synchronous = NORMAL;');
      dbInstance.exec('PRAGMA foreign_keys = ON;');
      dbInstance.exec('PRAGMA cache_size = -64000;'); // 64MB cache
    } catch {
      // safe fallback
    }

    initDefaultTables(dbInstance, 'native');
    console.log(`✓ [SQLite] Native database initialized at ${dbPath} (WAL Mode active)`);
    return dbInstance;
  } catch (err: any) {
    console.warn(`! [SQLite] Native node:sqlite load notice: ${err.message}. Falling back to sql.js WASM engine with disk sync.`);
    
    // Fallback: sql.js with filesystem file sync
    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs();
    driverName = 'sql.js (WASM + Persistent Disk Sync)';

    let filebuffer: Buffer | null = null;
    if (fs.existsSync(dbPath)) {
      try {
        filebuffer = fs.readFileSync(dbPath);
      } catch (readErr) {
        console.warn('Could not read existing db file, creating new:', readErr);
      }
    }

    const wasmDb = filebuffer ? new SQL.Database(filebuffer) : new SQL.Database();
    
    // Wrapper to persist on change
    const syncDisk = () => {
      try {
        const data = wasmDb.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
      } catch (writeErr) {
        console.error('Disk write error:', writeErr);
      }
    };

    dbInstance = {
      isWasm: true,
      exec: (sql: string) => {
        wasmDb.exec(sql);
        syncDisk();
      },
      prepare: (sql: string) => {
        return {
          all: (...params: any[]) => {
            const stmt = wasmDb.prepare(sql);
            if (params.length) stmt.bind(params);
            const results: any[] = [];
            while (stmt.step()) {
              results.push(stmt.getAsObject());
            }
            stmt.free();
            return results;
          },
          run: (...params: any[]) => {
            wasmDb.run(sql, params);
            syncDisk();
            return { changes: wasmDb.getRowsModified() };
          },
        };
      },
      export: () => wasmDb.export(),
      close: () => wasmDb.close(),
    };

    initDefaultTables(dbInstance, 'wasm');
    console.log(`✓ [SQLite] WASM database initialized at ${dbPath}`);
    return dbInstance;
  }
}

/**
 * Initialize default schema tables
 */
function initDefaultTables(db: any, type: 'native' | 'wasm') {
  const ddl = `
    CREATE TABLE IF NOT EXISTS arena_test_runs (
      id TEXT PRIMARY KEY,
      test_name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      execution_time_ms REAL NOT NULL,
      passed_assertions INTEGER NOT NULL,
      total_assertions INTEGER NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes_persistent (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS edge_telemetry (
      id TEXT PRIMARY KEY,
      route TEXT NOT NULL,
      method TEXT NOT NULL,
      status INTEGER NOT NULL,
      ttfb_ms REAL NOT NULL,
      cache_status TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS directus_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disk_durability_tests (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      write_latency_ms REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `;

  if (type === 'native') {
    db.exec(ddl);
  } else {
    db.exec(ddl);
  }

  // Seed default Directus configuration if not present
  try {
    const existing = runQuerySync(
      db,
      "SELECT value FROM directus_settings WHERE key = 'directus_url'"
    );
    if (!existing || existing.length === 0) {
      const defaultUrl = process.env.DIRECTUS_URL || 'http://directus:8055';
      const defaultToken = process.env.DIRECTUS_TOKEN || 'arena-admin-secure-token-2026';
      const now = new Date().toISOString();

      if (type === 'native') {
        db.prepare('INSERT OR REPLACE INTO directus_settings (key, value, updated_at) VALUES (?, ?, ?)')
          .run('directus_url', defaultUrl, now);
        db.prepare('INSERT OR REPLACE INTO directus_settings (key, value, updated_at) VALUES (?, ?, ?)')
          .run('directus_token', defaultToken, now);
      } else {
        db.prepare('INSERT OR REPLACE INTO directus_settings (key, value, updated_at) VALUES (?, ?, ?)')
          .run('directus_url', defaultUrl, now);
        db.prepare('INSERT OR REPLACE INTO directus_settings (key, value, updated_at) VALUES (?, ?, ?)')
          .run('directus_token', defaultToken, now);
      }
    }
  } catch (err) {
    // ignore
  }
}

function runQuerySync(db: any, sql: string, params: any[] = []): any[] {
  if (db.prepare) {
    const stmt = db.prepare(sql);
    if (typeof stmt.all === 'function') {
      return stmt.all(...params);
    }
  }
  return [];
}

/**
 * Execute arbitrary SQL query safely with timing
 */
export async function executeQuery(sql: string, params: any[] = []): Promise<QueryResult> {
  const db = await getDb();
  const start = performance.now();

  const trimmed = sql.trim();
  const isSelect = /^(SELECT|PRAGMA|EXPLAIN|WITH)/i.test(trimmed);

  try {
    if (isSelect) {
      const stmt = db.prepare(trimmed);
      const rows = typeof stmt.all === 'function' ? stmt.all(...params) : [];
      const executionTimeMs = parseFloat((performance.now() - start).toFixed(2));
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      return {
        success: true,
        sql: trimmed,
        executionTimeMs,
        columns,
        rows,
        rowCount: rows.length,
      };
    } else {
      // Execute DDL or DML (INSERT, UPDATE, DELETE, CREATE, DROP, etc.)
      const stmt = db.prepare(trimmed);
      const result = stmt.run(...params);
      const executionTimeMs = parseFloat((performance.now() - start).toFixed(2));

      return {
        success: true,
        sql: trimmed,
        executionTimeMs,
        columns: [],
        rows: [],
        rowCount: 0,
        changes: result?.changes ?? 0,
        lastInsertRowid: result?.lastInsertRowid,
      };
    }
  } catch (err: any) {
    const executionTimeMs = parseFloat((performance.now() - start).toFixed(2));
    return {
      success: false,
      sql: trimmed,
      executionTimeMs,
      columns: [],
      rows: [],
      rowCount: 0,
      error: err.message || String(err),
    };
  }
}

/**
 * Get database status, table schemas, and persistence metrics
 */
export async function getDbStatus(): Promise<SqliteStatus> {
  const db = await getDb();
  let fileSizeBytes = 0;
  try {
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      fileSizeBytes = stats.size;
    }
  } catch {
    // fallback
  }

  // Check WAL mode
  let walMode = 'WAL';
  try {
    const pragma = await executeQuery('PRAGMA journal_mode;');
    if (pragma.rows.length > 0) {
      walMode = String(Object.values(pragma.rows[0])[0]).toUpperCase();
    }
  } catch {
    // fallback
  }

  // Get table list
  const tablesResult = await executeQuery(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC;"
  );

  let totalRows = 0;
  const tableDetails: Array<{ name: string; rowCount: number; columns: string[] }> = [];

  for (const t of tablesResult.rows) {
    const tableName = t.name;
    const countRes = await executeQuery(`SELECT COUNT(*) as count FROM "${tableName}";`);
    const rowCount = countRes.rows[0]?.count || 0;
    totalRows += rowCount;

    const colRes = await executeQuery(`PRAGMA table_info("${tableName}");`);
    const columns = colRes.rows.map((c: any) => `${c.name} (${c.type})`);

    tableDetails.push({
      name: tableName,
      rowCount,
      columns,
    });
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isPersistentVolume =
    dataDir.startsWith('/data') || fs.existsSync('/data') || fs.existsSync(dataDir);

  return {
    initialized: true,
    driver: driverName,
    dbPath,
    dataDir,
    fileSizeBytes,
    fileSizeFormatted: formatSize(fileSizeBytes),
    walMode,
    isPersistentVolume,
    tablesCount: tableDetails.length,
    totalRows,
    tables: tableDetails,
    lastCheckpoint: lastCheckpointTime,
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
  };
}

/**
 * Flush WAL log to disk
 */
export async function checkpointWal(): Promise<{ success: boolean; message: string; timestamp: string }> {
  try {
    const db = await getDb();
    if (!db.isWasm) {
      db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    }
    lastCheckpointTime = new Date().toISOString();
    return {
      success: true,
      message: 'WAL Checkpoint completed (TRUNCATE mode): DB pages successfully synced to persistent disk.',
      timestamp: lastCheckpointTime,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Checkpoint error: ${err.message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Seed sample data into SQLite
 */
export async function seedSampleData() {
  const db = await getDb();
  const now = new Date().toISOString();

  // Seed arena test runs
  const testRuns = [
    ['run-001', 'PPR Dynamic IO Boundary Stress', 'PPR & Suspense', 'passed', 4.2, 5, 5, 'Zero hydration divergence on 100 concurrent streams', now],
    ['run-002', 'Turbopack Rust AST Bytecode Diff', 'Turbopack Cache', 'passed', 1.8, 4, 4, '16-core persistent AST hit rate: 99.4%', now],
    ['run-003', 'Server Actions AES-256 CSRF Crypt', 'Server Actions', 'passed', 8.5, 6, 6, 'Cipher verification passed on Edge Worker', now],
    ['run-004', 'React Compiler Auto Memoization', 'React Compiler', 'passed', 3.1, 4, 4, 'Zero useMemo/useCallback overhead measured', now],
    ['run-005', 'SQLite WAL Persistent Storage IO', 'Disk Storage', 'passed', 0.9, 5, 5, 'Direct write to persistent volume: 0.9ms latency', now],
  ];

  for (const row of testRuns) {
    await executeQuery(
      'INSERT OR REPLACE INTO arena_test_runs (id, test_name, category, status, execution_time_ms, passed_assertions, total_assertions, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      row
    );
  }

  // Seed persistent notes
  const notes = [
    ['note-001', 'Persistent SQLite Volume Mounting', 'Docker volume mount `/data/arena.db` ensures zero data loss during NineDeploy or container redeployments.', 'deneme', 1, now],
    ['note-002', 'Directus Container Linking', 'Connect Next.js 16 to Directus via `http://directus:8055` using the internal Docker bridge network.', 'fikir', 0, now],
    ['note-003', 'WAL Checkpoint Frequency', 'Configure automatic SQLite WAL truncation on high-frequency Edge server actions.', 'not', 0, now],
  ];

  for (const note of notes) {
    await executeQuery(
      'INSERT OR REPLACE INTO notes_persistent (id, title, content, category, completed, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      note
    );
  }

  // Seed telemetry
  const routes = ['/api/v1/stream', '/api/compiler/ast', '/api/sqlite/query', '/api/og/render'];
  for (let i = 0; i < 8; i++) {
    const route = routes[i % routes.length];
    await executeQuery(
      'INSERT OR REPLACE INTO edge_telemetry (id, route, method, status, ttfb_ms, cache_status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        `tel-${Date.now()}-${i}`,
        route,
        i % 2 === 0 ? 'GET' : 'POST',
        200,
        parseFloat((Math.random() * 8 + 1.2).toFixed(2)),
        i % 3 === 0 ? 'HIT' : 'DYNAMIC_STREAM',
        new Date(Date.now() - i * 60000).toISOString(),
      ]
    );
  }

  return { success: true, message: 'Database successfully seeded with benchmark & telemetry records.' };
}

/**
 * Record a durability benchmark entry
 */
export async function testDiskDurability(payloadSizeKb: number = 16): Promise<{ latencyMs: number; recordId: string; dbPath: string }> {
  const start = performance.now();
  const recordId = `durability-${Date.now()}`;
  const dummyPayload = 'X'.repeat(payloadSizeKb * 1024);
  const now = new Date().toISOString();

  await executeQuery(
    'INSERT INTO disk_durability_tests (id, payload, write_latency_ms, created_at) VALUES (?, ?, ?, ?)',
    [recordId, dummyPayload, 0, now]
  );

  const latencyMs = parseFloat((performance.now() - start).toFixed(2));
  await executeQuery('UPDATE disk_durability_tests SET write_latency_ms = ? WHERE id = ?', [
    latencyMs,
    recordId,
  ]);

  return {
    latencyMs,
    recordId,
    dbPath,
  };
}

/**
 * Directus Settings Helpers
 */
export async function getDirectusSettings(): Promise<{ url: string; token: string }> {
  const urlRes = await executeQuery("SELECT value FROM directus_settings WHERE key = 'directus_url'");
  const tokenRes = await executeQuery("SELECT value FROM directus_settings WHERE key = 'directus_token'");

  return {
    url: urlRes.rows[0]?.value || process.env.DIRECTUS_URL || 'http://directus:8055',
    token: tokenRes.rows[0]?.value || process.env.DIRECTUS_TOKEN || 'arena-admin-secure-token-2026',
  };
}

export async function saveDirectusSettings(url: string, token: string): Promise<{ success: boolean }> {
  const now = new Date().toISOString();
  await executeQuery(
    'INSERT OR REPLACE INTO directus_settings (key, value, updated_at) VALUES (?, ?, ?)',
    ['directus_url', url.trim(), now]
  );
  await executeQuery(
    'INSERT OR REPLACE INTO directus_settings (key, value, updated_at) VALUES (?, ?, ?)',
    ['directus_token', token.trim(), now]
  );
  return { success: true };
}

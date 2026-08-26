import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  HardDrive,
  Play,
  RotateCw,
  Sparkles,
  Server,
  Layers,
  FileCode,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  Download,
  AlertCircle,
  Table as TableIcon,
  Search,
  ExternalLink,
  Cpu,
  Flame,
  Clock,
  ArrowRight,
  Terminal,
  Container,
  Network,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

interface TableDetail {
  name: string;
  rowCount: number;
  columns: string[];
}

interface DbStatus {
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
  tables: TableDetail[];
  lastCheckpoint: string;
  uptimeSeconds: number;
}

interface QueryResponse {
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

interface DirectusTestResult {
  connected: boolean;
  status: number;
  statusText: string;
  latencyMs: number;
  endpoint: string;
  response?: any;
  message?: string;
  error?: string;
  hint?: string;
}

const SQL_PRESETS = [
  {
    name: '1. Select Test Runs (Top 10)',
    sql: 'SELECT id, test_name, category, status, execution_time_ms, passed_assertions, created_at FROM arena_test_runs ORDER BY execution_time_ms ASC LIMIT 10;',
  },
  {
    name: '2. Group by Category & Avg Latency',
    sql: 'SELECT category, COUNT(*) as total_tests, ROUND(AVG(execution_time_ms), 2) as avg_latency_ms FROM arena_test_runs GROUP BY category ORDER BY total_tests DESC;',
  },
  {
    name: '3. Select Persistent Notes',
    sql: 'SELECT id, title, content, category, completed, created_at FROM notes_persistent ORDER BY created_at DESC;',
  },
  {
    name: '4. Select Edge Telemetry Streams',
    sql: 'SELECT id, route, method, status, ttfb_ms, cache_status, timestamp FROM edge_telemetry ORDER BY timestamp DESC LIMIT 10;',
  },
  {
    name: '5. SQLite Engine & Page Pragma',
    sql: 'SELECT * FROM pragma_journal_mode() UNION ALL SELECT * FROM pragma_page_size() UNION ALL SELECT * FROM pragma_page_count();',
  },
  {
    name: '6. Insert Durability Record',
    sql: "INSERT INTO notes_persistent (id, title, content, category, completed, created_at) VALUES ('note-' || hex(randomblob(4)), 'Live SQLite Disk Test', 'Persisted via WAL into /data volume', 'deneme', 0, datetime('now'));",
  },
  {
    name: '7. Directus Sync Queue Table (DDL)',
    sql: `CREATE TABLE IF NOT EXISTS directus_sync_queue (
  id TEXT PRIMARY KEY,
  collection_name TEXT NOT NULL,
  action TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  sync_status TEXT DEFAULT 'pending',
  retries INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);`,
  },
];

export const SqliteStudio: React.FC = () => {
  const { t } = useI18n();

  // Status & Loading states
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'query' | 'tables' | 'directus' | 'docker'>('query');

  // SQL Query Runner state
  const [sqlInput, setSqlInput] = useState<string>(SQL_PRESETS[0].sql);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);

  // Table browser state
  const [selectedTableName, setSelectedTableName] = useState<string>('arena_test_runs');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [tableSearch, setTableSearch] = useState<string>('');

  // Directus Integration state
  const [directusUrl, setDirectusUrl] = useState<string>('http://directus:8055');
  const [directusToken, setDirectusToken] = useState<string>('arena-admin-secure-token-2026');
  const [directusTesting, setDirectusTesting] = useState<boolean>(false);
  const [directusResult, setDirectusResult] = useState<DirectusTestResult | null>(null);
  const [directusSaved, setDirectusSaved] = useState<boolean>(false);
  const [directusCollections, setDirectusCollections] = useState<any[] | null>(null);
  const [loadingCollections, setLoadingCollections] = useState<boolean>(false);

  // Durability & Action notices
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isCheckpointing, setIsCheckpointing] = useState<boolean>(false);
  const [isTestingDurability, setIsTestingDurability] = useState<boolean>(false);

  // Load Status on mount
  const fetchDbStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/sqlite/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
        if (data.tables && data.tables.length > 0 && !selectedTableName) {
          setSelectedTableName(data.tables[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load sqlite status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Load Directus settings on mount
  const fetchDirectusSettings = async () => {
    try {
      const res = await fetch('/api/directus/config');
      if (res.ok) {
        const data = await res.json();
        if (data.url) setDirectusUrl(data.url);
        if (data.token) setDirectusToken(data.token);
      }
    } catch (err) {
      console.error('Failed to load directus settings:', err);
    }
  };

  useEffect(() => {
    fetchDbStatus();
    fetchDirectusSettings();
    // Run initial query
    handleExecuteSql(SQL_PRESETS[0].sql);
  }, []);

  // Execute SQL Query
  const handleExecuteSql = async (queryToRun?: string) => {
    const q = queryToRun || sqlInput;
    if (!q.trim()) return;

    setIsExecuting(true);
    try {
      const res = await fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: q }),
      });
      const data: QueryResponse = await res.json();
      setQueryResult(data);
      // Auto-refresh status if DDL/DML was run
      if (!/^(SELECT|PRAGMA|EXPLAIN)/i.test(q.trim())) {
        fetchDbStatus();
      }
    } catch (err: any) {
      setQueryResult({
        success: false,
        sql: q,
        executionTimeMs: 0,
        columns: [],
        rows: [],
        rowCount: 0,
        error: err.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Fetch Table Data for browser
  const fetchTableData = async (tableName: string) => {
    setSelectedTableName(tableName);
    try {
      const res = await fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: `SELECT * FROM "${tableName}" LIMIT 50;` }),
      });
      const data: QueryResponse = await res.json();
      if (data.success) {
        setTableData(data.rows);
        setTableColumns(data.columns);
      }
    } catch (err) {
      console.error('Failed to load table rows:', err);
    }
  };

  useEffect(() => {
    if (selectedTableName && activeTab === 'tables') {
      fetchTableData(selectedTableName);
    }
  }, [selectedTableName, activeTab]);

  // Seed sample data
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/sqlite/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionNotice({ type: 'success', message: 'SQLite database populated with benchmark and telemetry records.' });
        fetchDbStatus();
        handleExecuteSql();
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message });
    } finally {
      setIsSeeding(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // WAL Checkpoint to Disk
  const handleCheckpoint = async () => {
    setIsCheckpointing(true);
    try {
      const res = await fetch('/api/sqlite/checkpoint', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionNotice({ type: 'success', message: data.message });
        fetchDbStatus();
      } else {
        setActionNotice({ type: 'error', message: data.message });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message });
    } finally {
      setIsCheckpointing(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Disk Durability IO Test
  const handleDurabilityTest = async () => {
    setIsTestingDurability(true);
    try {
      const res = await fetch('/api/sqlite/durability-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payloadSizeKb: 32 }),
      });
      const data = await res.json();
      setActionNotice({
        type: 'success',
        message: `Persistent Disk Write IO Success! 32KB committed in ${data.latencyMs}ms (Record: ${data.recordId})`,
      });
      fetchDbStatus();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message });
    } finally {
      setIsTestingDurability(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // Directus Connection Test
  const handleTestDirectus = async () => {
    setDirectusTesting(true);
    setDirectusResult(null);
    try {
      const res = await fetch('/api/directus/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: directusUrl, token: directusToken }),
      });
      const data: DirectusTestResult = await res.json();
      setDirectusResult(data);
    } catch (err: any) {
      setDirectusResult({
        connected: false,
        status: 0,
        statusText: 'Client Error',
        latencyMs: 0,
        endpoint: directusUrl,
        error: err.message,
      });
    } finally {
      setDirectusTesting(false);
    }
  };

  // Save Directus Config
  const handleSaveDirectusConfig = async () => {
    try {
      const res = await fetch('/api/directus/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: directusUrl, token: directusToken }),
      });
      if (res.ok) {
        setDirectusSaved(true);
        setTimeout(() => setDirectusSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save directus config:', err);
    }
  };

  // Fetch Directus Collections
  const handleFetchCollections = async () => {
    setLoadingCollections(true);
    try {
      const res = await fetch('/api/directus/collections', { method: 'POST' });
      const data = await res.json();
      if (data.data) {
        setDirectusCollections(data.data);
      } else {
        setDirectusCollections([]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingCollections(false);
    }
  };

  // Filtered table rows
  const filteredTableRows = useMemo(() => {
    if (!tableSearch.trim()) return tableData;
    const q = tableSearch.toLowerCase();
    return tableData.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [tableData, tableSearch]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-zinc-950 dark:bg-black text-emerald-400 border border-zinc-800 flex items-center justify-center shadow-xs">
                <Database size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {t('sqlite.title')}
              </h2>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('sqlite.mountActive')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                {dbStatus?.walMode || 'WAL'} MODE
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
              {t('sqlite.desc')}
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="sqlite-checkpoint-btn"
              onClick={handleCheckpoint}
              disabled={isCheckpointing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 text-xs font-mono font-semibold transition-all border border-zinc-200 dark:border-neutral-700"
            >
              <HardDrive size={14} className={isCheckpointing ? 'animate-spin text-emerald-500' : 'text-emerald-500'} />
              <span>{isCheckpointing ? 'Flushing...' : t('sqlite.checkpointBtn')}</span>
            </button>

            <button
              id="sqlite-seed-btn"
              onClick={handleSeedData}
              disabled={isSeeding}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold transition-all"
            >
              <Sparkles size={14} />
              <span>{isSeeding ? 'Seeding...' : t('sqlite.seedBtn')}</span>
            </button>

            <button
              id="sqlite-durability-btn"
              onClick={handleDurabilityTest}
              disabled={isTestingDurability}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-mono font-semibold transition-all"
            >
              <Zap size={14} />
              <span>{isTestingDurability ? 'Testing IO...' : t('sqlite.durabilityBtn')}</span>
            </button>

            <button
              id="sqlite-refresh-btn"
              onClick={fetchDbStatus}
              disabled={isLoadingStatus}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-600 dark:text-neutral-300 transition-all border border-zinc-200 dark:border-neutral-700"
              title={t('sqlite.refreshBtn')}
            >
              <RefreshCw size={15} className={isLoadingStatus ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Global Notice Toast */}
        <AnimatePresence>
          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 p-3 rounded-2xl flex items-center gap-2 text-xs font-mono ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30'
              }`}
            >
              {actionNotice.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
              <span>{actionNotice.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4-Stat Metric Bento */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800">
            <span className="text-[11px] font-mono text-zinc-500 dark:text-neutral-400 block mb-1 flex items-center gap-1">
              <FolderOpen size={12} className="text-emerald-500" />
              {t('sqlite.mountPath')}
            </span>
            <div className="text-xs font-mono font-bold text-zinc-900 dark:text-white truncate" title={dbStatus?.dbPath}>
              {dbStatus?.dbPath || '/data/arena.db'}
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              Persistent Disk Volume Mounted
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800">
            <span className="text-[11px] font-mono text-zinc-500 dark:text-neutral-400 block mb-1 flex items-center gap-1">
              <HardDrive size={12} className="text-sky-500" />
              {t('sqlite.dbSize')}
            </span>
            <div className="text-base font-mono font-bold text-zinc-900 dark:text-white">
              {dbStatus?.fileSizeFormatted || '0 KB'}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
              {dbStatus?.fileSizeBytes ? `${dbStatus.fileSizeBytes.toLocaleString()} Bytes` : '0 Bytes'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800">
            <span className="text-[11px] font-mono text-zinc-500 dark:text-neutral-400 block mb-1 flex items-center gap-1">
              <TableIcon size={12} className="text-purple-500" />
              {t('sqlite.totalRows')}
            </span>
            <div className="text-base font-mono font-bold text-zinc-900 dark:text-white">
              {dbStatus?.totalRows.toLocaleString() || '0'}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
              {dbStatus?.tablesCount || 0} {t('sqlite.tableCount')}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800">
            <span className="text-[11px] font-mono text-zinc-500 dark:text-neutral-400 block mb-1 flex items-center gap-1">
              <Cpu size={12} className="text-amber-500" />
              {t('sqlite.driver')}
            </span>
            <div className="text-xs font-mono font-bold text-zinc-900 dark:text-white truncate" title={dbStatus?.driver}>
              {dbStatus?.driver || 'node:sqlite (Node 24 LTS)'}
            </div>
            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-1 block">
              High-Throughput WAL Mode
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-neutral-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('query')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'query'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xs'
              : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700'
          }`}
        >
          <Terminal size={14} />
          <span>{t('sqlite.queryTitle')}</span>
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'tables'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xs'
              : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700'
          }`}
        >
          <TableIcon size={14} />
          <span>{t('sqlite.tableBrowser')} ({dbStatus?.tablesCount || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('directus')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'directus'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xs'
              : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700'
          }`}
        >
          <Container size={14} className="text-purple-500" />
          <span>Directus Container Bridge</span>
        </button>

        <button
          onClick={() => setActiveTab('docker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'docker'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xs'
              : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700'
          }`}
        >
          <Network size={14} />
          <span>{t('sqlite.dockerTab')}</span>
        </button>
      </div>

      {/* TAB 1: SQL Query Studio */}
      {activeTab === 'query' && (
        <div className="space-y-5">
          {/* Query Editor Bento */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-emerald-500" />
                <span className="font-mono text-xs font-bold text-zinc-800 dark:text-neutral-200">
                  SQL Query Input (SQLite 3.45+ Engine)
                </span>
              </div>

              {/* Presets dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-500">{t('sqlite.presets')}:</span>
                <select
                  onChange={(e) => {
                    const preset = SQL_PRESETS.find((p) => p.name === e.target.value);
                    if (preset) {
                      setSqlInput(preset.sql);
                      handleExecuteSql(preset.sql);
                    }
                  }}
                  className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-xs font-mono text-zinc-800 dark:text-neutral-200 focus:outline-none"
                >
                  {SQL_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SQL Textarea */}
            <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 p-3 shadow-inner">
              <textarea
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleExecuteSql();
                  }
                }}
                rows={4}
                placeholder={t('sqlite.queryPlaceholder')}
                className="w-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              />
              <span className="absolute right-3 bottom-2 text-[10px] font-mono text-zinc-600">
                Press Ctrl + Enter to execute
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  id="sqlite-run-query-btn"
                  onClick={() => handleExecuteSql()}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-xs transition-all shadow-xs"
                >
                  <Play size={13} className={isExecuting ? 'animate-spin' : ''} />
                  <span>{isExecuting ? 'Executing...' : t('sqlite.runQuery')}</span>
                </button>

                <button
                  onClick={() => setSqlInput('')}
                  className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-600 dark:text-neutral-300 font-mono text-xs font-semibold transition-all"
                >
                  {t('sqlite.clearQuery')}
                </button>
              </div>

              {queryResult && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Clock size={12} className="text-sky-500" />
                    <span>{t('sqlite.execTime')}:</span>
                    <strong className="text-zinc-900 dark:text-white font-bold">{queryResult.executionTimeMs}ms</strong>
                  </span>

                  {queryResult.rowCount > 0 && (
                    <span className="flex items-center gap-1 text-zinc-500">
                      <span>{t('sqlite.rowsReturned')}:</span>
                      <strong className="text-emerald-500 font-bold">{queryResult.rowCount}</strong>
                    </span>
                  )}

                  {queryResult.changes !== undefined && queryResult.changes > 0 && (
                    <span className="flex items-center gap-1 text-zinc-500">
                      <span>{t('sqlite.affectedRows')}:</span>
                      <strong className="text-purple-400 font-bold">{queryResult.changes}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results Viewer Bento */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-zinc-800 dark:text-neutral-200 flex items-center gap-2">
                <TableIcon size={15} className="text-sky-500" />
                Query Execution Result
              </span>

              {queryResult?.rows && queryResult.rows.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(queryResult.rows, null, 2))}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 text-xs font-mono"
                  >
                    {copiedQuery ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>JSON</span>
                  </button>
                </div>
              )}
            </div>

            {queryResult?.error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 font-mono text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle size={15} />
                  <span>SQLite Query Syntax / Execution Error:</span>
                </div>
                <div className="text-rose-500 text-[11px] whitespace-pre-wrap">{queryResult.error}</div>
              </div>
            )}

            {queryResult?.success && queryResult.rows.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 dark:border-neutral-800 overflow-hidden font-mono text-xs">
                <div className="overflow-x-auto max-h-96 scrollbar-thin">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-100 dark:bg-neutral-950 border-b border-zinc-200 dark:border-neutral-800 sticky top-0">
                      <tr>
                        {queryResult.columns.map((col) => (
                          <th key={col} className="p-2.5 text-[11px] font-bold text-zinc-700 dark:text-neutral-300">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-neutral-800/80 bg-white dark:bg-neutral-900">
                      {queryResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-neutral-800/50 transition-colors">
                          {queryResult.columns.map((col) => (
                            <td key={col} className="p-2.5 text-zinc-800 dark:text-neutral-300 text-[11px] truncate max-w-xs">
                              {row[col] === null || row[col] === undefined
                                ? <span className="text-zinc-400 italic">null</span>
                                : typeof row[col] === 'object'
                                ? JSON.stringify(row[col])
                                : String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {queryResult?.success && queryResult.rows.length === 0 && !queryResult.error && (
              <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 text-center font-mono text-xs text-zinc-500">
                {t('sqlite.emptyResults')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Table Browser */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Table Selector */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs space-y-3">
            <span className="text-xs font-mono font-bold text-zinc-600 dark:text-neutral-400 uppercase tracking-wider block">
              Tables in Database ({dbStatus?.tables.length || 0})
            </span>
            <div className="space-y-1.5">
              {dbStatus?.tables.map((tbl) => {
                const isSelected = selectedTableName === tbl.name;
                return (
                  <button
                    key={tbl.name}
                    onClick={() => fetchTableData(tbl.name)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold'
                        : 'bg-zinc-50 dark:bg-neutral-950 text-zinc-700 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TableIcon size={13} className={isSelected ? 'text-emerald-500' : 'text-zinc-400'} />
                      <span className="truncate">{tbl.name}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 font-bold">
                      {tbl.rowCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Table Data View */}
          <div className="md:col-span-3 p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                    Table: {selectedTableName}
                  </h3>
                  <span className="text-xs font-mono text-zinc-500">
                    ({tableData.length} records loaded)
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1">
                  Columns: {tableColumns.join(', ')}
                </div>
              </div>

              {/* Table search filter */}
              <div className="relative w-full sm:w-56">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Filter records..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-800 dark:text-neutral-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Records Table */}
            <div className="rounded-2xl border border-zinc-200 dark:border-neutral-800 overflow-hidden font-mono text-xs">
              <div className="overflow-x-auto max-h-96 scrollbar-thin">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-100 dark:bg-neutral-950 border-b border-zinc-200 dark:border-neutral-800 sticky top-0">
                    <tr>
                      {tableColumns.map((col) => (
                        <th key={col} className="p-2.5 text-[11px] font-bold text-zinc-700 dark:text-neutral-300">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-neutral-800/80 bg-white dark:bg-neutral-900">
                    {filteredTableRows.length === 0 ? (
                      <tr>
                        <td colSpan={tableColumns.length || 1} className="p-6 text-center text-zinc-500">
                          No records match search filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTableRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-neutral-800/50 transition-colors">
                          {tableColumns.map((col) => (
                            <td key={col} className="p-2.5 text-zinc-800 dark:text-neutral-300 text-[11px] truncate max-w-xs">
                              {row[col] === null || row[col] === undefined
                                ? <span className="text-zinc-400 italic">null</span>
                                : typeof row[col] === 'object'
                                ? JSON.stringify(row[col])
                                : String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Directus Container Bridge */}
      {activeTab === 'directus' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center">
                    <Container size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {t('sqlite.directusTitle')}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-neutral-400 max-w-2xl">
                  {t('sqlite.directusDesc')}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Directus 11+ Ready
              </span>
            </div>

            {/* Directus Endpoint Config Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                  {t('sqlite.directusUrl')}
                </label>
                <input
                  type="text"
                  value={directusUrl}
                  onChange={(e) => setDirectusUrl(e.target.value)}
                  placeholder="http://directus:8055 or https://your-directus.app"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] font-mono text-zinc-400">
                  Internal docker-compose network hostname: <code className="text-purple-400">http://directus:8055</code>
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                  {t('sqlite.directusToken')}
                </label>
                <input
                  type="password"
                  value={directusToken}
                  onChange={(e) => setDirectusToken(e.target.value)}
                  placeholder="Bearer token or static token..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] font-mono text-zinc-400">
                  Stored securely in SQLite table <code className="text-purple-400">directus_settings</code>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                id="directus-test-btn"
                onClick={handleTestDirectus}
                disabled={directusTesting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold transition-all shadow-xs"
              >
                <Network size={14} className={directusTesting ? 'animate-spin' : ''} />
                <span>{directusTesting ? 'Pinging Directus...' : t('sqlite.directusTestBtn')}</span>
              </button>

              <button
                onClick={handleSaveDirectusConfig}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 font-mono text-xs font-semibold transition-all border border-zinc-200 dark:border-neutral-700"
              >
                {directusSaved ? <Check size={14} className="text-emerald-500" /> : <HardDrive size={14} />}
                <span>{directusSaved ? 'Saved in SQLite!' : t('sqlite.directusSaveBtn')}</span>
              </button>

              <button
                onClick={handleFetchCollections}
                disabled={loadingCollections}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 font-mono text-xs font-semibold transition-all border border-zinc-200 dark:border-neutral-700"
              >
                <Layers size={14} className={loadingCollections ? 'animate-spin' : ''} />
                <span>{t('sqlite.directusCollections')}</span>
              </button>
            </div>

            {/* Test Result Card */}
            {directusResult && (
              <div
                className={`p-4 rounded-2xl border font-mono text-xs space-y-2 ${
                  directusResult.connected
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    {directusResult.connected ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span>
                      {directusResult.connected
                        ? t('sqlite.directusConnected')
                        : t('sqlite.directusFailed')}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold">
                    Latency: {directusResult.latencyMs}ms | Status: {directusResult.status || 'No Response'}
                  </span>
                </div>

                <div className="text-[11px] leading-relaxed">
                  Endpoint: <code className="font-bold">{directusResult.endpoint}</code>
                </div>

                {directusResult.hint && (
                  <div className="p-2.5 rounded-xl bg-black/20 text-[11px] text-zinc-300">
                    💡 <strong>Tip:</strong> {directusResult.hint}
                  </div>
                )}

                {directusResult.response && (
                  <pre className="p-2.5 rounded-xl bg-black/40 text-[10px] text-zinc-200 overflow-x-auto">
                    {JSON.stringify(directusResult.response, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Collections Schema View if available */}
            {directusCollections && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 space-y-3">
                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                  Directus Collections ({directusCollections.length})
                </span>
                {directusCollections.length === 0 ? (
                  <p className="text-xs font-mono text-zinc-400">No public collections found or authentication required.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {directusCollections.map((col: any) => (
                      <div key={col.collection} className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 text-xs font-mono">
                        <strong className="text-purple-400">{col.collection}</strong>
                        <span className="text-[10px] text-zinc-400 block">{col.note || 'Collection schema'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Docker & Compose Blueprint */}
      {activeTab === 'docker' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Docker Compose Blueprint Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Container size={16} className="text-emerald-500" />
                <span className="font-mono text-xs font-bold text-zinc-800 dark:text-neutral-200">
                  docker-compose.yml (Volume + Directus)
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(`version: '3.8'

services:
  app:
    build: .
    container_name: nextjs_arena_app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATA_DIR=/data
      - DIRECTUS_URL=http://directus:8055
    volumes:
      - arena_sqlite_data:/data
    networks:
      - arena_network
    depends_on:
      - directus

  directus:
    image: directus/directus:latest
    container_name: nextjs_arena_directus
    ports:
      - "8055:8055"
    environment:
      KEY: "27db0fac-8197-4402-9905-b1a1c97a9f8f"
      SECRET: "6d1f9746-88a9-4a0b-93ff-1833190df189"
      ADMIN_EMAIL: "admin@example.com"
      ADMIN_PASSWORD: "admin"
      DB_CLIENT: "sqlite3"
      DB_FILENAME: "/directus/database/data.db"
    volumes:
      - directus_database:/directus/database
      - directus_uploads:/directus/uploads
    networks:
      - arena_network

volumes:
  arena_sqlite_data:
    driver: local
  directus_database:
    driver: local
  directus_uploads:
    driver: local

networks:
  arena_network:
    driver: bridge`)
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 text-xs font-mono"
              >
                {copiedQuery ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>

            <pre className="p-3 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-zinc-800 max-h-80 scrollbar-thin">
{`version: '3.8'

services:
  app:
    build: .
    container_name: nextjs_arena_app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATA_DIR=/data
      - DIRECTUS_URL=http://directus:8055
    volumes:
      # Persistent Volume for SQLite Database & WAL logs
      - arena_sqlite_data:/data
    networks:
      - arena_network
    depends_on:
      - directus

  directus:
    image: directus/directus:latest
    container_name: nextjs_arena_directus
    ports:
      - "8055:8055"
    environment:
      KEY: "27db0fac-8197-4402-9905-b1a1c97a9f8f"
      SECRET: "6d1f9746-88a9-4a0b-93ff-1833190df189"
      ADMIN_EMAIL: "admin@example.com"
      ADMIN_PASSWORD: "admin"
      DB_CLIENT: "sqlite3"
      DB_FILENAME: "/directus/database/data.db"
    volumes:
      - directus_database:/directus/database
      - directus_uploads:/directus/uploads
    networks:
      - arena_network

volumes:
  arena_sqlite_data:
    driver: local
  directus_database:
    driver: local
  directus_uploads:
    driver: local

networks:
  arena_network:
    driver: bridge`}
            </pre>
          </div>

          {/* Dockerfile Blueprint Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode size={16} className="text-sky-500" />
                <span className="font-mono text-xs font-bold text-zinc-800 dark:text-neutral-200">
                  Dockerfile (Node 24 LTS + VOLUME ["/data"])
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(`FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

RUN mkdir -p /data && chown -R node:node /data
VOLUME ["/data"]

COPY package*.json ./
RUN npm install --omit=dev --no-audit
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/server.cjs"]`)
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 text-xs font-mono"
              >
                {copiedQuery ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>

            <pre className="p-3 rounded-2xl bg-zinc-950 text-sky-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-zinc-800 max-h-80 scrollbar-thin">
{`FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

# Create persistent storage folder & declare volume
RUN mkdir -p /data && chown -R node:node /data
VOLUME ["/data"]

COPY package*.json ./
RUN npm install --omit=dev --no-audit
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/server.cjs"]`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

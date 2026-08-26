export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'deneme' | 'fikir' | 'not' | 'todo';
  completed: boolean;
  createdAt: string;
}

export interface ApiLog {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: number;
  durationMs: number;
  timestamp: string;
  response: any;
}

export interface TestCase {
  id: string;
  name: string;
  category: 
    | 'Server Actions' 
    | 'App Router' 
    | 'Hydration' 
    | 'Middleware' 
    | 'Edge Streaming' 
    | 'Turbopack Cache' 
    | 'Instant Navigations' 
    | 'React Compiler'
    | 'PPR & Suspense'
    | 'Chaos & Concurrency'
    | 'Async Context'
    | 'Security & CSRF';
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  executionTime?: number;
  assertions: { name: string; passed: boolean; message?: string }[];
  codeSample: string;
  stressLevel?: 'Normal' | 'Hardcore' | 'Extreme';
  edgeCaseNote?: string;
}

export interface BenchmarkResult {
  id: string;
  name: string;
  opsPerSec: number;
  latencyMs: number;
  memoryDeltaMb: number;
  status: 'ready' | 'running' | 'completed' | 'success';
}

export interface SecurityCheckItem {
  id: string;
  title: string;
  desc: string;
  status: 'pass' | 'passed' | 'warning' | 'info';
  score: string;
  cveId?: string;
}

export type ActiveTab = 
  | 'overview' 
  | 'test-arena' 
  | 'ws-monitor'
  | 'performance-lab' 
  | 'stress-lab'
  | 'edge-sandbox'
  | 'compiler-inspector'
  | 'cache-lab'
  | 'og-metadata'
  | 'api-simulator' 
  | 'server-actions-lab'
  | 'middleware-inspector'
  | 'docker-cockpit'
  | 'scratchpad' 
  | 'sqlite-studio'
  | 'tools';

export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface WsEventRecord {
  id: string;
  timestamp: string;
  epochMs: number;
  direction: 'incoming' | 'outgoing' | 'system';
  channel: string;
  eventName: string;
  payload: any;
  payloadSize: number;
  latencyMs?: number;
  status: 'ok' | 'warn' | 'error';
  rawString?: string;
}

export interface WsClientMetrics {
  messagesReceived: number;
  messagesSent: number;
  bytesReceived: number;
  bytesSent: number;
  connectionUptimeSec: number;
  activeChannels: string[];
  reconnectAttempts: number;
  lastPingMs: number;
  serverClientsCount: number;
}

export interface StressSamplePoint {
  index: number;
  timeLabel: string;
  latency: number;
  avgLatency: number;
  p95Latency: number;
  successRate: number;
  rps: number;
  status: number;
  isError: boolean;
}

export interface StressLogEntry {
  id: string;
  requestId: number;
  endpoint: string;
  status: number;
  latencyMs: number;
  timestamp: string;
  error?: string;
}

export interface StressSummaryStats {
  totalSent: number;
  completed: number;
  successful: number;
  failed: number;
  successRatePct: number;
  minLatencyMs: number;
  avgLatencyMs: number;
  maxLatencyMs: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  currentRps: number;
  peakRps: number;
  elapsedSec: number;
}

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: any;
  pk: boolean;
}

export interface ForeignKeyInfo {
  id: number;
  seq: number;
  targetTable: string;
  fromColumn: string;
  toColumn: string;
  onUpdate: string;
  onDelete: string;
}

export interface TableIndexInfo {
  name: string;
  unique: boolean;
  origin: string;
  partial: boolean;
}

export interface TableSchemaDetail {
  name: string;
  rowCount: number;
  sql: string;
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
  indexes: TableIndexInfo[];
  primaryKeys: string[];
  inferredRelations?: Array<{
    targetTable: string;
    fromColumn: string;
    toColumn: string;
    relationType: '1:N' | 'N:1' | '1:1';
  }>;
}

export interface DbFullSchema {
  tables: TableSchemaDetail[];
  totalTables: number;
  totalColumns: number;
  totalForeignKeys: number;
  ddlScript: string;
}


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
  | 'edge-scraper'
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

export interface ScraperResult {
  success: boolean;
  url: string;
  httpStatus: number;
  httpStatusText: string;
  timings: {
    ttfbMs: number;
    totalLatencyMs: number;
    htmlSizeKb: number;
    elementsCount: number;
  };
  meta: {
    title: string;
    description: string;
    canonical: string;
    favicon: string;
  };
  framework: {
    isNextJs: boolean;
    routerType: string;
    hasTurbopack: boolean;
    hasPpr: boolean;
    nextData: { page: string; buildId: string } | null;
    rscChunksFound: number;
  };
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
  jsonLd: any[];
  rscFlightChunks: Array<{ index: number; rawChunk: string; parsedContent?: any }>;
  headings: Array<{ level: string; text: string }>;
  assets: {
    scriptsCount: number;
    stylesheetsCount: number;
    imagesCount: number;
    nextOptimizedImages: number;
    scriptsSample: string[];
    stylesheetsSample: string[];
    imagesSample: Array<{ src: string; alt: string; loading: string; isNextImage: boolean }>;
    linksCount: number;
  };
  security: {
    hasCsp: boolean;
    hasHsts: boolean;
    hasXContentType: boolean;
    hasXFrameOptions: boolean;
    serverHeader: string;
    cacheControl: string;
  };
  headers: Record<string, string>;
  previewSnippet: string;
  crawledAt: string;
  error?: string;
}

export interface BenchmarkRaceItem {
  url: string;
  status: number;
  ttfbMs: number;
  totalMs: number;
  sizeKb: number;
  isNextJs: boolean;
  server: string;
  success: boolean;
  error?: string;
}

export interface TurbopackBenchmarkResult {
  modulesTranspiled: number;
  totalCodeBytes: number;
  speedupMultiplier: number;
  benchmarks: {
    turbopackRust: {
      name: string;
      timeMs: number;
      throughputModsPerSec: number;
      memoryDeltaMb: number;
      coldStartTimeMs: number;
      hmrUpdateMs: number;
    };
    swcNative: {
      name: string;
      timeMs: number;
      throughputModsPerSec: number;
      memoryDeltaMb: number;
      coldStartTimeMs: number;
      hmrUpdateMs: number;
    };
    webpackClassic: {
      name: string;
      timeMs: number;
      throughputModsPerSec: number;
      memoryDeltaMb: number;
      coldStartTimeMs: number;
      hmrUpdateMs: number;
    };
  };
  timestamp: string;
}

export interface IsrStressResult {
  totalRequests: number;
  totalDurationMs: number;
  rps: number;
  cacheHits: number;
  cacheMisses: number;
  staleServed: number;
  revalidationsTriggered: number;
  hitRatePercent: number;
  averageLatencyMs: number;
  samples: Array<{ id: number; tag: string; latencyMs: number; status: 'HIT' | 'MISS' | 'STALE' | 'REVALIDATED' }>;
  timestamp: string;
}

export interface BundlePackageItem {
  id: string;
  name: string;
  category: 'framework' | 'ui' | 'data-engine' | 'charts' | 'styling' | 'app' | 'utility' | 'sdk' | 'wasm';
  sizeKb: number;
  previousSizeKb?: number;
  deltaKb?: number;
  growthPercentage?: number;
  growthSeverity?: 'critical' | 'high' | 'moderate' | 'stable' | 'reduced';
  growthReason?: string;
  gzipKb: number;
  brotliKb: number;
  percentage: number;
  path: string;
  version?: string;
  isInitial: boolean;
  chunksCount?: number;
  treeShakingEfficiencyPct?: number;
  dependencies?: string[];
  description?: string;
}

export interface BundleGroupNode {
  name: string;
  category?: string;
  children?: (BundleGroupNode | BundlePackageItem)[];
  sizeKb?: number;
  previousSizeKb?: number;
  deltaKb?: number;
  growthPercentage?: number;
  growthSeverity?: 'critical' | 'high' | 'moderate' | 'stable' | 'reduced';
  growthReason?: string;
  gzipKb?: number;
  brotliKb?: number;
  color?: string;
  description?: string;
}

export interface BundleStatsResponse {
  success: boolean;
  totalSizeKb: number;
  previousBuildTotalSizeKb?: number;
  totalGrowthKb?: number;
  totalGrowthPercentage?: number;
  previousBuildTag?: string;
  currentBuildTag?: string;
  totalGzipKb: number;
  totalBrotliKb: number;
  totalModules: number;
  totalPackages: number;
  buildTarget: string;
  bundler: string;
  builtAt: string;
  chunks: Array<{
    name: string;
    sizeKb: number;
    gzipKb: number;
    type: 'initial' | 'async' | 'css' | 'wasm';
    modulesCount: number;
  }>;
  packages: BundlePackageItem[];
  treeData: BundleGroupNode;
  categorySummary: Array<{
    category: string;
    label: string;
    totalSizeKb: number;
    totalGzipKb: number;
    packageCount: number;
    percentage: number;
    color: string;
  }>;
}



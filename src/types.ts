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
  | 'performance-lab' 
  | 'edge-sandbox'
  | 'compiler-inspector'
  | 'cache-lab'
  | 'og-metadata'
  | 'api-simulator' 
  | 'scratchpad' 
  | 'tools';

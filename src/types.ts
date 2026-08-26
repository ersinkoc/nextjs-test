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
  category: 'Server Actions' | 'App Router' | 'Hydration' | 'Middleware' | 'Edge Streaming' | 'Turbopack Cache' | 'Instant Navigations' | 'React Compiler';
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  executionTime?: number;
  assertions: { name: string; passed: boolean; message?: string }[];
  codeSample: string;
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
}

export type ActiveTab = 'overview' | 'api-simulator' | 'test-arena' | 'performance-lab' | 'scratchpad' | 'tools';

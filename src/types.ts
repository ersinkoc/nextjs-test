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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: number;
  durationMs: number;
  timestamp: string;
  response: any;
}

export type ActiveTab = 'overview' | 'api-simulator' | 'scratchpad' | 'tools';

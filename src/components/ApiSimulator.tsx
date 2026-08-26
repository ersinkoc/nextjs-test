import React, { useState } from 'react';
import { Terminal, Play, Server, RefreshCw, CheckCircle2, Code2, Clock, Activity, Cpu } from 'lucide-react';
import { ApiLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';

export const ApiSimulator: React.FC = () => {
  const { t, language } = useI18n();

  const [selectedEndpoint, setSelectedEndpoint] = useState<'users' | 'server-action' | 'stream' | 'health'>('users');
  const [latency, setLatency] = useState<number>(300);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'response' | 'code'>('response');
  const [streamChunks, setStreamChunks] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState<any>({
    status: 200,
    message: language === 'tr' 
      ? 'Test etmeye hazır. "İsteği Çalıştır" butonuna tıklayarak simülasyonu başlatın.' 
      : 'Ready to test. Click "Execute Request" to launch the simulation.',
    data: null,
  });
  const [logs, setLogs] = useState<ApiLog[]>([
    {
      id: 'init-1',
      endpoint: '/api/users',
      method: 'GET',
      status: 200,
      durationMs: 24,
      timestamp: new Date().toLocaleTimeString(),
      response: { count: 4, runtime: 'edge' },
    },
  ]);

  const endpoints = [
    {
      id: 'users',
      name: 'GET /api/users',
      desc: language === 'tr' ? 'Next.js App Router Route Handler' : 'Next.js App Router Route Handler',
      method: 'GET' as const,
      type: 'Route Handler',
    },
    {
      id: 'server-action',
      name: 'POST createRecord()',
      desc: language === 'tr' ? 'Next.js Server Action ("use server")' : 'Next.js Server Action ("use server")',
      method: 'POST' as const,
      type: 'Server Action',
    },
    {
      id: 'stream',
      name: 'GET /api/stream',
      desc: language === 'tr' ? 'Edge Runtime Streamed Response' : 'Edge Runtime Streamed Response',
      method: 'GET' as const,
      type: 'Streaming API',
    },
    {
      id: 'health',
      name: 'GET /api/health',
      desc: language === 'tr' ? 'Sistem Durum & Latency Kontrolü' : 'System Health & Latency Probe',
      method: 'GET' as const,
      type: 'Micro-Check',
    },
  ];

  const handleExecute = async () => {
    setIsLoading(true);
    setStreamChunks([]);
    const startTime = performance.now();

    if (selectedEndpoint === 'stream') {
      const chunks = language === 'tr' ? [
        'Bağlantı kuruldu (HTTP/2 200 OK)...',
        'Model başlatılıyor -> Edge Node [fra1]...',
        'Veri akışı 1: Tokenler yükleniyor...',
        'Veri akışı 2: Analiz tamamlandı -> { status: "Success" }',
        'Stream tamamlandı.',
      ] : [
        'Connection established (HTTP/2 200 OK)...',
        'Model initializing -> Edge Node [fra1]...',
        'Data chunk 1: Tokens streaming in...',
        'Data chunk 2: Analysis complete -> { status: "Success" }',
        'Stream completed successfully.',
      ];

      for (let i = 0; i < chunks.length; i++) {
        await new Promise((res) => setTimeout(res, latency / chunks.length + 120));
        setStreamChunks((prev) => [...prev, chunks[i]]);
      }

      const duration = Math.round(performance.now() - startTime);
      const resPayload = {
        streaming: true,
        chunksReceived: chunks.length,
        status: 'Stream completed successfully',
        timestamp: new Date().toISOString(),
      };
      setCurrentResponse(resPayload);
      addLog('/api/stream', 'GET', 200, duration, resPayload);
      setIsLoading(false);
      return;
    }

    await new Promise((res) => setTimeout(res, latency));

    let resPayload: any = {};
    let method: 'GET' | 'POST' = 'GET';
    let path = '/api/' + selectedEndpoint;

    switch (selectedEndpoint) {
      case 'users':
        method = 'GET';
        path = '/api/users';
        resPayload = {
          success: true,
          total: 4,
          data: [
            { id: 'usr_101', name: 'Ersin Koç', role: 'Fullstack Dev', status: 'Active' },
            { id: 'usr_102', name: 'Elif Yılmaz', role: 'UI/UX Designer', status: 'Online' },
            { id: 'usr_103', name: 'Burak Demir', role: 'DevOps Engineer', status: 'Idle' },
            { id: 'usr_104', name: 'Deniz Kaya', role: 'Product Manager', status: 'Active' },
          ],
          cache: 'HIT (s-maxage=60, stale-while-revalidate)',
          generatedAt: new Date().toISOString(),
        };
        break;

      case 'server-action':
        method = 'POST';
        path = 'action:createRecord()';
        resPayload = {
          actionExecuted: true,
          revalidatedPaths: ['/', '/dashboard'],
          createdRecord: {
            id: 'rec_' + Math.random().toString(36).substring(2, 8),
            title: language === 'tr' ? 'Yeni Deneme Kaydı' : 'New Experimental Record',
            serverExecutedAt: new Date().toISOString(),
            status: 'Persisted to DB',
          },
          cookies: { session_token: 'valid_v15_sig' },
        };
        break;

      case 'health':
        method = 'GET';
        path = '/api/health';
        resPayload = {
          status: 'healthy',
          uptime: '99.99%',
          runtime: 'Node.js 22 LTS (Active) & Edge compatible',
          memoryUsage: { rss: '38MB', heapUsed: '16MB' },
          framework: 'Next.js 15.2.0',
          env: 'production',
        };
        break;
    }

    const duration = Math.round(performance.now() - startTime);
    setCurrentResponse(resPayload);
    addLog(path, method, 200, duration, resPayload);
    setIsLoading(false);
  };

  const addLog = (
    endpoint: string,
    method: 'GET' | 'POST',
    status: number,
    durationMs: number,
    response: any
  ) => {
    const newLog: ApiLog = {
      id: Math.random().toString(36).substring(2, 9),
      endpoint,
      method,
      status,
      durationMs,
      timestamp: new Date().toLocaleTimeString(),
      response,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 6)]);
  };

  const codeSnippets: Record<string, string> = {
    users: `// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.user.findMany({ take: 10 });
  
  return NextResponse.json({
    success: true,
    data: users,
    cachedAt: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  });
}`,
    'server-action': `// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache';

export async function createRecord(formData: FormData) {
  const title = formData.get('title') as string;
  
  const newRecord = await db.records.create({
    data: { title, createdAt: new Date() }
  });
  
  // Revalidate the page cache instantly
  revalidatePath('/');
  return { success: true, record: newRecord };
}`,
    stream: `// app/api/stream/route.ts
export const runtime = 'edge';

export async function GET() {
  const encoder = new TextEncoder();
  const customStream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('Stream data start...\\n'));
      await new Promise(r => setTimeout(r, 400));
      controller.enqueue(encoder.encode('Processing with AI model...\\n'));
      controller.close();
    }
  });

  return new Response(customStream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}`,
    health: `// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    runtime: 'Node.js 22 LTS',
    nextVersion: '15.2.0',
    timestamp: Date.now()
  });
}`,
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-neutral-800 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Server className="w-3.5 h-3.5 text-emerald-500" />
            {t('api.badge')}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
            {t('api.title')}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-neutral-950 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-neutral-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-zinc-500 dark:text-neutral-400 text-[11px] font-mono">{t('api.latency')}:</span>
            <select
              value={latency}
              onChange={(e) => setLatency(Number(e.target.value))}
              className="bg-transparent font-mono text-zinc-900 dark:text-white text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value={50} className="bg-white dark:bg-neutral-900">{t('api.fast')}</option>
              <option value={300} className="bg-white dark:bg-neutral-900">{t('api.standard')}</option>
              <option value={800} className="bg-white dark:bg-neutral-900">{t('api.slow')}</option>
            </select>
          </div>

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isLoading ? t('api.executing') : t('api.execute')}</span>
          </button>
        </div>
      </div>

      {/* Endpoint Cards Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {endpoints.map((ep) => {
          const isSelected = selectedEndpoint === ep.id;
          return (
            <button
              key={ep.id}
              onClick={() => {
                setSelectedEndpoint(ep.id as any);
                setStreamChunks([]);
              }}
              className={`p-4 text-left rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
                  : 'border-zinc-200 dark:border-neutral-800 bg-zinc-50 dark:bg-neutral-950 hover:border-zinc-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    ep.method === 'GET'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-neutral-500 font-mono">{ep.type}</span>
              </div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                {ep.name}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-1">{ep.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Code vs Response Bento Viewer */}
      <div className="border border-zinc-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950 text-neutral-100 shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('response')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 font-medium cursor-pointer ${
                activeView === 'response'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('api.responseTab')}</span>
            </button>
            <button
              onClick={() => setActiveView('code')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 font-medium cursor-pointer ${
                activeView === 'code'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('api.codeTab')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>HTTP/2 200 OK</span>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-4 sm:p-5 font-mono text-xs overflow-x-auto min-h-[190px] max-h-[290px]">
          {activeView === 'response' ? (
            selectedEndpoint === 'stream' && streamChunks.length > 0 ? (
              <div className="space-y-1.5 text-emerald-400">
                {streamChunks.map((chunk, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-neutral-600 select-none">[{idx + 1}]</span>
                    <span>{chunk}</span>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(currentResponse, null, 2)}
              </pre>
            )
          ) : (
            <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
              {codeSnippets[selectedEndpoint] || '// Kod yüklenemedi'}
            </pre>
          )}
        </div>
      </div>

      {/* Execution Logs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-500" />
            {t('api.requestLogs')} ({logs.length})
          </span>
          <span className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">Live Telemetry</span>
        </div>

        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 dark:bg-neutral-950 rounded-xl border border-zinc-200 dark:border-neutral-800 text-xs font-mono"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    log.method === 'GET'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {log.method}
                </span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {log.endpoint}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-neutral-400">
                <span className="text-emerald-500 font-bold">
                  {log.status} OK
                </span>
                <span>{log.durationMs}ms</span>
                <span className="text-zinc-400 dark:text-neutral-500">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Terminal, Play, Server, RefreshCw, CheckCircle2, Code2, Clock, Activity, Cpu } from 'lucide-react';
import { ApiLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';

export const ApiSimulator: React.FC = () => {
  const { t, language } = useI18n();

  const [selectedEndpoint, setSelectedEndpoint] = useState<'users' | 'server-action' | 'instant-nav' | 'health'>('users');
  const [latency, setLatency] = useState<number>(120);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'response' | 'code'>('response');
  const [streamChunks, setStreamChunks] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState<any>({
    status: 200,
    message: language === 'tr' 
      ? 'Next.js 16.3 API hazır. "İsteği Çalıştır" butonuna tıklayarak simülasyonu başlatın.' 
      : 'Next.js 16.3 API ready. Click "Execute Request" to launch the simulation.',
    data: null,
  });
  const [logs, setLogs] = useState<ApiLog[]>([
    {
      id: 'init-1',
      endpoint: '/api/users',
      method: 'GET',
      status: 200,
      durationMs: 14,
      timestamp: new Date().toLocaleTimeString(),
      response: { count: 4, runtime: 'edge', nextVersion: '16.3.3' },
    },
  ]);

  const endpoints = [
    {
      id: 'users',
      name: 'GET /api/users',
      desc: language === 'tr' ? 'Next.js 16 App Router Route Handler' : 'Next.js 16 App Router Route Handler',
      method: 'GET' as const,
      type: 'Route Handler',
    },
    {
      id: 'server-action',
      name: 'POST mutateRecord()',
      desc: language === 'tr' ? 'Next.js 16 Server Action ("use server")' : 'Next.js 16 Server Action ("use server")',
      method: 'POST' as const,
      type: 'Server Action',
    },
    {
      id: 'instant-nav',
      name: 'GET /api/instant-stream',
      desc: language === 'tr' ? 'Instant Navigations & Partial Prefetch Stream' : 'Instant Navigations & Partial Prefetch Stream',
      method: 'GET' as const,
      type: 'Instant Stream',
    },
    {
      id: 'health',
      name: 'GET /api/health',
      desc: language === 'tr' ? 'Node 24 LTS & Turbopack 16.3 Check' : 'Node 24 LTS & Turbopack 16.3 Check',
      method: 'GET' as const,
      type: 'Micro-Check',
    },
  ];

  const handleExecute = async () => {
    setIsLoading(true);
    setStreamChunks([]);
    const startTime = performance.now();

    if (selectedEndpoint === 'instant-nav') {
      const chunks = language === 'tr' ? [
        'Instant Prefetch kabuğu iletildi (<4KB, 12ms)...',
        'Rust React Compiler AST optimize edildi...',
        'PPR dinamik veri parçacığı 1 aktarılıyor...',
        'PPR dinamik veri parçacığı 2 tamamlandı -> { status: "Hydrated" }',
        'Instant Navigation döngüsü tamamlandı.',
      ] : [
        'Instant Prefetch shell delivered (<4KB, 12ms)...',
        'Rust React Compiler AST optimized...',
        'PPR dynamic hole 1 streaming in...',
        'PPR dynamic hole 2 resolved -> { status: "Hydrated" }',
        'Instant Navigation cycle completed.',
      ];

      for (let i = 0; i < chunks.length; i++) {
        await new Promise((res) => setTimeout(res, latency / chunks.length + 80));
        setStreamChunks((prev) => [...prev, chunks[i]]);
      }

      const duration = Math.round(performance.now() - startTime);
      const resPayload = {
        instantNav: true,
        partialPrefetch: 'hit',
        chunksReceived: chunks.length,
        version: 'Next.js 16.3.3',
        status: 'Instant navigation streamed smoothly',
        timestamp: new Date().toISOString(),
      };
      setCurrentResponse(resPayload);
      addLog('/api/instant-stream', 'GET', 200, duration, resPayload);
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
            { id: 'usr_101', name: 'Ersin Koç', role: 'Fullstack Architect', status: 'Active' },
            { id: 'usr_102', name: 'Elif Yılmaz', role: 'UI/UX Designer', status: 'Online' },
            { id: 'usr_103', name: 'Burak Demir', role: 'Performance Engineer', status: 'Idle' },
            { id: 'usr_104', name: 'Deniz Kaya', role: 'Product Manager', status: 'Active' },
          ],
          cache: 'HIT (s-maxage=60, stale-while-revalidate)',
          framework: 'Next.js 16.3.3',
          generatedAt: new Date().toISOString(),
        };
        break;

      case 'server-action':
        method = 'POST';
        path = 'action:mutateRecord()';
        resPayload = {
          actionExecuted: true,
          revalidatedPaths: ['/', '/dashboard'],
          createdRecord: {
            id: 'rec_' + Math.random().toString(36).substring(2, 8),
            title: language === 'tr' ? 'Next 16.3 Test Kaydı' : 'Next 16.3 Test Record',
            serverExecutedAt: new Date().toISOString(),
            status: 'Persisted with Rust Action Contract',
          },
          cookies: { session_token: 'valid_v16_sig' },
        };
        break;

      case 'health':
        method = 'GET';
        path = '/api/health';
        resPayload = {
          status: 'healthy',
          uptime: '100%',
          runtime: 'Node.js 24 LTS (Krypton) & Edge compatible',
          memoryUsage: { rss: '28MB', heapUsed: '12MB' },
          framework: 'Next.js 16.3.3',
          turbopack: { persistentCaching: true, compilerMemoryEviction: true },
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
    users: `// app/api/users/route.ts (Next.js 16.3)
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
    'server-action': `// app/actions.ts (Next.js 16.3)
'use server'

import { revalidatePath } from 'next/cache';

export async function mutateRecord(formData: FormData) {
  const title = formData.get('title') as string;
  
  const newRecord = await db.records.create({
    data: { title, createdAt: new Date() }
  });
  
  // Revalidate instant router cache
  revalidatePath('/');
  return { success: true, record: newRecord };
}`,
    'instant-nav': `// app/api/instant-stream/route.ts (Next.js 16.3)
export const runtime = 'edge';

export async function GET() {
  const encoder = new TextEncoder();
  const customStream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('Instant Prefetch shell delivered\\n'));
      await new Promise(r => setTimeout(r, 100));
      controller.enqueue(encoder.encode('PPR dynamic data stream completed\\n'));
      controller.close();
    }
  });

  return new Response(customStream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}`,
    health: `// app/api/health/route.ts (Next.js 16.3)
export async function GET() {
  return Response.json({
    status: 'healthy',
    runtime: 'Node.js 24 LTS (Krypton)',
    nextVersion: '16.3.3',
    turbopackCache: 'active',
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
              <option value={15} className="bg-white dark:bg-neutral-900">{t('api.fast')}</option>
              <option value={120} className="bg-white dark:bg-neutral-900">{t('api.standard')}</option>
              <option value={450} className="bg-white dark:bg-neutral-900">{t('api.slow')}</option>
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
                  ? 'bg-zinc-50 dark:bg-neutral-950 border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs'
                  : 'bg-zinc-50/50 dark:bg-neutral-950/40 border-zinc-200 dark:border-neutral-800/80 hover:border-zinc-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    ep.method === 'GET'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">
                  {ep.type}
                </span>
              </div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white font-mono truncate">
                {ep.name}
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-1 line-clamp-1">
                {ep.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Response and Code Preview Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Code and Live Response (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex bg-zinc-100 dark:bg-neutral-950 p-1 rounded-full border border-zinc-200 dark:border-neutral-800 text-xs">
              <button
                onClick={() => setActiveView('response')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  activeView === 'response'
                    ? 'bg-white dark:bg-neutral-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 dark:text-neutral-400'
                }`}
              >
                {t('api.responseTab')}
              </button>
              <button
                onClick={() => setActiveView('code')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  activeView === 'code'
                    ? 'bg-white dark:bg-neutral-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 dark:text-neutral-400'
                }`}
              >
                {t('api.codeTab')}
              </button>
            </div>

            <div className="text-[11px] font-mono text-zinc-400 dark:text-neutral-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Next.js 16.3 Handler</span>
            </div>
          </div>

          <div className="bg-neutral-950 rounded-2xl p-4 sm:p-5 border border-neutral-800 font-mono text-xs text-neutral-300 min-h-[220px] max-h-[340px] overflow-auto shadow-inner">
            {activeView === 'response' ? (
              selectedEndpoint === 'instant-nav' && streamChunks.length > 0 ? (
                <div className="space-y-1.5 text-cyan-400">
                  {streamChunks.map((chunk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-neutral-600">[{i + 1}]</span>
                      <span>{chunk}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="text-emerald-400">
                  {JSON.stringify(currentResponse, null, 2)}
                </pre>
              )
            ) : (
              <pre className="text-emerald-400/90 leading-relaxed">
                {codeSnippets[selectedEndpoint]}
              </pre>
            )}
          </div>
        </div>

        {/* Right Side: Request Telemetry Log Stream (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-50 dark:bg-neutral-950 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-neutral-800">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              {t('api.requestLogs')}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">
              {logs.length} logged
            </span>
          </div>

          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800/80 text-xs font-mono flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="space-y-0.5 truncate">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        log.method === 'GET'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-cyan-500/10 text-cyan-500'
                      }`}
                    >
                      {log.method}
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-neutral-200 truncate">
                      {log.endpoint}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-neutral-500">
                    {log.timestamp} &bull; {log.durationMs}ms
                  </div>
                </div>

                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

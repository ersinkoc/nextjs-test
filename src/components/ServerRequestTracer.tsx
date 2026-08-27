import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Zap,
  Shield,
  Layers,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Flame,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  FileCode,
  Globe,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';
import { audioFx } from '../utils/audioFx';

export type TraceType = 'server-action' | 'middleware' | 'route-handler' | 'rsc-flight';

export interface WaterfallStep {
  name: string;
  durationMs: number;
  status: 'passed' | 'warn' | 'error';
  detail: string;
}

export interface RequestTrace {
  id: string;
  timestamp: string;
  type: TraceType;
  actionName: string;
  path: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'MUTATION';
  durationMs: number;
  status: number;
  statusText: string;
  cacheState: 'HIT' | 'MISS' | 'BYPASS' | 'REVALIDATED';
  asyncContextId: string;
  memoryDeltaKb: number;
  headers: Record<string, string>;
  payload?: any;
  resultPayload?: any;
  waterfall: WaterfallStep[];
}

const INITIAL_TRACES: RequestTrace[] = [
  {
    id: 'tr_8f91a20',
    timestamp: '14:48:02.114',
    type: 'server-action',
    actionName: 'revalidateCacheTagAction',
    path: '/actions/cache/purge',
    method: 'POST',
    durationMs: 4.2,
    status: 200,
    statusText: 'REVALIDATED',
    cacheState: 'REVALIDATED',
    asyncContextId: 'ctx_0x8f21e',
    memoryDeltaKb: 12.4,
    headers: {
      'x-action-name': 'revalidateCacheTagAction',
      'x-nextjs-cache': 'PURGED',
      'x-forwarded-proto': 'https',
      'x-v8-isolate-id': 'v8_node24_main'
    },
    payload: { tag: 'analytics_summary', scope: 'app/overview' },
    resultPayload: { success: true, revalidatedTags: ['analytics_summary'], purgeTimestamp: 1772113682 },
    waterfall: [
      { name: 'CSRF Origin Verification', durationMs: 0.4, status: 'passed', detail: 'Origin matches allowed host' },
      { name: 'Node 24 Async Context Binding', durationMs: 0.3, status: 'passed', detail: 'Isolated store created' },
      { name: 'Cache Tag Invalidation Engine', durationMs: 2.8, status: 'passed', detail: 'Tagged entries evicted from edge buffer' },
      { name: 'Response Serialization', durationMs: 0.7, status: 'passed', detail: 'JSON payload serialized' }
    ]
  },
  {
    id: 'tr_7e44b91',
    timestamp: '14:48:01.890',
    type: 'middleware',
    actionName: 'edgeSecurityMiddleware',
    path: '/admin/settings',
    method: 'GET',
    durationMs: 1.8,
    status: 200,
    statusText: 'OK',
    cacheState: 'BYPASS',
    asyncContextId: 'ctx_0x33b1a',
    memoryDeltaKb: 4.1,
    headers: {
      'x-middleware-rewrite': '/admin/settings',
      'x-nextjs-arena-edge': 'v16.3-strict',
      'x-geo-country': 'TR',
      'x-geo-city': 'Istanbul'
    },
    payload: { url: '/admin/settings', cookies: ['session_token=jwt_sec_991'] },
    resultPayload: { next: true, injectedHeaders: 4, rewriteTarget: null },
    waterfall: [
      { name: 'Route Matcher Evaluation', durationMs: 0.2, status: 'passed', detail: 'Path matched /admin/** rule' },
      { name: 'JWT Signature Verification', durationMs: 1.1, status: 'passed', detail: 'HS256 verified at Edge' },
      { name: 'Security Header Injection', durationMs: 0.5, status: 'passed', detail: 'HSTS, CSP & nosniff injected' }
    ]
  },
  {
    id: 'tr_6a12c88',
    timestamp: '14:48:00.450',
    type: 'server-action',
    actionName: 'updateUserProfileMutation',
    path: '/actions/user/profile',
    method: 'MUTATION',
    durationMs: 18.6,
    status: 201,
    statusText: 'MUTATED',
    cacheState: 'BYPASS',
    asyncContextId: 'ctx_0x11e9f',
    memoryDeltaKb: 38.5,
    headers: {
      'x-action-name': 'updateUserProfileMutation',
      'x-sqlite-wal-checkpoint': 'PASS',
      'x-csrf-token': 'csrf_valid_9981'
    },
    payload: { userId: 'usr_4491', role: 'Staff Engineer', theme: 'system' },
    resultPayload: { updated: true, rowId: 4491, walLogSizeKb: 1.2 },
    waterfall: [
      { name: 'Origin & Form Mutex Lock', durationMs: 0.6, status: 'passed', detail: 'Mutex acquired for usr_4491' },
      { name: 'Zod Schema Validation', durationMs: 1.4, status: 'passed', detail: 'Payload conforms to schema' },
      { name: 'SQLite WAL Write Transaction', durationMs: 14.8, status: 'passed', detail: 'Row updated with immediate WAL sync' },
      { name: 'revalidatePath(/profile)', durationMs: 1.8, status: 'passed', detail: 'Path revalidated in memory' }
    ]
  },
  {
    id: 'tr_5d39f10',
    timestamp: '14:47:58.210',
    type: 'rsc-flight',
    actionName: 'renderRscFlightPayload',
    path: '/dashboard/analytics [RSC]',
    method: 'GET',
    durationMs: 6.4,
    status: 200,
    statusText: 'FLIGHT_STREAM',
    cacheState: 'HIT',
    asyncContextId: 'ctx_0x992aa',
    memoryDeltaKb: 22.0,
    headers: {
      'content-type': 'text/x-component; charset=utf-8',
      'x-rsc-chunk-count': '6',
      'x-nextjs-ppr-shell': '0ms_HIT'
    },
    payload: { prefetch: true, depth: 2 },
    resultPayload: { binaryChunks: 6, compressedBytes: 4180, streamTimeMs: 6.4 },
    waterfall: [
      { name: 'PPR Static Shell Fast Delivery', durationMs: 0.3, status: 'passed', detail: '0ms static shell dispatched' },
      { name: 'Async RSC Component Stream', durationMs: 5.2, status: 'passed', detail: 'Dynamic holes resolved concurrently' },
      { name: 'Binary Serializer Encode', durationMs: 0.9, status: 'passed', detail: 'Flight protocol wire format output' }
    ]
  },
  {
    id: 'tr_4c08e19',
    timestamp: '14:47:55.702',
    type: 'route-handler',
    actionName: 'GET /api/sqlite/status',
    path: '/api/sqlite/status',
    method: 'GET',
    durationMs: 3.1,
    status: 200,
    statusText: 'OK',
    cacheState: 'MISS',
    asyncContextId: 'ctx_0x77ab1',
    memoryDeltaKb: 8.3,
    headers: {
      'content-type': 'application/json',
      'x-sqlite-mode': 'WAL',
      'x-db-path': '/data/nextjs_arena.sqlite'
    },
    payload: {},
    resultPayload: { status: 'healthy', walSizeKb: 44, activeConnections: 1 },
    waterfall: [
      { name: 'Route Dispatch', durationMs: 0.2, status: 'passed', detail: 'Handler resolved in 0.2ms' },
      { name: 'PRAGMA schema query', durationMs: 2.4, status: 'passed', detail: 'SQLite integrity verified' },
      { name: 'JSON Serialization', durationMs: 0.5, status: 'passed', detail: 'Response streamed' }
    ]
  }
];

export const ServerRequestTracer: React.FC = () => {
  const { t, language } = useI18n();
  const [traces, setTraces] = useState<RequestTrace[]>(INITIAL_TRACES);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [selectedTrace, setSelectedTrace] = useState<RequestTrace | null>(INITIAL_TRACES[0]);
  const [typeFilter, setTypeFilter] = useState<'ALL' | TraceType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'MUTATION' | 'ERROR'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live traffic generator simulation
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const presets: Array<() => RequestTrace> = [
        () => ({
          id: `tr_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100),
          type: 'server-action',
          actionName: 'revalidateCacheTagAction',
          path: '/actions/cache/purge',
          method: 'POST',
          durationMs: Number((Math.random() * 5 + 2).toFixed(1)),
          status: 200,
          statusText: 'REVALIDATED',
          cacheState: 'REVALIDATED',
          asyncContextId: `ctx_0x${Math.random().toString(16).substring(2, 7)}`,
          memoryDeltaKb: Number((Math.random() * 20 + 5).toFixed(1)),
          headers: {
            'x-action-name': 'revalidateCacheTagAction',
            'x-nextjs-cache': 'PURGED',
            'x-v8-isolate': 'v8_node24_pool'
          },
          payload: { tag: 'products_v16', revalidatedBy: 'auto_cron' },
          resultPayload: { success: true, timestamp: Date.now() },
          waterfall: [
            { name: 'CSRF Token Check', durationMs: 0.3, status: 'passed', detail: 'Token valid' },
            { name: 'Cache Eviction', durationMs: 2.1, status: 'passed', detail: 'Tags invalidated' },
            { name: 'Response Stream', durationMs: 0.6, status: 'passed', detail: 'Payload finalized' }
          ]
        }),
        () => ({
          id: `tr_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100),
          type: 'middleware',
          actionName: 'geoRoutingMiddleware',
          path: '/app/dashboard',
          method: 'GET',
          durationMs: Number((Math.random() * 3 + 1).toFixed(1)),
          status: 200,
          statusText: 'OK',
          cacheState: 'BYPASS',
          asyncContextId: `ctx_0x${Math.random().toString(16).substring(2, 7)}`,
          memoryDeltaKb: Number((Math.random() * 8 + 2).toFixed(1)),
          headers: {
            'x-middleware-rewrite': '/app/dashboard',
            'x-nextjs-arena-edge': 'v16.3',
            'x-client-ip': '192.168.1.42'
          },
          payload: { path: '/app/dashboard' },
          resultPayload: { matched: true, allowed: true },
          waterfall: [
            { name: 'Matcher Evaluation', durationMs: 0.2, status: 'passed', detail: 'Matched pattern' },
            { name: 'Edge Headers Added', durationMs: 0.8, status: 'passed', detail: 'Headers injected' }
          ]
        }),
        () => ({
          id: `tr_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100),
          type: 'server-action',
          actionName: 'insertLogRecordAction',
          path: '/actions/sqlite/log',
          method: 'MUTATION',
          durationMs: Number((Math.random() * 16 + 8).toFixed(1)),
          status: 201,
          statusText: 'MUTATED',
          cacheState: 'BYPASS',
          asyncContextId: `ctx_0x${Math.random().toString(16).substring(2, 7)}`,
          memoryDeltaKb: Number((Math.random() * 30 + 10).toFixed(1)),
          headers: {
            'x-action-name': 'insertLogRecordAction',
            'x-sqlite-wal': 'SYNCHRONOUS'
          },
          payload: { event: 'user_action_dispatched', severity: 'info' },
          resultPayload: { inserted: true, rowCount: 1 },
          waterfall: [
            { name: 'Mutex Verification', durationMs: 0.5, status: 'passed', detail: 'Lock acquired' },
            { name: 'WAL Write', durationMs: 11.2, status: 'passed', detail: 'Written to /data volume' },
            { name: 'Memory Sync', durationMs: 1.4, status: 'passed', detail: 'State synchronized' }
          ]
        })
      ];

      const chosen = presets[Math.floor(Math.random() * presets.length)]();
      setTraces((prev) => [chosen, ...prev.slice(0, 49)]);
    }, 3800);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Dispatch manual mock action
  const dispatchMockAction = (scenario: 'revalidate' | 'middleware' | 'mutation' | 'csrf-error') => {
    audioFx.playTurbo();
    let newTrace: RequestTrace;
    const now = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);

    switch (scenario) {
      case 'revalidate':
        newTrace = {
          id: `act_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: now,
          type: 'server-action',
          actionName: 'revalidatePathAction("/dashboard")',
          path: '/actions/revalidate',
          method: 'POST',
          durationMs: 3.6,
          status: 200,
          statusText: 'REVALIDATED',
          cacheState: 'REVALIDATED',
          asyncContextId: `ctx_0x${Math.random().toString(16).substring(2, 7)}`,
          memoryDeltaKb: 14.2,
          headers: {
            'x-action': 'revalidatePath',
            'x-nextjs-cache': 'TAG_FLUSHED',
            'x-v8-isolate': 'v8_node24_main'
          },
          payload: { path: '/dashboard', type: 'page' },
          resultPayload: { revalidated: true, flushedAt: Date.now() },
          waterfall: [
            { name: 'CSRF Token Validation', durationMs: 0.3, status: 'passed', detail: 'Strict origin match' },
            { name: 'AsyncLocalStorage Context', durationMs: 0.2, status: 'passed', detail: 'Bound to current isolate' },
            { name: 'Next.js 16.3 Cache Revalidation', durationMs: 2.4, status: 'passed', detail: 'Memory cache tags purged' },
            { name: 'Wire Response Encode', durationMs: 0.7, status: 'passed', detail: 'Serialized cleanly' }
          ]
        };
        break;
      case 'middleware':
        newTrace = {
          id: `mid_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: now,
          type: 'middleware',
          actionName: 'edgeAuthMatcherMiddleware',
          path: '/api/protected/resources',
          method: 'GET',
          durationMs: 1.4,
          status: 200,
          statusText: 'OK',
          cacheState: 'BYPASS',
          asyncContextId: `ctx_0x${Math.random().toString(16).substring(2, 7)}`,
          memoryDeltaKb: 3.5,
          headers: {
            'x-middleware-rewrite': '/api/protected/resources',
            'x-authenticated-user': 'usr_dev_9912',
            'x-nextjs-arena-edge': 'v16.3'
          },
          payload: { route: '/api/protected/resources', token: 'Bearer valid_jwt' },
          resultPayload: { authorized: true, user: 'usr_dev_9912' },
          waterfall: [
            { name: 'Edge Matcher Rule', durationMs: 0.1, status: 'passed', detail: 'Path matched protected route' },
            { name: 'Auth Header Check', durationMs: 0.9, status: 'passed', detail: 'JWT valid and unexpired' },
            { name: 'NextResponse.next()', durationMs: 0.4, status: 'passed', detail: 'Request forwarded to handler' }
          ]
        };
        break;
      case 'mutation':
        newTrace = {
          id: `mut_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: now,
          type: 'server-action',
          actionName: 'createDatabaseInvoiceMutation',
          path: '/actions/billing/create-invoice',
          method: 'MUTATION',
          durationMs: 21.4,
          status: 201,
          statusText: 'MUTATED',
          cacheState: 'BYPASS',
          asyncContextId: `ctx_0x${Math.random().toString(16).substring(2, 7)}`,
          memoryDeltaKb: 45.0,
          headers: {
            'x-action-name': 'createDatabaseInvoiceMutation',
            'x-sqlite-wal-commit': 'TRUE',
            'x-csrf-guard': 'ENFORCED'
          },
          payload: { invoiceId: 'INV-2026-0941', amount: 1450.00, currency: 'USD', recipient: 'Acme Corp' },
          resultPayload: { invoiceId: 'INV-2026-0941', status: 'PAID', rowId: 941, walSyncMs: 16.2 },
          waterfall: [
            { name: 'Form Mutex & Deduplication', durationMs: 0.5, status: 'passed', detail: 'Duplicate submission prevented' },
            { name: 'Zod Invoice Schema Validate', durationMs: 1.2, status: 'passed', detail: 'All fields type-safe' },
            { name: 'SQLite WAL INSERT Transaction', durationMs: 17.5, status: 'passed', detail: 'Committed to SQLite /data database' },
            { name: 'revalidateTag("invoices")', durationMs: 2.2, status: 'passed', detail: 'Tag invalidated' }
          ]
        };
        break;
      case 'csrf-error':
        newTrace = {
          id: `sec_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: now,
          type: 'server-action',
          actionName: 'unauthorizedCrossSiteAction',
          path: '/actions/account/delete',
          method: 'POST',
          durationMs: 0.9,
          status: 403,
          statusText: 'CSRF_BLOCKED',
          cacheState: 'BYPASS',
          asyncContextId: `ctx_0x${Math.random().toString(16).substring(2, 7)}`,
          memoryDeltaKb: 1.2,
          headers: {
            'x-csrf-status': 'MISMATCH_ORIGIN',
            'x-security-violation': 'Origin header differs from Host'
          },
          payload: { maliciousOrigin: 'https://evil-cross-domain.com' },
          resultPayload: { error: 'Strict CSRF origin check failed. Request rejected by Next.js 16.3 core.' },
          waterfall: [
            { name: 'Next.js 16.3 CSRF Origin Check', durationMs: 0.6, status: 'error', detail: 'Origin rejected: https://evil-cross-domain.com' },
            { name: 'Immediate 403 Fast Return', durationMs: 0.3, status: 'warn', detail: 'Execution terminated before handler' }
          ]
        };
        break;
    }

    setTraces((prev) => [newTrace, ...prev]);
    setSelectedTrace(newTrace);
    if (scenario === 'csrf-error') {
      audioFx.playError();
    } else {
      audioFx.playSuccess();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    audioFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filtered traces calculation
  const filteredTraces = useMemo(() => {
    return traces.filter((trace) => {
      if (typeFilter !== 'ALL' && trace.type !== typeFilter) return false;

      if (statusFilter === 'SUCCESS') {
        if (trace.status < 200 || trace.status >= 400 || trace.method === 'MUTATION') return false;
      } else if (statusFilter === 'MUTATION') {
        if (trace.method !== 'MUTATION' && trace.statusText !== 'MUTATED') return false;
      } else if (statusFilter === 'ERROR') {
        if (trace.status < 400) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          trace.actionName.toLowerCase().includes(q) ||
          trace.path.toLowerCase().includes(q) ||
          trace.id.toLowerCase().includes(q) ||
          trace.statusText.toLowerCase().includes(q) ||
          trace.asyncContextId.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [traces, typeFilter, statusFilter, searchQuery]);

  // Telemetry Aggregates
  const stats = useMemo(() => {
    const total = traces.length;
    const avgDuration = total > 0 ? (traces.reduce((acc, t) => acc + t.durationMs, 0) / total).toFixed(1) : '0';
    const serverActionsCount = traces.filter((t) => t.type === 'server-action').length;
    const middlewareCount = traces.filter((t) => t.type === 'middleware').length;
    const errorCount = traces.filter((t) => t.status >= 400).length;
    const p95 = total > 0 ? traces.map((t) => t.durationMs).sort((a, b) => a - b)[Math.floor(total * 0.95)] || traces[0].durationMs : 0;

    return {
      total,
      avgDuration,
      serverActionsCount,
      middlewareCount,
      errorCount,
      p95: p95.toFixed(1)
    };
  }, [traces]);

  const exportTracesJson = () => {
    audioFx.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(traces, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nextjs_request_traces_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-5 font-mono">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white font-sans tracking-tight flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              {t('tracer.title')}
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {t('tracer.badge')}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1 font-sans">
            {t('tracer.desc')}
          </p>
        </div>

        {/* Action Dispatcher Buttons & Stream Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              audioFx.playClick();
              setIsLiveStreaming(!isLiveStreaming);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isLiveStreaming
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-zinc-100 dark:bg-neutral-800 border-zinc-200 dark:border-neutral-700 text-zinc-500'
            }`}
          >
            {isLiveStreaming ? <Pause size={13} /> : <Play size={13} />}
            <span>{isLiveStreaming ? t('tracer.streamActive') : t('tracer.streamPaused')}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportTracesJson}
            title={t('tracer.exportJson')}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-zinc-600 dark:text-neutral-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Download size={14} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              audioFx.playClick();
              setTraces([]);
              setSelectedTrace(null);
            }}
            title={t('tracer.clearBuffer')}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-zinc-600 dark:text-neutral-300 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
          </motion.button>
        </div>
      </div>

      {/* Dispatch Mock Actions Fast-Toolbar */}
      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-neutral-400">
          <Zap size={14} className="text-amber-500 shrink-0" />
          <span className="font-bold text-zinc-700 dark:text-neutral-200">{t('tracer.quickTrigger')}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => dispatchMockAction('revalidate')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Zap size={12} />
            <span>{t('tracer.btnRevalidate')}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => dispatchMockAction('middleware')}
            className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Shield size={12} />
            <span>{t('tracer.btnEdgeAuth')}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => dispatchMockAction('mutation')}
            className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Server size={12} />
            <span>{t('tracer.btnSqliteMutation')}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => dispatchMockAction('csrf-error')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <XCircle size={12} />
            <span>{t('tracer.btnCsrfError')}</span>
          </motion.button>
        </div>
      </div>

      {/* Aggregate Telemetry Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{t('tracer.statTotal')}</div>
          <div className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">{stats.total}</div>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{t('tracer.statAvgDuration')}</div>
          <div className="text-lg font-bold text-emerald-500 mt-0.5">{stats.avgDuration}ms</div>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{t('tracer.statP95')}</div>
          <div className="text-lg font-bold text-amber-500 mt-0.5">{stats.p95}ms</div>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{t('tracer.statServerActions')}</div>
          <div className="text-lg font-bold text-purple-500 mt-0.5">{stats.serverActionsCount}</div>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{t('tracer.statMiddleware')}</div>
          <div className="text-lg font-bold text-sky-500 mt-0.5">{stats.middlewareCount}</div>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{t('tracer.statErrors')}</div>
          <div className={`text-lg font-bold mt-0.5 ${stats.errorCount > 0 ? 'text-rose-500' : 'text-zinc-400'}`}>
            {stats.errorCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'server-action', 'middleware', 'route-handler', 'rsc-flight'] as const).map((type) => {
            const label =
              type === 'ALL'
                ? t('tracer.filterAll')
                : type === 'server-action'
                ? t('tracer.filterActions')
                : type === 'middleware'
                ? t('tracer.filterMiddleware')
                : type === 'route-handler'
                ? t('tracer.filterRoutes')
                : t('tracer.filterRsc');
            const isActive = typeFilter === type;
            return (
              <button
                key={type}
                onClick={() => {
                  audioFx.playClick();
                  setTypeFilter(type);
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-xs'
                    : 'bg-zinc-100 dark:bg-neutral-800 border-zinc-200 dark:border-neutral-700 text-zinc-600 dark:text-neutral-400 hover:text-zinc-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('tracer.searchPlaceholder')}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Tabular View & Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Traces Table (7 Cols on desktop) */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
          <div className="overflow-x-auto max-h-[460px] scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-zinc-100 dark:bg-neutral-900 border-b border-zinc-200 dark:border-neutral-800 text-[11px] font-bold text-zinc-500 dark:text-neutral-400 uppercase tracking-wider z-10">
                <tr>
                  <th className="p-2.5">{t('tracer.colTimeId')}</th>
                  <th className="p-2.5">{t('tracer.colType')}</th>
                  <th className="p-2.5">{t('tracer.colActionPath')}</th>
                  <th className="p-2.5 text-right">{t('tracer.colDuration')}</th>
                  <th className="p-2.5 text-center">{t('tracer.colStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-neutral-850">
                {filteredTraces.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-400">
                      {t('tracer.emptyTraces')}
                    </td>
                  </tr>
                ) : (
                  filteredTraces.map((trace) => {
                    const isSelected = selectedTrace?.id === trace.id;
                    const isError = trace.status >= 400;
                    const isFast = trace.durationMs <= 5;
                    const isSlow = trace.durationMs > 25;

                    return (
                      <tr
                        key={trace.id}
                        onClick={() => {
                          audioFx.playClick();
                          setSelectedTrace(trace);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/10 dark:bg-emerald-950/30'
                            : 'hover:bg-zinc-50 dark:hover:bg-neutral-900/50'
                        }`}
                      >
                        <td className="p-2.5 font-mono text-[11px] whitespace-nowrap">
                          <div className="font-bold text-zinc-900 dark:text-neutral-200">{trace.timestamp}</div>
                          <div className="text-[10px] text-zinc-400">{trace.id}</div>
                        </td>

                        <td className="p-2.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${
                              trace.type === 'server-action'
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                : trace.type === 'middleware'
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                                : trace.type === 'rsc-flight'
                                ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {trace.type === 'server-action'
                              ? 'ACTION'
                              : trace.type === 'middleware'
                              ? 'MIDDLEWARE'
                              : trace.type === 'rsc-flight'
                              ? 'RSC FLIGHT'
                              : 'ROUTE'}
                          </span>
                        </td>

                        <td className="p-2.5 max-w-[200px] truncate">
                          <div className="font-bold text-zinc-900 dark:text-white truncate" title={trace.actionName}>
                            {trace.actionName}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate" title={trace.path}>
                            {trace.path}
                          </div>
                        </td>

                        <td className="p-2.5 text-right font-mono font-bold whitespace-nowrap">
                          <span
                            className={
                              isFast
                                ? 'text-emerald-500'
                                : isSlow
                                ? 'text-rose-500'
                                : 'text-amber-500'
                            }
                          >
                            {trace.durationMs}ms
                          </span>
                        </td>

                        <td className="p-2.5 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isError
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                : trace.method === 'MUTATION'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            }`}
                          >
                            {trace.status} {trace.statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Trace Inspector (5 Cols on desktop) */}
        <div className="lg:col-span-5 p-4 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-zinc-50/50 dark:bg-neutral-950 space-y-4">
          {selectedTrace ? (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-neutral-800 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      {t('tracer.detailTitle')} {selectedTrace.id}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedTrace.id, 'trace-id')}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-0.5"
                    >
                      {copiedId === 'trace-id' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <span className="text-[11px] text-zinc-400">{selectedTrace.timestamp} • {t('tracer.isolateInfo')}</span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    selectedTrace.status >= 400
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  }`}
                >
                  {selectedTrace.durationMs}ms ({selectedTrace.status})
                </span>
              </div>

              {/* Execution Summary Tags */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800">
                  <span className="text-zinc-400 text-[10px] block">{t('tracer.asyncContext')}</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{selectedTrace.asyncContextId}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800">
                  <span className="text-zinc-400 text-[10px] block">{t('tracer.cacheState')}</span>
                  <span className="font-bold text-emerald-500">{selectedTrace.cacheState}</span>
                </div>
              </div>

              {/* Step-by-Step Waterfall Execution Breakdown */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-zinc-700 dark:text-neutral-300 uppercase tracking-wider">
                  {t('tracer.waterfallTitle')}
                </div>
                <div className="space-y-1.5">
                  {selectedTrace.waterfall.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900 dark:text-white text-[11px] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {step.name}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-500 font-bold">{step.durationMs}ms</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">{step.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Injected Headers View */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-zinc-700 dark:text-neutral-300 uppercase tracking-wider">
                  {t('tracer.headersTitle')}
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 text-[10px] font-mono text-emerald-400 border border-zinc-800 space-y-1 max-h-28 overflow-y-auto scrollbar-thin">
                  {Object.entries(selectedTrace.headers).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-zinc-500">{key}:</span>
                      <span className="text-emerald-400 font-bold truncate max-w-[200px]" title={val}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payload Preview */}
              {selectedTrace.payload && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-zinc-700 dark:text-neutral-300 uppercase tracking-wider">
                    {t('tracer.payloadTitle')}
                  </div>
                  <pre className="p-2.5 rounded-xl bg-zinc-950 text-[10px] font-mono text-zinc-300 border border-zinc-800 max-h-24 overflow-y-auto scrollbar-thin">
                    <code>{JSON.stringify(selectedTrace.payload, null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-400 text-xs">
              {t('tracer.selectHint')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

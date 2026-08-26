import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Activity,
  Zap,
  Play,
  Pause,
  Square,
  RefreshCw,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Gauge,
  TrendingUp,
  Server,
  Layers,
  Sparkles,
  Download,
  Copy,
  Check,
  Terminal,
  BarChart2,
  Radio,
  Flame,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { StressSamplePoint, StressLogEntry, StressSummaryStats } from '../types';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

interface PresetProfile {
  id: string;
  name: string;
  desc: string;
  concurrency: number;
  totalRequests: number;
  endpoint: string;
  delayMs: number;
  chaosRate: number;
  method: 'GET' | 'POST';
}

export const StressLab: React.FC = () => {
  const { t, language } = useI18n();

  // Workload Configuration State
  const [endpoint, setEndpoint] = useState<string>('/api/users');
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST'>('GET');
  const [concurrency, setConcurrency] = useState<number>(25);
  const [totalRequests, setTotalRequests] = useState<number>(500);
  const [injectedDelay, setInjectedDelay] = useState<number>(0);
  const [chaosRate, setChaosRate] = useState<number>(5);
  const [timeoutMs, setTimeoutMs] = useState<number>(3000);
  const [payloadType, setPayloadType] = useState<'light' | 'medium' | 'heavy'>('light');

  // Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'charts' | 'distribution' | 'logs'>('charts');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Real-time Data Series
  const [chartData, setChartData] = useState<StressSamplePoint[]>([]);
  const [requestLogs, setRequestLogs] = useState<StressLogEntry[]>([]);
  
  // Real-time Summary Statistics
  const [stats, setStats] = useState<StressSummaryStats>({
    totalSent: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    successRatePct: 100,
    minLatencyMs: 0,
    avgLatencyMs: 0,
    maxLatencyMs: 0,
    p50LatencyMs: 0,
    p90LatencyMs: 0,
    p95LatencyMs: 0,
    p99LatencyMs: 0,
    currentRps: 0,
    peakRps: 0,
    elapsedSec: 0,
  });

  // Latency Histogram Buckets
  const [histogram, setHistogram] = useState({
    fast: 0,     // < 20ms
    normal: 0,   // 20 - 60ms
    moderate: 0, // 60 - 150ms
    slow: 0,     // 150 - 400ms
    critical: 0, // > 400ms
  });

  // Abort / Cancellation refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const currentReqIndexRef = useRef<number>(0);
  const latenciesHistoryRef = useRef<number[]>([]);
  const startTimestampRef = useRef<number>(0);
  const windowRequestCountRef = useRef<number>(0);
  const lastRpsCheckTimeRef = useRef<number>(0);

  // Keep refs synced
  useEffect(() => {
    isRunningRef.current = isRunning;
    isPausedRef.current = isPaused;
  }, [isRunning, isPaused]);

  // Presets definition
  const PRESET_PROFILES: PresetProfile[] = [
    {
      id: 'smoke',
      name: language === 'tr' ? 'Hızlı Duman Testi' : 'Quick Smoke Test',
      desc: language === 'tr' ? 'Düşük eşzamanlılık, taban gecikme ölçümü' : 'Low concurrency baseline latency check',
      concurrency: 5,
      totalRequests: 100,
      endpoint: '/api/users',
      delayMs: 0,
      chaosRate: 0,
      method: 'GET',
    },
    {
      id: 'load',
      name: language === 'tr' ? '🚀 Yüksek Yük Patlaması' : '🚀 High Concurrency Burst',
      desc: language === 'tr' ? '50 eşzamanlı istek, 1.000 işlem' : '50 concurrent workers, 1,000 total requests',
      concurrency: 50,
      totalRequests: 1000,
      endpoint: '/api/stress/benchmark',
      delayMs: 0,
      chaosRate: 2,
      method: 'POST',
    },
    {
      id: 'chaos',
      name: language === 'tr' ? '🔥 Kaos & Rate Limit Stresi' : '🔥 Chaos & Rate Limit Spike',
      desc: language === 'tr' ? '40 thread, %25 hata & 429 enjeksiyonu' : '40 threads, 25% failure & 429 error injection',
      concurrency: 40,
      totalRequests: 600,
      endpoint: '/api/users',
      delayMs: 40,
      chaosRate: 25,
      method: 'GET',
    },
    {
      id: 'server-action',
      name: language === 'tr' ? '⚡ Server Action Mutex Yükü' : '⚡ Server Action Mutex Stress',
      desc: language === 'tr' ? 'Next.js 16 RSC Flight mutasyon yükü' : 'Next.js 16 RSC Flight mutation load',
      concurrency: 30,
      totalRequests: 400,
      endpoint: '/api/server-actions/simulate',
      delayMs: 20,
      chaosRate: 8,
      method: 'POST',
    },
  ];

  const applyPreset = (preset: PresetProfile) => {
    if (isRunning) return;
    setConcurrency(preset.concurrency);
    setTotalRequests(preset.totalRequests);
    setEndpoint(preset.endpoint);
    setInjectedDelay(preset.delayMs);
    setChaosRate(preset.chaosRate);
    setHttpMethod(preset.method);
  };

  // Percentile Calculator
  const calculatePercentile = (sortedArr: number[], p: number): number => {
    if (sortedArr.length === 0) return 0;
    const index = Math.ceil((p / 100) * sortedArr.length) - 1;
    return sortedArr[Math.max(0, Math.min(index, sortedArr.length - 1))];
  };

  // Reset Test Data
  const handleResetData = () => {
    if (isRunning) handleStop();
    setChartData([]);
    setRequestLogs([]);
    latenciesHistoryRef.current = [];
    currentReqIndexRef.current = 0;
    setHistogram({ fast: 0, normal: 0, moderate: 0, slow: 0, critical: 0 });
    setStats({
      totalSent: 0,
      completed: 0,
      successful: 0,
      failed: 0,
      successRatePct: 100,
      minLatencyMs: 0,
      avgLatencyMs: 0,
      maxLatencyMs: 0,
      p50LatencyMs: 0,
      p90LatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      currentRps: 0,
      peakRps: 0,
      elapsedSec: 0,
    });
  };

  // Start Stress Test Runner
  const handleStart = async () => {
    if (isRunning) return;
    
    handleResetData();
    setIsRunning(true);
    setIsPaused(false);
    isRunningRef.current = true;
    isPausedRef.current = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    startTimestampRef.current = performance.now();
    lastRpsCheckTimeRef.current = performance.now();
    windowRequestCountRef.current = 0;

    let completedCount = 0;
    let successCount = 0;
    let failCount = 0;
    let minLatency = 999999;
    let maxLatency = 0;
    let sumLatency = 0;
    let peakRps = 0;

    // Worker queue
    let nextIndexToRun = 0;
    const totalToRun = totalRequests;

    // Single Request Dispatcher
    const executeSingleRequest = async (reqId: number) => {
      if (!isRunningRef.current || controller.signal.aborted) return;

      while (isPausedRef.current) {
        await new Promise((r) => setTimeout(r, 100));
        if (!isRunningRef.current || controller.signal.aborted) return;
      }

      const reqStart = performance.now();
      let status = 0;
      let isSuccess = false;
      let errorMsg: string | undefined = undefined;

      try {
        let fetchUrl = endpoint;
        let fetchOptions: RequestInit = {
          method: httpMethod,
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
        };

        if (endpoint === '/api/users') {
          fetchUrl = `/api/users?delay=${injectedDelay}&chaos=${chaosRate}&t=${Date.now()}`;
        } else if (endpoint === '/api/stress/benchmark') {
          fetchOptions.body = JSON.stringify({
            delayMs: injectedDelay,
            errorRatePct: chaosRate,
            payloadSizeKb: payloadType === 'heavy' ? 40 : payloadType === 'medium' ? 10 : 1,
            requestId: `bench_${reqId}`,
          });
        } else if (endpoint === '/api/server-actions/simulate') {
          fetchOptions.body = JSON.stringify({
            actionName: 'updateRecordAction',
            delayMs: injectedDelay,
            shouldFail: Math.random() * 100 < chaosRate,
            payload: { title: `Stress Test Mutation #${reqId}` },
          });
        } else if (endpoint === '/api/middleware/test-pipeline') {
          fetchOptions.body = JSON.stringify({
            url: reqId % 2 === 0 ? '/admin/secrets' : '/api/feed/stream',
            headers: reqId % 3 === 0 ? { authorization: 'Bearer jwt_token' } : {},
            mockCountry: 'TR',
          });
        }

        // Set timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request Timeout')), timeoutMs)
        );

        const fetchPromise = fetch(fetchUrl, fetchOptions);
        const res: any = await Promise.race([fetchPromise, timeoutPromise]);

        status = res.status;
        isSuccess = res.ok;
        if (!res.ok) {
          errorMsg = `HTTP ${res.status}: ${res.statusText || 'Error'}`;
        }
      } catch (err: any) {
        if (controller.signal.aborted) return;
        status = err.name === 'AbortError' ? 0 : 504;
        isSuccess = false;
        errorMsg = err.message || 'Network Failure';
      }

      const reqDuration = parseFloat((performance.now() - reqStart).toFixed(2));
      completedCount++;
      windowRequestCountRef.current++;

      if (isSuccess) successCount++;
      else failCount++;

      sumLatency += reqDuration;
      minLatency = Math.min(minLatency, reqDuration);
      maxLatency = Math.max(maxLatency, reqDuration);

      // Latencies array for percentiles
      latenciesHistoryRef.current.push(reqDuration);

      // Update histogram
      setHistogram((prev) => {
        if (reqDuration < 20) return { ...prev, fast: prev.fast + 1 };
        if (reqDuration < 60) return { ...prev, normal: prev.normal + 1 };
        if (reqDuration < 150) return { ...prev, moderate: prev.moderate + 1 };
        if (reqDuration < 400) return { ...prev, slow: prev.slow + 1 };
        return { ...prev, critical: prev.critical + 1 };
      });

      // Periodic or batch state flush
      const now = performance.now();
      const elapsedSinceRps = (now - lastRpsCheckTimeRef.current) / 1000;
      let currentRps = stats.currentRps;

      if (elapsedSinceRps >= 0.25 || completedCount === totalToRun) {
        currentRps = parseFloat((windowRequestCountRef.current / Math.max(elapsedSinceRps, 0.05)).toFixed(1));
        peakRps = Math.max(peakRps, currentRps);
        windowRequestCountRef.current = 0;
        lastRpsCheckTimeRef.current = now;
      }

      const elapsedTotalSec = parseFloat(((now - startTimestampRef.current) / 1000).toFixed(1));
      const sorted = [...latenciesHistoryRef.current].sort((a, b) => a - b);
      const avgLat = parseFloat((sumLatency / completedCount).toFixed(2));
      const p50 = calculatePercentile(sorted, 50);
      const p90 = calculatePercentile(sorted, 90);
      const p95 = calculatePercentile(sorted, 95);
      const p99 = calculatePercentile(sorted, 99);
      const successPct = parseFloat(((successCount / completedCount) * 100).toFixed(1));

      // Append chart point (sampled every few requests or at end)
      if (completedCount % Math.max(1, Math.floor(totalToRun / 60)) === 0 || completedCount === totalToRun) {
        setChartData((prev) => [
          ...prev.slice(-75), // Keep latest 75 points for fluid visualization
          {
            index: completedCount,
            timeLabel: `${elapsedTotalSec}s (#${completedCount})`,
            latency: reqDuration,
            avgLatency: avgLat,
            p95Latency: p95,
            successRate: successPct,
            rps: currentRps,
            status,
            isError: !isSuccess,
          },
        ]);
      }

      // Add to recent request log
      setRequestLogs((prev) => [
        {
          id: `log_${reqId}_${Date.now()}`,
          requestId: reqId,
          endpoint,
          status,
          latencyMs: reqDuration,
          timestamp: new Date().toLocaleTimeString(),
          error: errorMsg,
        },
        ...prev.slice(0, 49), // Keep 50 recent
      ]);

      // Update Summary Stats
      setStats({
        totalSent: totalToRun,
        completed: completedCount,
        successful: successCount,
        failed: failCount,
        successRatePct: successPct,
        minLatencyMs: minLatency === 999999 ? 0 : minLatency,
        avgLatencyMs: avgLat,
        maxLatencyMs: maxLatency,
        p50LatencyMs: p50,
        p90LatencyMs: p90,
        p95LatencyMs: p95,
        p99LatencyMs: p99,
        currentRps,
        peakRps,
        elapsedSec: elapsedTotalSec,
      });
    };

    // Concurrency Worker Pool Loop
    const workers = Array.from({ length: Math.min(concurrency, totalToRun) }, async () => {
      while (nextIndexToRun < totalToRun && isRunningRef.current && !controller.signal.aborted) {
        const myIndex = ++nextIndexToRun;
        if (myIndex <= totalToRun) {
          await executeSingleRequest(myIndex);
        }
      }
    });

    await Promise.all(workers);
    setIsRunning(false);
    isRunningRef.current = false;
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    setIsPaused(false);
    isRunningRef.current = false;
    isPausedRef.current = false;
  };

  const handleCopyReport = () => {
    const reportText = `=== Next.js 16.3 API Simulator Stress Test Report ===
Target Endpoint: ${endpoint} (${httpMethod})
Concurrency Level: ${concurrency} parallel connections
Total Requests Configured: ${totalRequests}
Completed Requests: ${stats.completed} (${stats.successful} OK / ${stats.failed} Failed)
Overall Success Rate: ${stats.successRatePct}%
Throughput (Peak / Current): ${stats.peakRps} req/s / ${stats.currentRps} req/s
Elapsed Test Time: ${stats.elapsedSec} seconds

Latency Distribution:
- Min: ${stats.minLatencyMs} ms
- Avg: ${stats.avgLatencyMs} ms
- p50 (Median): ${stats.p50LatencyMs} ms
- p90: ${stats.p90LatencyMs} ms
- p95: ${stats.p95LatencyMs} ms
- p99: ${stats.p99LatencyMs} ms
- Max: ${stats.maxLatencyMs} ms

Generated at: ${new Date().toISOString()}
Tested via Next.js 16.3 Test Arena Stress Lab`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const progressPercentage = useMemo(() => {
    if (totalRequests === 0) return 0;
    return Math.min(100, Math.round((stats.completed / totalRequests) * 100));
  }, [stats.completed, totalRequests]);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-neutral-900 to-zinc-900 p-6 sm:p-8 text-white shadow-xl border border-zinc-800">
        <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Activity size={22} className={isRunning ? 'animate-pulse' : ''} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Stress Test Laboratory
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Live Recharts & Throughput Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Next.js 16.3 High-Concurrency Stress & Latency Studio
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Dispatch configurable concurrent workloads against Route Handlers, Server Actions, Edge Middleware and SQLite storage. Visualize real-time response time curves, error spikes, and p95/p99 latency percentiles.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-700/60 p-3 rounded-2xl">
            <div className="text-center px-3 border-r border-zinc-800">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Success Rate</div>
              <div className={`text-lg font-black font-mono ${stats.successRatePct >= 95 ? 'text-emerald-400' : stats.successRatePct >= 80 ? 'text-amber-400' : 'text-rose-400'}`}>
                {stats.completed > 0 ? `${stats.successRatePct}%` : '100%'}
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Avg Latency</div>
              <div className="text-lg font-black font-mono text-sky-400">
                {stats.avgLatencyMs} <span className="text-xs font-normal">ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Profiles Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-mono text-zinc-500 whitespace-nowrap flex items-center gap-1.5 pl-1">
          <Sparkles size={14} className="text-amber-500" />
          <span>Workload Presets:</span>
        </span>
        {PRESET_PROFILES.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border whitespace-nowrap flex items-center gap-2 cursor-pointer bg-white dark:bg-neutral-900 border-zinc-200 dark:border-neutral-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-zinc-800 dark:text-neutral-200 disabled:opacity-50"
          >
            <span>{preset.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-neutral-800 text-zinc-500 font-normal">
              {preset.concurrency}w • {preset.totalRequests}r
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid: Control Panel + Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Workload Configurator (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-sm">
                <Sliders size={16} className="text-emerald-500" />
                <span>Workload Parameters</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {isRunning ? 'Running test...' : 'Ready to launch'}
              </span>
            </div>

            {/* Target Endpoint Selection */}
            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-neutral-300 mb-1.5">
                Target API Simulator Endpoint
              </label>
              <select
                value={endpoint}
                onChange={(e) => {
                  setEndpoint(e.target.value);
                  if (e.target.value.includes('simulate') || e.target.value.includes('benchmark')) {
                    setHttpMethod('POST');
                  } else {
                    setHttpMethod('GET');
                  }
                }}
                disabled={isRunning}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
              >
                <option value="/api/users">GET /api/users (App Router Route Handler)</option>
                <option value="/api/stress/benchmark">POST /api/stress/benchmark (Dedicated Fast Benchmark)</option>
                <option value="/api/health">GET /api/health (Node 24 LTS Micro-Check)</option>
                <option value="/api/sqlite/status">GET /api/sqlite/status (SQLite Storage & WAL Check)</option>
                <option value="/api/server-actions/simulate">POST /api/server-actions/simulate (Server Action Mutation)</option>
                <option value="/api/middleware/test-pipeline">POST /api/middleware/test-pipeline (Edge Middleware)</option>
              </select>
            </div>

            {/* Concurrency Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="font-semibold text-zinc-700 dark:text-neutral-300">Concurrent Workers (Threads)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {concurrency} workers
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                disabled={isRunning}
                className="w-full accent-emerald-500 cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                <span>1 (Sequential)</span>
                <span>25 (Standard)</span>
                <span>50 (Heavy)</span>
                <span>100 (Extreme)</span>
              </div>
            </div>

            {/* Total Requests */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="font-semibold text-zinc-700 dark:text-neutral-300">Total Requests Count</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                  {totalRequests} requests
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={totalRequests}
                onChange={(e) => setTotalRequests(Number(e.target.value))}
                disabled={isRunning}
                className="w-full accent-sky-500 cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                <span>50 req</span>
                <span>500 req</span>
                <span>1,500 req</span>
                <span>2,500 req</span>
              </div>
            </div>

            {/* Chaos & Delay Options Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-neutral-300 mb-1">
                  Injected Latency
                </label>
                <select
                  value={injectedDelay}
                  onChange={(e) => setInjectedDelay(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white cursor-pointer disabled:opacity-50"
                >
                  <option value="0">0 ms (Zero Delay)</option>
                  <option value="20">20 ms (Fast Edge)</option>
                  <option value="80">80 ms (Regional)</option>
                  <option value="250">250 ms (Slow 3G)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-neutral-300 mb-1">
                  Chaos Error Rate
                </label>
                <select
                  value={chaosRate}
                  onChange={(e) => setChaosRate(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white cursor-pointer disabled:opacity-50"
                >
                  <option value="0">0% (Pure Green)</option>
                  <option value="5">5% (Minor Jitter)</option>
                  <option value="15">15% (Rate Limits)</option>
                  <option value="35">35% (High Chaos)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer"
                >
                  <Play size={15} />
                  <span>Launch Stress Test ({concurrency} Workers)</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handlePauseToggle}
                    className={`py-2.5 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isPaused
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                  >
                    {isPaused ? <Play size={13} /> : <Pause size={13} />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={handleStop}
                    className="py-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Square size={13} />
                    <span>Abort / Stop</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleResetData}
                disabled={isRunning}
                className="w-full py-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} />
                <span>Reset Statistics & Logs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Visualizations & Metrics (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Bar and Summary Cards */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm space-y-4">
            {/* Progress Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-sky-500" />
                <span className="font-bold text-zinc-900 dark:text-white text-sm">
                  Workload Dispatch Progress
                </span>
                {isRunning && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    Live Dispatching
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-zinc-500">
                Completed: <span className="font-bold text-zinc-900 dark:text-white">{stats.completed}</span> / {totalRequests} reqs ({progressPercentage}%)
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-neutral-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-150 ${
                  stats.failed > 0 && stats.successRatePct < 90
                    ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-sky-500 to-emerald-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* 4 Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Current Throughput</div>
                <div className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {stats.currentRps} <span className="text-xs font-normal text-zinc-500">req/s</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                  Peak: {stats.peakRps} req/s
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Success vs Failed</div>
                <div className="text-base sm:text-lg font-black font-mono text-zinc-800 dark:text-neutral-200 mt-0.5">
                  <span className="text-emerald-500">{stats.successful}</span>
                  <span className="text-zinc-400 text-xs mx-1">/</span>
                  <span className={stats.failed > 0 ? 'text-rose-500' : 'text-zinc-500'}>{stats.failed}</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                  Rate: {stats.successRatePct}%
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">p95 Latency</div>
                <div className="text-base sm:text-lg font-black font-mono text-amber-500 mt-0.5">
                  {stats.p95LatencyMs} <span className="text-xs font-normal text-zinc-500">ms</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                  p99: {stats.p99LatencyMs} ms
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Elapsed Time</div>
                <div className="text-base sm:text-lg font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                  {stats.elapsedSec} <span className="text-xs font-normal text-zinc-500">sec</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                  Min: {stats.minLatencyMs}ms • Max: {stats.maxLatencyMs}ms
                </div>
              </div>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('charts')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'charts'
                    ? 'bg-emerald-500 text-black shadow-xs'
                    : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 hover:text-zinc-900'
                }`}
              >
                <TrendingUp size={13} />
                <span>Real-Time Line Charts</span>
              </button>

              <button
                onClick={() => setActiveTab('distribution')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'distribution'
                    ? 'bg-emerald-500 text-black shadow-xs'
                    : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 hover:text-zinc-900'
                }`}
              >
                <BarChart2 size={13} />
                <span>Latency Percentiles</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'logs'
                    ? 'bg-emerald-500 text-black shadow-xs'
                    : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 hover:text-zinc-900'
                }`}
              >
                <Terminal size={13} />
                <span>Request Stream ({requestLogs.length})</span>
              </button>
            </div>

            <button
              onClick={handleCopyReport}
              className="p-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
              title="Copy Benchmark Report"
            >
              {copiedReport ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span className="hidden sm:inline">Report</span>
            </button>
          </div>

          {/* Tab 1: Real-Time Recharts Line Charts */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              {/* Chart 1: Real-Time Response Time & Latency Percentile */}
              <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                      <Clock size={14} />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm font-mono">
                      Real-Time Response Time & Latency (ms)
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Live Latency
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Avg Rolling
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> p95 Ceiling
                    </span>
                  </div>
                </div>

                <div className="w-full h-64 pt-2">
                  {chartData.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 text-xs font-mono border border-dashed border-zinc-200 dark:border-neutral-800 rounded-2xl">
                      <Activity size={24} className="mb-2 text-zinc-500 opacity-50" />
                      <span>No active stress test run. Click "Launch Stress Test" to stream real-time latency.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333333" opacity={0.25} />
                        <XAxis
                          dataKey="timeLabel"
                          tick={{ fontSize: 10, fill: '#888' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#888' }}
                          unit="ms"
                          domain={[0, 'auto']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #3f3f46',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="latency"
                          name="Live Latency (ms)"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="avgLatency"
                          name="Average (ms)"
                          stroke="#10b981"
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          dot={false}
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="p95Latency"
                          name="p95 Latency (ms)"
                          stroke="#f59e0b"
                          strokeWidth={1.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart 2: Success Rate (%) & Throughput (RPS) */}
              <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <TrendingUp size={14} />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm font-mono">
                      Success Rate (%) & Real-Time Throughput (RPS)
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Success Rate %
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Throughput (RPS)
                    </span>
                  </div>
                </div>

                <div className="w-full h-56 pt-2">
                  {chartData.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 text-xs font-mono border border-dashed border-zinc-200 dark:border-neutral-800 rounded-2xl">
                      <Gauge size={24} className="mb-2 text-zinc-500 opacity-50" />
                      <span>Awaiting test execution to graph throughput & success rates.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333333" opacity={0.25} />
                        <XAxis
                          dataKey="timeLabel"
                          tick={{ fontSize: 10, fill: '#888' }}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          domain={[0, 100]}
                          unit="%"
                          tick={{ fontSize: 10, fill: '#888' }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 'auto']}
                          unit=" rps"
                          tick={{ fontSize: 10, fill: '#888' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #3f3f46',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                          }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="successRate"
                          name="Success Rate (%)"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="rps"
                          name="Throughput (RPS)"
                          stroke="#a855f7"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Statistical Percentiles & Histogram Distribution */}
          {activeTab === 'distribution' && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-sm">
                    <BarChart2 size={16} className="text-amber-500" />
                    <span>Latency Percentiles Breakdown</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    Sample size: {latenciesHistoryRef.current.length} reqs
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Minimum Latency', val: `${stats.minLatencyMs} ms`, color: 'text-emerald-400' },
                    { label: 'p50 Median (50%)', val: `${stats.p50LatencyMs} ms`, color: 'text-sky-400' },
                    { label: 'Average (Mean)', val: `${stats.avgLatencyMs} ms`, color: 'text-sky-300' },
                    { label: 'p90 Percentile', val: `${stats.p90LatencyMs} ms`, color: 'text-amber-400' },
                    { label: 'p95 Percentile', val: `${stats.p95LatencyMs} ms`, color: 'text-amber-500' },
                    { label: 'p99 Percentile', val: `${stats.p99LatencyMs} ms`, color: 'text-rose-400' },
                  ].map((p) => (
                    <div key={p.label} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">{p.label}</div>
                      <div className={`text-lg font-black font-mono mt-1 ${p.color}`}>
                        {p.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Response Time Histogram Buckets */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono font-bold text-zinc-800 dark:text-neutral-200">
                    Response Latency Distribution Bands:
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    {[
                      { label: '< 20 ms (Ultra-fast Edge)', count: histogram.fast, color: 'bg-emerald-500' },
                      { label: '20 - 60 ms (Nominal Runtime)', count: histogram.normal, color: 'bg-sky-500' },
                      { label: '60 - 150 ms (Moderate Server Action)', count: histogram.moderate, color: 'bg-amber-500' },
                      { label: '150 - 400 ms (Heavy SQL/Payload)', count: histogram.slow, color: 'bg-orange-500' },
                      { label: '> 400 ms (Degraded/Critical)', count: histogram.critical, color: 'bg-rose-500' },
                    ].map((band) => {
                      const total = stats.completed || 1;
                      const pct = Math.round((band.count / total) * 100);
                      return (
                        <div key={band.label} className="space-y-1">
                          <div className="flex justify-between text-[11px] text-zinc-600 dark:text-neutral-400">
                            <span>{band.label}</span>
                            <span className="font-bold text-zinc-800 dark:text-neutral-200">{band.count} reqs ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className={`h-full ${band.color} transition-all duration-300`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Live Request Stream Logs */}
          {activeTab === 'logs' && (
            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={15} className="text-sky-500" />
                  <h3 className="font-bold text-zinc-900 dark:text-white text-xs font-mono">
                    Live Request Stream Log (Latest 50 Dispatches)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  Auto-scrolling stream
                </span>
              </div>

              <div className="max-h-[380px] overflow-y-auto space-y-1.5 font-mono text-xs pr-1">
                {requestLogs.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 text-xs">
                    No requests dispatched yet. Start a workload to view live log stream.
                  </div>
                ) : (
                  requestLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        log.status >= 200 && log.status < 300
                          ? 'bg-zinc-50 dark:bg-neutral-950 border-zinc-200 dark:border-neutral-800'
                          : log.status === 429
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : 'bg-rose-500/5 border-rose-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.status >= 200 && log.status < 300
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : log.status === 429
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {log.status || 'ERR'}
                        </span>
                        <span className="text-zinc-500 text-[11px]">#{log.requestId}</span>
                        <span className="text-zinc-800 dark:text-neutral-200 font-semibold truncate">
                          {log.endpoint}
                        </span>
                        {log.error && (
                          <span className="text-rose-400 text-[10px] truncate max-w-[140px]">
                            ({log.error})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-zinc-500 text-[11px]">
                        <span className="font-bold text-sky-500">{log.latencyMs} ms</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

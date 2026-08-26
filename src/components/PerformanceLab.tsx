import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Play,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Server,
  Flame,
  Clock,
  Cpu,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Radio,
  Sparkles,
  BarChart3,
  HardDrive
} from 'lucide-react';
import { BenchmarkResult, SecurityCheckItem } from '../types';
import { useI18n } from '../i18n';
import { motion } from 'motion/react';

export const PerformanceLab: React.FC = () => {
  const { t, language } = useI18n();

  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>([
    {
      id: 'bench-1',
      name: t('bench.compiler'),
      opsPerSec: 142500,
      latencyMs: 0.12,
      memoryDeltaMb: 2.1,
      status: 'ready',
    },
    {
      id: 'bench-2',
      name: t('bench.turbocache'),
      opsPerSec: 890000,
      latencyMs: 0.03,
      memoryDeltaMb: 0.4,
      status: 'ready',
    },
    {
      id: 'bench-3',
      name: t('bench.instantnav'),
      opsPerSec: 520000,
      latencyMs: 0.08,
      memoryDeltaMb: 1.2,
      status: 'ready',
    },
    {
      id: 'bench-4',
      name: t('bench.json'),
      opsPerSec: 310000,
      latencyMs: 0.28,
      memoryDeltaMb: 4.8,
      status: 'ready',
    },
    {
      id: 'bench-5',
      name: t('bench.crypto'),
      opsPerSec: 680000,
      latencyMs: 0.05,
      memoryDeltaMb: 0.8,
      status: 'ready',
    },
    {
      id: 'bench-6',
      name: t('bench.flightStream'),
      opsPerSec: 420000,
      latencyMs: 0.15,
      memoryDeltaMb: 3.2,
      status: 'ready',
    },
  ]);

  const [isRunningBench, setIsRunningBench] = useState(false);

  // Extreme Stress Simulator State
  const [concurrency, setConcurrency] = useState(128);
  const [totalRequests, setTotalRequests] = useState(25000);
  const [isStressRunning, setIsStressRunning] = useState(false);
  const [stressProgress, setStressProgress] = useState(0);
  const [chaosMode, setChaosMode] = useState(false);
  const [stressStats, setStressStats] = useState({
    completed: 0,
    throughput: 0,
    p50: 1.2,
    p95: 3.4,
    p99: 7.8,
    successRate: 100,
    errorCount: 0,
  });

  // V8 Memory Simulator State
  const [heapUsed, setHeapUsed] = useState(38.4);
  const [isGcRunning, setIsGcRunning] = useState(false);

  const securityChecks: SecurityCheckItem[] = [
    {
      id: 'sec-1',
      title: 'Server Action Origin & CSRF Guard',
      desc: 'Origin/Fetch-Metadata verification enabled by default in Next.js 16.3.',
      status: 'pass',
      score: '100 / 100',
      cveId: 'CVE-FIXED',
    },
    {
      id: 'sec-2',
      title: 'Prototype Pollution & Prop Serialization Boundary',
      desc: 'Zero deserialization exploits in React Server Component (RSC) streams.',
      status: 'pass',
      score: 'A+ Grade',
    },
    {
      id: 'sec-3',
      title: 'Async Context Request Boundary Isolation',
      desc: 'Node 24 AsyncLocalStorage prevents cross-tenant header/cookie leakage.',
      status: 'pass',
      score: 'Verified',
    },
    {
      id: 'sec-4',
      title: 'Strict Content-Security-Policy (CSP) Nonce Middleware',
      desc: 'Dynamically injected cryptographically secure nonces for SSR scripts.',
      status: 'pass',
      score: 'Enforced',
    },
    {
      id: 'sec-5',
      title: 'Edge Middleware Redirect Loop & Regex ReDoS Guard',
      desc: 'Linear-time regex matching in Edge routing engine.',
      status: 'pass',
      score: 'Safe',
    },
  ];

  const handleRunAllBenchmarks = async () => {
    setIsRunningBench(true);
    setBenchmarks((prev) => prev.map((b) => ({ ...b, status: 'running' })));

    for (let i = 0; i < benchmarks.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setBenchmarks((prev) =>
        prev.map((b, idx) =>
          idx === i
            ? {
                ...b,
                opsPerSec: Math.floor(b.opsPerSec * (0.95 + Math.random() * 0.15)),
                latencyMs: +(b.latencyMs * (0.9 + Math.random() * 0.2)).toFixed(2),
                status: 'success',
              }
            : b
        )
      );
    }
    setIsRunningBench(false);
  };

  const handleFireStress = async () => {
    setIsStressRunning(true);
    setStressProgress(0);
    setStressStats({
      completed: 0,
      throughput: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      successRate: 100,
      errorCount: 0,
    });

    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, 60));
      const pct = (i / steps) * 100;
      setStressProgress(pct);

      const completed = Math.round((totalRequests * i) / steps);
      const instantThroughput = Math.round(
        (concurrency * 380 + Math.random() * 4000) * (chaosMode ? 0.7 : 1)
      );

      const errorCount = chaosMode ? Math.floor(completed * 0.035) : 0;
      const successRate = chaosMode ? 96.5 : 100;

      setStressStats({
        completed,
        throughput: instantThroughput,
        p50: +(0.8 + Math.random() * 0.6).toFixed(1),
        p95: +(2.4 + Math.random() * (chaosMode ? 8.5 : 1.2)).toFixed(1),
        p99: +(5.2 + Math.random() * (chaosMode ? 18.0 : 2.5)).toFixed(1),
        successRate,
        errorCount,
      });

      // Increase heap temporarily during load
      setHeapUsed((prev) => +(prev + Math.random() * 1.5).toFixed(1));
    }

    setIsStressRunning(false);
  };

  const handleRunGc = async () => {
    setIsGcRunning(true);
    await new Promise((r) => setTimeout(r, 500));
    setHeapUsed(34.2);
    setIsGcRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bento Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {t('perf.badge')}
            </span>
            <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
              Node 24 LTS / Krypton
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
            {t('perf.title')}
          </h2>
        </div>

        <button
          id="run-all-benchmarks-btn"
          onClick={handleRunAllBenchmarks}
          disabled={isRunningBench}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-mono text-xs font-bold shadow-xs transition-all disabled:opacity-50"
        >
          {isRunningBench ? (
            <>
              <RefreshCw size={15} className="animate-spin text-amber-400" />
              <span>{t('perf.running')}</span>
            </>
          ) : (
            <>
              <Play size={15} className="fill-current text-emerald-400" />
              <span>{t('perf.runAll')}</span>
            </>
          )}
        </button>
      </div>

      {/* 6 Micro-Benchmarks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benchmarks.map((bench) => (
          <div
            key={bench.id}
            className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-800 dark:text-neutral-200 line-clamp-2">
                {bench.name}
              </span>
              {bench.status === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : bench.status === 'running' ? (
                <Zap size={16} className="text-amber-500 shrink-0 animate-pulse" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-200 dark:bg-neutral-800 shrink-0" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {bench.opsPerSec.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {t('perf.opsSec')}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-neutral-400 pt-2 border-t border-zinc-100 dark:border-neutral-800/80">
                <span>{t('perf.avgLatency')}: <b className="text-zinc-700 dark:text-neutral-300">{bench.latencyMs}ms</b></span>
                <span>Heap: <b className="text-zinc-700 dark:text-neutral-300">+{bench.memoryDeltaMb}MB</b></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hardcore Extreme Load & Chaos Simulator Bento */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-rose-500" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                {t('perf.stressTitle')}
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-0.5">
              Simulate 50,000 RPS burst traffic against Next.js 16.3 Edge runtime with optional Chaos fault injection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Chaos Switch */}
            <button
              id="chaos-mode-toggle"
              onClick={() => setChaosMode(!chaosMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                chaosMode
                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/40 shadow-xs'
                  : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-500 dark:text-neutral-400 border-zinc-200 dark:border-neutral-700'
              }`}
            >
              <AlertTriangle size={14} />
              <span>{chaosMode ? t('perf.chaosActive') : t('perf.chaosMonkey')}</span>
            </button>

            {/* Fire Load Burst */}
            <button
              id="fire-stress-test-btn"
              onClick={handleFireStress}
              disabled={isStressRunning}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-mono text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {isStressRunning ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Burstable...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>{t('perf.fireLoad')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sliders for Workers & Volume */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-600 dark:text-neutral-400 font-semibold">{t('perf.concurrency')}</span>
              <span className="font-bold text-zinc-900 dark:text-white">{concurrency} {t('perf.workers')}</span>
            </div>
            <input
              type="range"
              min="16"
              max="512"
              step="16"
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              disabled={isStressRunning}
              className="w-full accent-rose-500 h-2 bg-zinc-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-600 dark:text-neutral-400 font-semibold">{t('perf.totalReqs')}</span>
              <span className="font-bold text-zinc-900 dark:text-white">{totalRequests.toLocaleString()} {t('perf.requests')}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="5000"
              value={totalRequests}
              onChange={(e) => setTotalRequests(Number(e.target.value))}
              disabled={isStressRunning}
              className="w-full accent-amber-500 h-2 bg-zinc-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Real-time Progress Bar */}
        {isStressRunning && (
          <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 h-full"
              style={{ width: `${stressProgress}%` }}
            />
          </div>
        )}

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 font-mono">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{t('perf.throughput')}</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
              {stressStats.throughput.toLocaleString()} <span className="text-xs text-zinc-500">req/s</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 font-mono">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{t('perf.completed')}</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
              {stressStats.completed.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 font-mono">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{t('perf.latencyP50')}</div>
            <div className="text-lg font-bold text-emerald-500 mt-1">
              {stressStats.p50} ms
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 font-mono">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{t('perf.latencyP95')}</div>
            <div className="text-lg font-bold text-amber-500 mt-1">
              {stressStats.p95} ms
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 font-mono">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{t('perf.latencyP99')}</div>
            <div className="text-lg font-bold text-rose-500 mt-1">
              {stressStats.p99} ms
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 font-mono">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{t('perf.successRate')}</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
              {stressStats.successRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Bento: V8 GC Heap Monitor & Security Hardening Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: V8 Memory Heap & GC Trigger (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive size={18} className="text-teal-500" />
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                {t('perf.memorySimulator')}
              </h4>
            </div>
            <button
              id="trigger-gc-btn"
              onClick={handleRunGc}
              disabled={isGcRunning}
              className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-mono font-bold border border-teal-500/30 transition-all"
            >
              {isGcRunning ? 'GC Running...' : t('perf.triggerGc')}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-500">Heap Allocated:</span>
              <span className="font-bold text-zinc-900 dark:text-white">{heapUsed} MB / 512 MB</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full transition-all duration-300"
                style={{ width: `${(heapUsed / 512) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>Scavenger Cycles: 124</span>
              <span>Mark-Sweep: 4</span>
            </div>
          </div>

          <div className="text-xs text-zinc-500 dark:text-neutral-400 leading-relaxed font-mono">
            Node.js 24 LTS Krypton V8 13.4 optimizes typed array allocation and garbage collection pauses under 0.8ms.
          </div>
        </div>

        {/* Right Column: Security Hardening Checklist (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                {t('perf.securityTitle')}
              </h4>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ALL GREEN (0 CVEs)
            </span>
          </div>

          <div className="space-y-2">
            {securityChecks.map((check) => (
              <div
                key={check.id}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950/60 border border-zinc-200/60 dark:border-neutral-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-zinc-900 dark:text-neutral-200 flex items-center gap-2">
                    <span>{check.title}</span>
                    {check.cveId && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500">
                        {check.cveId}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-neutral-400">
                    {check.desc}
                  </p>
                </div>
                <span className="font-mono font-bold text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0">
                  {check.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

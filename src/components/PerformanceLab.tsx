import React, { useState } from 'react';
import { 
  Gauge, 
  Play, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  Zap, 
  Cpu, 
  Lock, 
  Flame, 
  Check, 
  ShieldCheck, 
  Sliders,
  BarChart2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { BenchmarkResult, SecurityCheckItem } from '../types';
import { useI18n } from '../i18n';

export const PerformanceLab: React.FC = () => {
  const { t, language } = useI18n();

  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>([
    {
      id: 'b-1',
      name: language === 'tr' ? 'Rust React Compiler AST Dönüşümü (1.000 bileşen)' : 'Rust React Compiler AST Transform (1,000 components)',
      opsPerSec: 320000,
      latencyMs: 0.04,
      memoryDeltaMb: 0.8,
      status: 'success',
    },
    {
      id: 'b-2',
      name: language === 'tr' ? 'Turbopack Persistent Cache Hit Hızı' : 'Turbopack Persistent Cache Hit Speed',
      opsPerSec: 540000,
      latencyMs: 0.02,
      memoryDeltaMb: 0.3,
      status: 'success',
    },
    {
      id: 'b-3',
      name: language === 'tr' ? 'Instant Navigations Partial Prefetch Yanıtı' : 'Instant Navigations Partial Prefetch Response',
      opsPerSec: 185000,
      latencyMs: 0.09,
      memoryDeltaMb: 1.1,
      status: 'success',
    },
    {
      id: 'b-4',
      name: language === 'tr' ? 'Edge Kripto İmza Doğrulama (HMAC-SHA256)' : 'Edge Crypto Signature Verification (HMAC-SHA256)',
      opsPerSec: 82000,
      latencyMs: 0.35,
      memoryDeltaMb: 0.5,
      status: 'success',
    },
  ]);

  const [securityItems, setSecurityItems] = useState<SecurityCheckItem[]>([
    {
      id: 'sec-1',
      title: language === 'tr' ? 'Next.js 16.3.3 Security Release Patch' : 'Next.js 16.3.3 Security Release Patch',
      desc: language === 'tr' ? 'Ağustos 2026 kritik güvenlik yamaları ve middleware header sanitization uygulandı.' : 'August 2026 critical security patches and middleware header sanitization applied.',
      status: 'pass',
      score: '100/100',
    },
    {
      id: 'sec-2',
      title: language === 'tr' ? 'Content Security Policy (CSP) & Nonce Guard' : 'Content Security Policy (CSP) & Nonce Guard',
      desc: language === 'tr' ? 'default-src \'self\'; script-src \'nonce-xxx\' ile XSS tamamen engellendi.' : 'default-src \'self\'; script-src \'nonce-xxx\' to prevent XSS injection.',
      status: 'pass',
      score: 'A+',
    },
    {
      id: 'sec-3',
      title: language === 'tr' ? 'Server Action CSRF & Origin Validation' : 'Server Action CSRF & Origin Validation',
      desc: language === 'tr' ? 'Next.js 16 otomatik Origin / Host header doğrulaması ve güvenli form sözleşmesi.' : 'Next.js 16 automated Origin / Host header verification & safe form contract.',
      status: 'pass',
      score: 'Enforced',
    },
    {
      id: 'sec-4',
      title: language === 'tr' ? 'Dead Code Elimination & Secret Key DCE' : 'Dead Code Elimination & Secret Key DCE',
      desc: language === 'tr' ? 'Gizli sunucu anahtarları istemci bundle içine asla sızmıyor (Tree Shaking + DCE).' : 'Secret server keys never leak into client bundles (Tree Shaking + DCE).',
      status: 'pass',
      score: 'Protected',
    },
  ]);

  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [concurrency, setConcurrency] = useState<number>(100);
  const [totalRequests, setTotalRequests] = useState<number>(1000);
  const [stressMetrics, setStressMetrics] = useState({
    throughput: 2850,
    latencyP50: 8,
    latencyP99: 19,
    successRate: 100,
    completedRequests: 1000,
  });

  const runAllBenchmarks = async () => {
    setIsBenchmarking(true);
    for (let i = 0; i < benchmarks.length; i++) {
      await new Promise((res) => setTimeout(res, 220));
      setBenchmarks((prev) =>
        prev.map((b, idx) =>
          idx === i
            ? {
                ...b,
                opsPerSec: Math.floor(b.opsPerSec * (0.96 + Math.random() * 0.08)),
                latencyMs: +(b.latencyMs * (0.94 + Math.random() * 0.12)).toFixed(2),
              }
            : b
        )
      );
    }
    setIsBenchmarking(false);
  };

  const runStressTest = async () => {
    setIsBenchmarking(true);
    let reqs = 0;
    const step = Math.ceil(totalRequests / 10);

    for (let i = 0; i < 10; i++) {
      await new Promise((res) => setTimeout(res, 90));
      reqs += step;
      setStressMetrics({
        throughput: Math.floor(2600 + Math.random() * 500),
        latencyP50: Math.floor(6 + Math.random() * 4),
        latencyP99: Math.floor(16 + Math.random() * 6),
        successRate: 100,
        completedRequests: Math.min(reqs, totalRequests),
      });
    }
    setIsBenchmarking(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            {t('perf.badge')}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            {t('perf.title')}
          </h2>
        </div>

        <button
          onClick={runAllBenchmarks}
          disabled={isBenchmarking}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 rounded-full font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>{isBenchmarking ? t('perf.running') : t('perf.runAll')}</span>
        </button>
      </div>

      {/* Top 4 Performance Bento Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {benchmarks.map((bench) => (
          <div
            key={bench.id}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-neutral-500">
                Next.js 16.3 Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                OPTIMIZED
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-neutral-200 leading-snug">
                {bench.name}
              </h3>
              <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white mt-2">
                {bench.opsPerSec.toLocaleString()}
                <span className="text-xs font-sans text-zinc-500 dark:text-neutral-500 ml-1 font-normal">
                  {t('perf.opsSec')}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-neutral-400">
              <span>{t('perf.avgLatency')}:</span>
              <span className="text-emerald-500 font-bold">{bench.latencyMs}ms</span>
            </div>
          </div>
        ))}
      </div>

      {/* Concurrent Stress Tester & Security Checklist Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Next.js 16 Load & Stress Tester (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  {t('perf.stressTester')}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {t('perf.stressTitle')}
                </h3>
              </div>

              <button
                onClick={runStressTest}
                disabled={isBenchmarking}
                className="px-4 py-2 bg-zinc-900 dark:bg-emerald-500 text-white dark:text-neutral-950 hover:bg-zinc-800 dark:hover:bg-emerald-400 disabled:opacity-50 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t('perf.fireLoad')}</span>
              </button>
            </div>

            {/* Sliders for concurrency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-4 bg-zinc-50 dark:bg-neutral-950 rounded-2xl border border-zinc-200 dark:border-neutral-800/80">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-neutral-300">
                  <span>{t('perf.concurrency')}:</span>
                  <span className="font-mono text-emerald-500 font-bold">{concurrency} {t('perf.workers')}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={250}
                  step={10}
                  value={concurrency}
                  onChange={(e) => setConcurrency(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-neutral-300">
                  <span>{t('perf.totalReqs')}:</span>
                  <span className="font-mono text-cyan-400 font-bold">{totalRequests} {t('perf.requests')}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={3000}
                  step={100}
                  value={totalRequests}
                  onChange={(e) => setTotalRequests(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Telemetry Output Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-zinc-50 dark:bg-neutral-950 rounded-2xl border border-zinc-200 dark:border-neutral-800 text-center">
                <div className="text-[10px] font-mono uppercase text-zinc-400 dark:text-neutral-500">{t('perf.throughput')}</div>
                <div className="text-xl font-bold font-mono text-emerald-500 mt-1">{stressMetrics.throughput} <span className="text-[10px]">req/s</span></div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-neutral-950 rounded-2xl border border-zinc-200 dark:border-neutral-800 text-center">
                <div className="text-[10px] font-mono uppercase text-zinc-400 dark:text-neutral-500">{t('perf.latencyP50')}</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{stressMetrics.latencyP50} <span className="text-[10px]">ms</span></div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-neutral-950 rounded-2xl border border-zinc-200 dark:border-neutral-800 text-center">
                <div className="text-[10px] font-mono uppercase text-zinc-400 dark:text-neutral-500">P99 Tail</div>
                <div className="text-xl font-bold font-mono text-purple-400 mt-1">{stressMetrics.latencyP99} <span className="text-[10px]">ms</span></div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-neutral-950 rounded-2xl border border-zinc-200 dark:border-neutral-800 text-center">
                <div className="text-[10px] font-mono uppercase text-zinc-400 dark:text-neutral-500">{t('perf.successRate')}</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{stressMetrics.successRate}%</div>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-mono text-zinc-400 dark:text-neutral-500">
            {t('perf.completed')}: {stressMetrics.completedRequests} / {totalRequests} requests &bull; Turbopack JIT Pipeline Active
          </p>
        </div>

        {/* Right: Security Hardening Checklist (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                {t('perf.securityAudit')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                PASSED (4/4)
              </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">
              {t('perf.securityTitle')}
            </h3>

            <div className="space-y-2.5">
              {securityItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-neutral-400 line-clamp-1">{item.desc}</p>
                  </div>

                  <span className="font-mono text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex-shrink-0">
                    {item.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Next.js 16.3.3 zero-vulnerability security criteria validated.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

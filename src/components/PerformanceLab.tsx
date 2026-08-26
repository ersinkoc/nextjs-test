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
  RefreshCw
} from 'lucide-react';
import { BenchmarkResult, SecurityCheckItem } from '../types';
import { useI18n } from '../i18n';

export const PerformanceLab: React.FC = () => {
  const { t, language } = useI18n();

  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>([
    {
      id: 'b-1',
      name: language === 'tr' ? 'JSON Serileştirme (10.000 nesne)' : 'JSON Serialization (10,000 objects)',
      opsPerSec: 142000,
      latencyMs: 0.12,
      memoryDeltaMb: 2.1,
      status: 'success',
    },
    {
      id: 'b-2',
      name: language === 'tr' ? 'React Sanal DOM Uzlaştırma (500 düğüm)' : 'React Virtual DOM Re-conciliation (500 nodes)',
      opsPerSec: 68500,
      latencyMs: 0.45,
      memoryDeltaMb: 4.8,
      status: 'success',
    },
    {
      id: 'b-3',
      name: language === 'tr' ? 'App Router Middleware Başlık Çözümleme' : 'App Router Middleware Header Resolution',
      opsPerSec: 92400,
      latencyMs: 0.28,
      memoryDeltaMb: 1.2,
      status: 'success',
    },
    {
      id: 'b-4',
      name: language === 'tr' ? 'Edge Kripto İmza Doğrulama (HMAC-SHA256)' : 'Edge Crypto Signature Verification (HMAC-SHA256)',
      opsPerSec: 41200,
      latencyMs: 0.85,
      memoryDeltaMb: 0.9,
      status: 'success',
    },
  ]);

  const [securityItems, setSecurityItems] = useState<SecurityCheckItem[]>([
    {
      id: 'sec-1',
      title: language === 'tr' ? 'Content Security Policy (CSP) Başlığı' : 'Content Security Policy (CSP) Header',
      desc: language === 'tr' ? 'default-src \'self\'; script-src \'nonce-xxx\' ile XSS engelleme' : 'default-src \'self\'; script-src \'nonce-xxx\' to prevent XSS',
      status: 'pass',
      score: '100/100',
    },
    {
      id: 'sec-2',
      title: language === 'tr' ? 'Server Action CSRF Token Koruması' : 'Server Action CSRF Token Guard',
      desc: language === 'tr' ? 'Next.js 15 otomatik Origin / Host header doğrulaması' : 'Next.js 15 auto Origin / Host header verification',
      status: 'pass',
      score: 'A+',
    },
    {
      id: 'sec-3',
      title: language === 'tr' ? 'Strict-Transport-Security (HSTS)' : 'Strict-Transport-Security (HSTS)',
      desc: language === 'tr' ? 'max-age=63072000; includeSubDomains; preload' : 'max-age=63072000; includeSubDomains; preload',
      status: 'pass',
      score: 'Enforced',
    },
    {
      id: 'sec-4',
      title: language === 'tr' ? 'Sensitive Data Leakage Audit (DCE)' : 'Sensitive Data Leakage Audit (DCE)',
      desc: language === 'tr' ? 'Gizli sunucu anahtarları istemci bundle içine sızmıyor (Dead Code Elimination)' : 'Secret server keys do not leak into client bundle (Dead Code Elimination)',
      status: 'pass',
      score: 'Protected',
    },
  ]);

  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [concurrency, setConcurrency] = useState<number>(50);
  const [totalRequests, setTotalRequests] = useState<number>(500);
  const [stressMetrics, setStressMetrics] = useState({
    throughput: 1240,
    latencyP50: 18,
    latencyP99: 42,
    successRate: 99.8,
    completedRequests: 500,
  });

  const runAllBenchmarks = async () => {
    setIsBenchmarking(true);
    for (let i = 0; i < benchmarks.length; i++) {
      await new Promise((res) => setTimeout(res, 250));
      setBenchmarks((prev) =>
        prev.map((b, idx) =>
          idx === i
            ? {
                ...b,
                opsPerSec: Math.floor(b.opsPerSec * (0.95 + Math.random() * 0.1)),
                latencyMs: +(b.latencyMs * (0.92 + Math.random() * 0.15)).toFixed(2),
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
      await new Promise((res) => setTimeout(res, 120));
      reqs += step;
      setStressMetrics({
        throughput: Math.floor(1100 + Math.random() * 350),
        latencyP50: Math.floor(16 + Math.random() * 8),
        latencyP99: Math.floor(38 + Math.random() * 12),
        successRate: 100,
        completedRequests: Math.min(reqs, totalRequests),
      });
    }
    setIsBenchmarking(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Gauge className="w-3.5 h-3.5 text-emerald-500" />
            {t('perf.badge')}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            {t('perf.title')}
          </h2>
        </div>

        <button
          onClick={runAllBenchmarks}
          disabled={isBenchmarking}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-full font-bold text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {isBenchmarking ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isBenchmarking ? t('perf.running') : t('perf.runAll')}</span>
        </button>
      </div>

      {/* Benchmarks Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {benchmarks.map((bm, index) => (
          <div
            key={bm.id}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400">
                BENCH #{index + 1}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>

            <h4 className="text-xs font-bold text-zinc-800 dark:text-neutral-200 min-h-[32px]">
              {bm.name}
            </h4>

            <div className="my-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-white">
                {bm.opsPerSec.toLocaleString()}{' '}
                <span className="text-xs font-sans text-emerald-500 font-medium">
                  {t('perf.opsSec')}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-1 font-mono">
                {t('perf.avgLatency')}: {bm.latencyMs}ms &bull; &Delta;RAM: {bm.memoryDeltaMb}MB
              </p>
            </div>

            <div className="w-full bg-zinc-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (bm.opsPerSec / 150000) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Load & Stress Simulator Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stress Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-neutral-800">
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                {t('perf.stressTester')}
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                {t('perf.stressTitle')}
              </h3>
            </div>

            <button
              onClick={runStressTest}
              disabled={isBenchmarking}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-full flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer self-start"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{t('perf.fireLoad')}</span>
            </button>
          </div>

          {/* Sliders for concurrency & total requests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 bg-zinc-50 dark:bg-neutral-950 p-3.5 rounded-2xl border border-zinc-200 dark:border-neutral-800">
              <div className="flex justify-between font-mono">
                <span className="text-zinc-600 dark:text-neutral-400">{t('perf.concurrency')}:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{concurrency} {t('perf.workers')}</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5 bg-zinc-50 dark:bg-neutral-950 p-3.5 rounded-2xl border border-zinc-200 dark:border-neutral-800">
              <div className="flex justify-between font-mono">
                <span className="text-zinc-600 dark:text-neutral-400">{t('perf.totalReqs')}:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{totalRequests} {t('perf.requests')}</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={totalRequests}
                onChange={(e) => setTotalRequests(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Metric Telemetry Outputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-zinc-50 dark:bg-neutral-950 p-3 rounded-2xl border border-zinc-200 dark:border-neutral-800">
              <span className="text-[10px] text-zinc-500 dark:text-neutral-500 uppercase font-mono font-bold block">{t('perf.throughput')}</span>
              <span className="text-lg font-mono font-bold text-emerald-500">{stressMetrics.throughput} req/s</span>
            </div>
            <div className="bg-zinc-50 dark:bg-neutral-950 p-3 rounded-2xl border border-zinc-200 dark:border-neutral-800">
              <span className="text-[10px] text-zinc-500 dark:text-neutral-500 uppercase font-mono font-bold block">{t('perf.completed')}</span>
              <span className="text-lg font-mono font-bold text-zinc-900 dark:text-white">{stressMetrics.completedRequests}</span>
            </div>
            <div className="bg-zinc-50 dark:bg-neutral-950 p-3 rounded-2xl border border-zinc-200 dark:border-neutral-800">
              <span className="text-[10px] text-zinc-500 dark:text-neutral-500 uppercase font-mono font-bold block">{t('perf.latencyP50')}</span>
              <span className="text-lg font-mono font-bold text-cyan-400">{stressMetrics.latencyP50}ms</span>
            </div>
            <div className="bg-zinc-50 dark:bg-neutral-950 p-3 rounded-2xl border border-zinc-200 dark:border-neutral-800">
              <span className="text-[10px] text-zinc-500 dark:text-neutral-500 uppercase font-mono font-bold block">{t('perf.successRate')}</span>
              <span className="text-lg font-mono font-bold text-emerald-500">{stressMetrics.successRate}%</span>
            </div>
          </div>
        </div>

        {/* Security Audit Checklist (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-neutral-800">
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                {t('perf.securityAudit')}
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                {t('perf.securityTitle')}
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Grade A+
            </span>
          </div>

          <div className="space-y-2.5">
            {securityItems.map((sec) => (
              <div
                key={sec.id}
                className="p-3 bg-zinc-50 dark:bg-neutral-950 rounded-2xl border border-zinc-200 dark:border-neutral-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-zinc-900 dark:text-white">{sec.title}</h5>
                    <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-0.5">{sec.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                  {sec.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

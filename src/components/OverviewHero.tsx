import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';
import { Sparkles, ArrowRight, Zap, Cloud, Box, Server, Clock, GitCommit, Play, CheckCircle2, Swords, Gauge, Activity, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../i18n';

interface OverviewHeroProps {
  setActiveTab: (tab: ActiveTab) => void;
  notesCount: number;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({ setActiveTab, notesCount }) => {
  const { t, language } = useI18n();
  const [latency, setLatency] = useState<number>(14);
  const [buildTime, setBuildTime] = useState<string>('0.4');

  const recentCommits = [
    {
      id: '1',
      title: language === 'tr' ? 'feat: Next.js 16.3 Instant Navigations & Rust React Compiler' : 'feat: Next.js 16.3 Instant Navigations & Rust React Compiler',
      time: language === 'tr' ? 'Az önce' : 'Just now',
      color: 'from-emerald-400 to-cyan-400',
    },
    {
      id: '2',
      title: language === 'tr' ? 'perf: Turbopack persistent caching ile %90 bellek tasarrufu' : 'perf: Turbopack persistent caching with 90% memory savings',
      time: language === 'tr' ? '30 dk önce' : '30m ago',
      color: 'bg-neutral-700',
    },
    {
      id: '3',
      title: language === 'tr' ? 'chore: Node 24 LTS (Krypton) & TypeScript 7 motoru aktif' : 'chore: Node 24 LTS (Krypton) & TypeScript 7 engine enabled',
      time: language === 'tr' ? '2 sa önce' : '2h ago',
      color: 'bg-neutral-800',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 8) + 10);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-5">
      {/* Bento Grid Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Large Hero Bento Tile */}
        <div className="lg:col-span-2 lg:row-span-2 bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm transition-all">
          <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-4">
              <span>{t('hero.badge')}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight mt-1">
              {t('hero.titleLine1')}<br />
              <span className="text-emerald-500">{t('hero.titleLine2')}</span>
            </h2>

            <p className="mt-4 text-zinc-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-md">
              {t('hero.desc')}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 z-10">
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setActiveTab('test-arena')}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-full flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>{t('hero.enterArena')}</span>
              </button>

              <button
                onClick={() => setActiveTab('ws-monitor')}
                className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-cyan-500/30"
              >
                <Radio className="w-3.5 h-3.5 text-cyan-500" />
                <span>WS Monitor</span>
              </button>

              <button
                onClick={() => setActiveTab('docker-cockpit')}
                className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-cyan-500/30"
              >
                <Server className="w-3.5 h-3.5 text-cyan-500" />
                <span>Docker Cockpit</span>
              </button>

              <button
                onClick={() => setActiveTab('server-actions-lab')}
                className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-purple-500/30"
              >
                <Zap className="w-3.5 h-3.5 text-purple-500" />
                <span>Server Actions</span>
              </button>

              <button
                onClick={() => setActiveTab('stress-lab')}
                className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/30"
              >
                <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                <span>Stress Lab</span>
              </button>

              <button
                onClick={() => setActiveTab('performance-lab')}
                className="px-3.5 py-2 bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 font-semibold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-200 dark:border-neutral-700"
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('hero.perfLab')}</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab('scratchpad')}
              className="text-xs font-mono text-zinc-500 dark:text-neutral-400 hover:text-emerald-500 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('hero.notesCount')} ({notesCount})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Emerald Atmospheric Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none"></div>
        </div>

        {/* 2. API Latency Bento Card */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest">
              {t('hero.edgeLatency')}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white">
              {latency}
              <span className="text-zinc-500 dark:text-neutral-500 text-lg ml-1 font-sans">ms</span>
            </div>

            {/* Dynamic Bar Chart */}
            <div className="mt-4 flex items-end gap-1.5 h-12">
              <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-1/3 rounded-md transition-all"></div>
              <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-1/2 rounded-md transition-all"></div>
              <div className="w-full bg-emerald-500 h-full rounded-md shadow-xs animate-pulse"></div>
              <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-2/3 rounded-md transition-all"></div>
              <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-1/4 rounded-md transition-all"></div>
            </div>
          </div>

          <p className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">
            {t('hero.edgeRegion')}
          </p>
        </div>

        {/* 3. Test Suites Passed Bento Card */}
        <div
          onClick={() => setActiveTab('test-arena')}
          className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:border-emerald-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest">
              {t('hero.testCoverage')}
            </span>
            <Swords className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="text-center py-2 sm:py-3">
            <div className="text-4xl sm:text-5xl font-bold text-emerald-500 tracking-tight font-mono">
              100%
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-2 font-mono">
              {t('hero.testModules')}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-neutral-500 pt-2 border-t border-zinc-100 dark:border-neutral-800/80">
            <span>{t('hero.regressionCheck')}</span>
            <span className="text-emerald-500 font-semibold">{t('hero.allPassed')}</span>
          </div>
        </div>

        {/* 4. Recent Commits / Activity Bento Card */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-zinc-400 dark:text-neutral-500" />
              {t('hero.commitLog')}
            </span>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">next@16.3.3 / main</span>
          </div>

          <div className="space-y-3 my-2">
            {recentCommits.map((commit) => (
              <div
                key={commit.id}
                className="flex items-center justify-between border-b border-zinc-100 dark:border-neutral-800/60 pb-2.5 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                      commit.color.includes('from-')
                        ? 'bg-gradient-to-tr ' + commit.color + ' text-neutral-950'
                        : commit.color + ' text-white'
                    }`}
                  >
                    N
                  </div>
                  <div className="text-xs font-medium text-zinc-800 dark:text-neutral-200 truncate max-w-[200px] sm:max-w-xs">
                    {commit.title}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 dark:text-neutral-500 flex-shrink-0">
                  {commit.time}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500 mt-1">
            Turbopack Engine: Rust v1.85 &bull; JIT Persistent Cache Active
          </p>
        </div>

        {/* 5. Build Time Bento Card */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest">
            {t('hero.buildTime')}
          </span>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-emerald-500 italic tracking-tight font-mono">
                {buildTime}
              </div>
              <div className="text-zinc-500 dark:text-neutral-400 text-xs sm:text-sm">{t('hero.seconds')}</div>
            </div>

            <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-2 rounded-full mt-4 overflow-hidden">
              <div className="w-full bg-emerald-500 h-full rounded-full"></div>
            </div>
          </div>

          <p className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">
            {t('hero.turbopackHmr')}
          </p>
        </div>

        {/* 6. Action Bento Card */}
        <div
          onClick={() => setActiveTab('api-simulator')}
          className="bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 rounded-3xl p-6 flex flex-col justify-between group cursor-pointer shadow-md transition-all active:scale-98"
        >
          <span className="text-xs font-bold text-emerald-950 uppercase tracking-widest">
            {t('hero.apiAction')}
          </span>

          <div className="my-3 flex items-center justify-between">
            <div className="text-neutral-950 font-bold text-2xl tracking-tight">
              {t('hero.routeRunner')}
            </div>
            <div className="text-3xl text-neutral-950 group-hover:translate-x-1.5 transition-transform">
              →
            </div>
          </div>

          <p className="text-[11px] font-semibold text-emerald-900">
            {t('hero.routeRunnerDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};

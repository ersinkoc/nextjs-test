import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';
import { Sparkles, ArrowRight, Zap, Cloud, Box, Server, Clock, GitCommit, Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface OverviewHeroProps {
  setActiveTab: (tab: ActiveTab) => void;
  notesCount: number;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({ setActiveTab, notesCount }) => {
  const [latency, setLatency] = useState<number>(24);
  const [buildTime, setBuildTime] = useState<string>('1.2');
  const [recentCommits, setRecentCommits] = useState([
    { id: '1', title: 'feat: add bento grid layout', time: '2m ago', color: 'from-emerald-400 to-cyan-400' },
    { id: '2', title: 'fix: hydration error in app router', time: '1h ago', color: 'bg-neutral-700' },
    { id: '3', title: 'chore: update next.js to v15.2', time: '3h ago', color: 'bg-neutral-800' },
  ]);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Periodic latency simulation for dynamic bento tile
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 15) + 18);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGoLiveClick = () => {
    setActiveTab('api-simulator');
  };

  return (
    <div className="space-y-5">
      {/* Bento Grid Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Large Hero Bento Tile (2 cols, 2 rows on large screens) */}
        <div className="lg:col-span-2 lg:row-span-2 bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm transition-all">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-4">
              <span>Next.js Core Application</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight mt-1">
              Build faster,<br />
              <span className="text-emerald-500">ship smarter.</span>
            </h2>

            <p className="mt-4 text-zinc-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-md">
              Next.js 15 & App Router mimarisi için hafif, reaktif ve çok amaçlı test ortamı. Route Handlers, Server Actions, durum yönetimi ve pratik araçlar tek çatıda.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 z-10">
            <div className="flex gap-3 items-center">
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700/60 flex items-center justify-center text-xl shadow-xs" title="Turbopack">
                ⚡
              </div>
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700/60 flex items-center justify-center text-xl shadow-xs" title="Edge Cloud">
                ☁️
              </div>
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700/60 flex items-center justify-center text-xl shadow-xs" title="Components">
                📦
              </div>
            </div>

            <button
              onClick={() => setActiveTab('scratchpad')}
              className="px-4 py-2 bg-zinc-900 dark:bg-neutral-800 hover:bg-black dark:hover:bg-neutral-700 border border-zinc-800 dark:border-neutral-700 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>Notlara Git ({notesCount})</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          {/* Emerald Atmospheric Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none"></div>
        </div>

        {/* 2. API Latency Bento Card */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest">
              API Latency
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>

          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white">
              {latency}
              <span className="text-zinc-500 dark:text-neutral-500 text-lg ml-1 font-sans">ms</span>
            </div>

            {/* Simulated Dynamic Bar Chart */}
            <div className="mt-4 flex items-end gap-1.5 h-12">
              <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-1/2 rounded-md transition-all"></div>
              <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-2/3 rounded-md transition-all"></div>
              <div className="w-full bg-emerald-500 h-full rounded-md shadow-xs animate-pulse"></div>
              <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-3/4 rounded-md transition-all"></div>
              <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-1/2 rounded-md transition-all"></div>
            </div>
          </div>

          <p className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">
            Edge Region &bull; fra1 (Frankfurt)
          </p>
        </div>

        {/* 3. Server Status Bento Card */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest">
            Server Status
          </span>

          <div className="text-center py-2 sm:py-4">
            <div className="text-4xl sm:text-5xl font-bold text-emerald-500 tracking-tight">
              99.9%
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-2 font-mono">
              Uptime &bull; Last 30 Days
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-neutral-500 pt-2 border-t border-zinc-100 dark:border-neutral-800/80">
            <span>SSL / TLS 1.3</span>
            <span className="text-emerald-500 font-semibold">Active</span>
          </div>
        </div>

        {/* 4. Recent Commits / Activity Bento Card (2 cols on md/lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-zinc-400 dark:text-neutral-500" />
              Recent Commits & Builds
            </span>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">main branch</span>
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
            Commit SHA: a8f9210 &bull; Verified Build
          </p>
        </div>

        {/* 5. Build Time Bento Card */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest">
            Build Time
          </span>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-zinc-900 dark:text-white italic tracking-tight font-mono">
                {buildTime}
              </div>
              <div className="text-zinc-500 dark:text-neutral-400 text-xs sm:text-sm">seconds</div>
            </div>

            <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-2 rounded-full mt-4 overflow-hidden">
              <div className="w-3/4 bg-emerald-500 h-full rounded-full animate-pulse"></div>
            </div>
          </div>

          <p className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">
            Turbopack incremental build
          </p>
        </div>

        {/* 6. Go Live / Action Bento Card */}
        <div
          onClick={handleGoLiveClick}
          className="bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 rounded-3xl p-6 flex flex-col justify-between group cursor-pointer shadow-md transition-all active:scale-98"
        >
          <span className="text-xs font-bold text-emerald-950 uppercase tracking-widest">
            Go Live & Test
          </span>

          <div className="my-3 flex items-center justify-between">
            <div className="text-neutral-950 font-bold text-2xl tracking-tight">
              Test APIs & Actions
            </div>
            <div className="text-3xl text-neutral-950 group-hover:translate-x-1.5 transition-transform">
              →
            </div>
          </div>

          <p className="text-[11px] font-semibold text-emerald-900">
            Route Handlers ve Edge Stream'i test edin
          </p>
        </div>
      </div>
    </div>
  );
};

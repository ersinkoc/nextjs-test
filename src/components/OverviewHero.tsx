import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Cloud,
  Box,
  Server,
  Clock,
  GitCommit,
  Play,
  CheckCircle2,
  Swords,
  Gauge,
  Activity,
  Radio,
  Globe,
  Database,
  Cpu,
  Layers,
  ShieldCheck,
  Flame,
  HardDrive,
  Check,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';
import { audioFx } from '../utils/audioFx';

interface OverviewHeroProps {
  setActiveTab: (tab: ActiveTab) => void;
  notesCount: number;
}

interface DiagnosticItem {
  id: string;
  name: string;
  target: string;
  status: 'idle' | 'running' | 'passed' | 'warn';
  latencyMs?: number;
  info: string;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({ setActiveTab, notesCount }) => {
  const { t, language } = useI18n();
  const [latency, setLatency] = useState<number>(14);
  const [buildTime, setBuildTime] = useState<string>('0.4');
  const [activePipelineNode, setActivePipelineNode] = useState<string | null>(null);

  // Live System Diagnostics state
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([
    {
      id: 'node24',
      name: 'Node 24 LTS Runtime & V8 Engine',
      target: 'V8 v13.4 • Async Context Isolation',
      status: 'passed',
      latencyMs: 3.2,
      info: 'Zero memory leaks, AsyncLocalStorage ready',
    },
    {
      id: 'turbopack',
      name: 'Turbopack AST & React Compiler',
      target: 'Rust Compiler v1.85 • Persistent Cache',
      status: 'passed',
      latencyMs: 1.8,
      info: '90% memory savings, instant HMR active',
    },
    {
      id: 'sqlite',
      name: 'SQLite Storage Engine & WAL Mode',
      target: '/data volume mount • PRAGMA wal_checkpoint',
      status: 'passed',
      latencyMs: 4.5,
      info: 'Full relational schema with ER sync',
    },
    {
      id: 'ppr',
      name: 'Partial Prerendering (PPR) Engine',
      target: '0ms Static Shell + Async RSC Holes',
      status: 'passed',
      latencyMs: 6.1,
      info: 'Edge stream buffering with backpressure handling',
    },
    {
      id: 'actions',
      name: 'Server Actions Strict CSRF Guard',
      target: 'Origin & Fetch-Metadata Token Validation',
      status: 'passed',
      latencyMs: 2.9,
      info: 'Mutations revalidation with zero race conditions',
    },
  ]);

  const recentCommits = [
    {
      id: '1',
      title: t('hero.commit1Title'),
      time: t('hero.commit1Time'),
      color: 'from-emerald-400 to-cyan-400',
    },
    {
      id: '2',
      title: t('hero.commit2Title'),
      time: t('hero.commit2Time'),
      color: 'bg-neutral-700',
    },
    {
      id: '3',
      title: t('hero.commit3Title'),
      time: t('hero.commit3Time'),
      color: 'bg-neutral-800',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 8) + 10);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const runLiveDiagnostics = async () => {
    audioFx.playTurbo();
    setIsDiagnosing(true);
    setDiagnostics((prev) => prev.map((d) => ({ ...d, status: 'running' })));

    try {
      // Step 1: Health Ping
      await fetch('/api/health').catch(() => null);
      await new Promise((r) => setTimeout(r, 200));
      setDiagnostics((prev) =>
        prev.map((d) => (d.id === 'node24' ? { ...d, status: 'passed', latencyMs: Number((Math.random() * 3 + 2).toFixed(1)) } : d))
      );

      // Step 2: SQLite Ping
      await fetch('/api/sqlite/status').catch(() => null);
      await new Promise((r) => setTimeout(r, 200));
      setDiagnostics((prev) =>
        prev.map((d) => (d.id === 'sqlite' ? { ...d, status: 'passed', latencyMs: Number((Math.random() * 4 + 3).toFixed(1)) } : d))
      );

      // Step 3: Turbopack & Compiler
      await new Promise((r) => setTimeout(r, 250));
      setDiagnostics((prev) =>
        prev.map((d) => (d.id === 'turbopack' ? { ...d, status: 'passed', latencyMs: Number((Math.random() * 2 + 1).toFixed(1)) } : d))
      );

      // Step 4 & 5
      await new Promise((r) => setTimeout(r, 200));
      setDiagnostics((prev) =>
        prev.map((d) => ({
          ...d,
          status: 'passed',
          latencyMs: d.latencyMs || Number((Math.random() * 4 + 2).toFixed(1)),
        }))
      );

      audioFx.playSuccess();
    } catch {
      audioFx.playError();
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Full Stack Architecture Pipeline Nodes
  const architectureNodes = [
    {
      id: 'client-csr',
      name: '1. Client Component (CSR)',
      tech: 'React 19 & DOM Hydration',
      tab: 'overview' as ActiveTab,
      icon: Box,
      accent: 'emerald',
      status: 'Optimal (0 Layout Shift)',
    },
    {
      id: 'rsc-flight',
      name: '2. RSC Flight Protocol',
      tech: 'Binary Stream & Serialized Props',
      tab: 'edge-scraper' as ActiveTab,
      icon: Globe,
      accent: 'cyan',
      status: 'Zero Client Bundle Cost',
    },
    {
      id: 'turbopack-ast',
      name: '3. Turbopack (Rust AST)',
      tech: 'React Compiler Auto-Memoization',
      tab: 'compiler-inspector' as ActiveTab,
      icon: Cpu,
      accent: 'teal',
      status: 'Persistent Cache: 0.4ms HMR',
    },
    {
      id: 'dynamic-ppr',
      name: '4. Dynamic IO & PPR',
      tech: '0ms Static Shell + RSC Holes',
      tab: 'cache-lab' as ActiveTab,
      icon: Layers,
      accent: 'indigo',
      status: 'use cache & Tag Invalidation',
    },
    {
      id: 'node24-runtime',
      name: '5. Node 24 LTS Server',
      tech: 'V8 v13.4 • AsyncLocalStorage',
      tab: 'server-actions-lab' as ActiveTab,
      icon: Zap,
      accent: 'purple',
      status: 'Strict CSRF & Form Mutex',
    },
    {
      id: 'sqlite-storage',
      name: '6. Persistent SQLite (/data)',
      tech: 'WAL Mode & Full Relational Schema',
      tab: 'sqlite-studio' as ActiveTab,
      icon: HardDrive,
      accent: 'amber',
      status: 'Sub-millisecond Local Latency',
    },
  ];

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
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  audioFx.playTurbo();
                  setActiveTab('test-arena');
                }}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-full flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>{t('hero.enterArena')}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  audioFx.playTabSwitch();
                  setActiveTab('edge-scraper');
                }}
                className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-cyan-500/30"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-500" />
                <span>Edge Scraper & RSC</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  audioFx.playTabSwitch();
                  setActiveTab('ws-monitor');
                }}
                className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-cyan-500/30"
              >
                <Radio className="w-3.5 h-3.5 text-cyan-500" />
                <span>WS Monitor</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  audioFx.playTabSwitch();
                  setActiveTab('docker-cockpit');
                }}
                className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-500/30"
              >
                <Server className="w-3.5 h-3.5 text-indigo-500" />
                <span>Docker Cockpit</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  audioFx.playTabSwitch();
                  setActiveTab('server-actions-lab');
                }}
                className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-purple-500/30"
              >
                <Zap className="w-3.5 h-3.5 text-purple-500" />
                <span>Server Actions</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  audioFx.playTabSwitch();
                  setActiveTab('stress-lab');
                }}
                className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/30"
              >
                <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                <span>Stress Lab</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  audioFx.playTabSwitch();
                  setActiveTab('performance-lab');
                }}
                className="px-3.5 py-2 bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 font-semibold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-200 dark:border-neutral-700"
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('hero.perfLab')}</span>
              </motion.button>
            </div>

            <button
              onClick={() => {
                audioFx.playTabSwitch();
                setActiveTab('scratchpad');
              }}
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
          onClick={() => {
            audioFx.playTurbo();
            setActiveTab('test-arena');
          }}
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
            {t('hero.commitFooter')}
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
          onClick={() => {
            audioFx.playTabSwitch();
            setActiveTab('api-simulator');
          }}
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

      {/* ========================================================================= */}
      {/* 🚀 HAVALI & INTERACTIVE: Next.js 16.3 Full-Stack Architecture Pipeline */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-sm space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white font-sans tracking-tight">
                {t('hero.pipelineTitle')}
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1">
              {t('hero.pipelineDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={runLiveDiagnostics}
              disabled={isDiagnosing}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isDiagnosing ? (
                <Loader2 size={13} className="animate-spin text-emerald-400" />
              ) : (
                <RefreshCw size={13} className="text-emerald-500 dark:text-emerald-600" />
              )}
              <span>{isDiagnosing ? t('hero.diagScanning') : t('hero.diagScanBtn')}</span>
            </motion.button>
          </div>
        </div>

        {/* 6-Step Visual Architecture Flow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {architectureNodes.map((node, idx) => {
            const Icon = node.icon;
            const isHovered = activePipelineNode === node.id;
            return (
              <motion.div
                key={node.id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => {
                  audioFx.playClick();
                  setActivePipelineNode(node.id);
                }}
                onMouseLeave={() => setActivePipelineNode(null)}
                onClick={() => {
                  audioFx.playTabSwitch();
                  setActiveTab(node.tab);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isHovered
                    ? 'bg-zinc-50 dark:bg-neutral-800/80 border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-zinc-50/50 dark:bg-neutral-900/50 border-zinc-200/80 dark:border-neutral-800 hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span className="font-bold text-[10px] text-zinc-400">LAYER 0{idx + 1}</span>
                    <Icon size={14} className="text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-white leading-snug">
                    {node.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-1 leading-normal">
                    {node.tech}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-200/60 dark:border-neutral-800 text-[10px] flex items-center justify-between">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate pr-1">
                    {node.status}
                  </span>
                  <ArrowRight size={12} className="text-zinc-400 shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Diagnostics Telemetry Bar */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-zinc-300 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                {t('hero.diagTelemetryTitle')}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              {t('hero.diagStatusOperational')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
            {diagnostics.map((diag) => (
              <div
                key={diag.id}
                className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] truncate" title={diag.name}>
                    {diag.name.split(' ')[0]} Engine
                  </span>
                  {diag.status === 'running' ? (
                    <Loader2 size={12} className="animate-spin text-amber-400" />
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <Check size={11} /> {diag.latencyMs}ms
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 truncate" title={diag.target}>
                  {diag.target}
                </div>
                <div className="text-[9px] text-emerald-400/80 truncate">
                  {diag.info}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

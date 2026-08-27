import React, { useState } from 'react';
import {
  Cpu,
  Code2,
  Sparkles,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  ArrowRight,
  Boxes
} from 'lucide-react';
import { useI18n } from '../i18n';
import { BundleVisualizer } from './BundleVisualizer';

interface ComponentSample {
  id: string;
  name: string;
  rawCode: string;
  compiledCode: string;
  stats: {
    rawLines: number;
    compiledLines: number;
    memoSavingsPct: number;
    compileTimeMs: number;
  };
}

export const CompilerInspector: React.FC = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'bundle' | 'ast'>('bundle');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedCompiled, setCopiedCompiled] = useState(false);

  const samples: ComponentSample[] = [
    {
      id: 'dashboard-card',
      name: 'UserAnalyticsDashboard.tsx',
      rawCode: `// ❌ Standard React (Manual Memoization Boilerplate)
import { useMemo, useCallback } from 'react';

export function UserAnalyticsDashboard({ user, events, onSelect }: Props) {
  // Developer must manually construct memoization arrays
  const filteredEvents = useMemo(() => {
    return events.filter(e => e.userId === user.id && e.active);
  }, [events, user.id]);

  const handleItemClick = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  return (
    <div>
      <h2>{user.name} Activity</h2>
      <EventList items={filteredEvents} onClick={handleItemClick} />
    </div>
  );
}`,
      compiledCode: `// ✅ Rust React Compiler (Next.js 16.3 + Turbopack)
// Auto-Memoized Signals AST output (Zero useMemo/useCallback needed!)
export function UserAnalyticsDashboard(props) {
  const $ = _c(8); // React Compiler 8-slot cache block
  const { user, events, onSelect } = props;

  let t0;
  if ($[0] !== events || $[1] !== user.id) {
    t0 = events.filter((e) => e.userId === user.id && e.active);
    $[0] = events;
    $[1] = user.id;
    $[2] = t0;
  } else {
    t0 = $[2];
  }

  let t1;
  if ($[3] !== onSelect) {
    t1 = (id) => onSelect(id);
    $[3] = onSelect;
    $[4] = t1;
  } else {
    t1 = $[4];
  }

  return (
    <div>
      <h2>{user.name} Activity</h2>
      <EventList items={t0} onClick={t1} />
    </div>
  );
}`,
      stats: {
        rawLines: 18,
        compiledLines: 28,
        memoSavingsPct: 88,
        compileTimeMs: 0.18,
      },
    },
    {
      id: 'feed-list',
      name: 'DynamicVirtualFeed.tsx',
      rawCode: `// ❌ Standard React: Heavy recalculation on every parent re-render
export function DynamicVirtualFeed({ posts, theme, activeTag }: FeedProps) {
  const filtered = useMemo(() => {
    return posts.filter(p => p.tag === activeTag);
  }, [posts, activeTag]);

  return <VirtualContainer list={filtered} theme={theme} />;
}`,
      compiledCode: `// ✅ Rust React Compiler Output: Fine-Grained Reactive AST
export function DynamicVirtualFeed(props) {
  const $ = _c(4);
  const { posts, theme, activeTag } = props;

  let t0;
  if ($[0] !== posts || $[1] !== activeTag) {
    t0 = posts.filter((p) => p.tag === activeTag);
    $[0] = posts;
    $[1] = activeTag;
    $[2] = t0;
  } else {
    t0 = $[2];
  }

  return <VirtualContainer list={t0} theme={theme} />;
}`,
      stats: {
        rawLines: 9,
        compiledLines: 17,
        memoSavingsPct: 92,
        compileTimeMs: 0.12,
      },
    },
  ];

  const [selectedSampleId, setSelectedSampleId] = useState('dashboard-card');
  const activeSample = samples.find((s) => s.id === selectedSampleId) || samples[0];

  const copyToClipboard = (text: string, isRaw: boolean) => {
    navigator.clipboard.writeText(text);
    if (isRaw) {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 1500);
    } else {
      setCopiedCompiled(true);
      setTimeout(() => setCopiedCompiled(false), 1500);
    }
  };

  return (
    <div className="space-y-6" id="compiler-inspector-module">
      {/* Sub-Navigation Switcher between Bundle Visualizer and AST Diff */}
      <div className="p-1.5 rounded-3xl bg-zinc-100 dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 flex items-center gap-2 max-w-fit shadow-2xs">
        <button
          onClick={() => setActiveTab('bundle')}
          className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'bundle'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Boxes size={14} />
          <span>{t('compiler.tabBundle')}</span>
        </button>

        <button
          onClick={() => setActiveTab('ast')}
          className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ast'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Cpu size={14} />
          <span>{t('compiler.tabAst')}</span>
        </button>
      </div>

      {/* Tab 1: Bundle Visualizer (D3 TreeMap) */}
      {activeTab === 'bundle' && <BundleVisualizer />}

      {/* Tab 2: Rust React Compiler AST Diff */}
      {activeTab === 'ast' && (
        <div className="space-y-6">
          {/* Header Bento Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                {t('compiler.badge')}
              </span>
              <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
                Rust Core AST Engine
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
              {t('compiler.title')}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1">
              {t('compiler.desc')}
            </p>
          </div>

          {/* Component Selector & Metrics */}
          <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Sample Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSampleId(s.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all ${
                    selectedSampleId === s.id
                      ? 'bg-zinc-900 text-white dark:bg-neutral-800 dark:text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-neutral-800/60 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Compiler Stats */}
            <div className="flex items-center gap-4 text-xs font-mono font-bold text-zinc-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" />
                <span>AST Parse: {activeSample.stats.compileTimeMs}ms (Rust)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-500" />
                <span>-{activeSample.stats.memoSavingsPct}% Re-renders</span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Diff View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: Raw Code */}
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider">
                  {t('compiler.rawCode')}
                </span>
                <button
                  onClick={() => copyToClipboard(activeSample.rawCode, true)}
                  className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-neutral-200"
                >
                  {copiedRaw ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedRaw ? 'Copied' : t('tools.copy')}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-zinc-950 text-rose-400 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800 h-[380px] scrollbar-thin">
                <code>{activeSample.rawCode}</code>
              </pre>
            </div>

            {/* Right: Compiled Code */}
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider">
                  {t('compiler.compiledCode')}
                </span>
                <button
                  onClick={() => copyToClipboard(activeSample.compiledCode, false)}
                  className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-neutral-200"
                >
                  {copiedCompiled ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedCompiled ? 'Copied' : t('tools.copy')}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800 h-[380px] scrollbar-thin">
                <code>{activeSample.compiledCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


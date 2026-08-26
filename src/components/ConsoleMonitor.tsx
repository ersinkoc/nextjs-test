import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Terminal,
  Trash2,
  Pause,
  Play,
  Copy,
  Check,
  Search,
  AlertTriangle,
  AlertOctagon,
  Info,
  Bug,
  Sparkles,
  ArrowDown,
  CornerDownLeft,
  Filter,
  Download,
  Layers,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface ConsoleEntry {
  id: string;
  level: LogLevel;
  timestamp: string;
  args: any[];
  formatted: string;
  stack?: string;
  count: number;
}

// Global registry to retain logs across tab switches
let globalConsoleLogs: ConsoleEntry[] = [];
let globalListeners: Array<(entry: ConsoleEntry) => void> = [];
let isInterceptorInitialized = false;

// Original console functions
const originalConsole = {
  log: window.console.log,
  info: window.console.info,
  warn: window.console.warn,
  error: window.console.error,
  debug: window.console.debug,
};

function formatArg(arg: any): string {
  if (arg === null) return 'null';
  if (arg === undefined) return 'undefined';
  if (typeof arg === 'string') return arg;
  if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
  if (typeof arg === 'function') return `[Function: ${arg.name || 'anonymous'}]`;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
  try {
    return JSON.stringify(arg, null, 2);
  } catch {
    return String(arg);
  }
}

function initConsoleInterceptor() {
  if (isInterceptorInitialized) return;
  isInterceptorInitialized = true;

  const levels: LogLevel[] = ['log', 'info', 'warn', 'error', 'debug'];

  levels.forEach((level) => {
    const orig = originalConsole[level];
    window.console[level] = (...args: any[]) => {
      // Call original method so DevTools receives it
      try {
        orig.apply(window.console, args);
      } catch {
        // Safe fallback
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      const formatted = args.map(formatArg).join(' ');

      // Check if same as last log for dedup counting
      const lastEntry = globalConsoleLogs[globalConsoleLogs.length - 1];
      if (lastEntry && lastEntry.level === level && lastEntry.formatted === formatted) {
        lastEntry.count += 1;
        lastEntry.timestamp = timeStr;
        globalListeners.forEach((listener) => listener({ ...lastEntry }));
        return;
      }

      let stack: string | undefined;
      if (level === 'error') {
        const err = args.find((a) => a instanceof Error);
        if (err) stack = err.stack;
        else {
          try {
            stack = new Error().stack?.split('\n').slice(2).join('\n');
          } catch {
            // ignore
          }
        }
      }

      const entry: ConsoleEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        level,
        timestamp: timeStr,
        args,
        formatted,
        stack,
        count: 1,
      };

      globalConsoleLogs.push(entry);
      if (globalConsoleLogs.length > 500) {
        globalConsoleLogs.shift();
      }

      globalListeners.forEach((listener) => listener(entry));
    };
  });

  // Initial greeting
  window.console.info(
    '⚡ [Next.js 16.3 DevTools] Console Monitor active. Intercepting window.console (log, info, warn, error, debug).'
  );
}

export const ConsoleMonitor: React.FC = () => {
  const { t, language } = useI18n();

  const [logs, setLogs] = useState<ConsoleEntry[]>(() => [...globalConsoleLogs]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initConsoleInterceptor();

    const listener = (entry: ConsoleEntry) => {
      if (isPaused) return;
      setLogs((prev) => {
        const existingIdx = prev.findIndex((item) => item.id === entry.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = entry;
          return updated;
        }
        return [...prev, entry];
      });
    };

    globalListeners.push(listener);
    return () => {
      globalListeners = globalListeners.filter((l) => l !== listener);
    };
  }, [isPaused]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedLevel !== 'all' && log.level !== selectedLevel) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return log.formatted.toLowerCase().includes(q) || log.level.toLowerCase().includes(q);
      }
      return true;
    });
  }, [logs, selectedLevel, searchQuery]);

  const levelCounts = useMemo(() => {
    const counts = { all: logs.length, log: 0, info: 0, warn: 0, error: 0, debug: 0 };
    logs.forEach((l) => {
      counts[l.level] = (counts[l.level] || 0) + 1;
    });
    return counts;
  }, [logs]);

  const handleClear = () => {
    globalConsoleLogs = [];
    setLogs([]);
  };

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.formatted}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.formatted}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nextjs16-console-logs-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Quick Emit Handlers
  const emitSample = (type: LogLevel) => {
    switch (type) {
      case 'log':
        console.log(
          '✓ [Turbopack Build] Compiled /app/dashboard in 12.4ms (16 modules cached in RAM)'
        );
        break;
      case 'info':
        console.info('ℹ [Partial Prerendering] PPR Shell rendered statically. Dynamic stream connected.', {
          runtime: 'edge',
          route: '/api/v1/stream',
          ttfb: '8.2ms',
        });
        break;
      case 'warn':
        console.warn('⚠ [Dynamic IO Warning] Synchronous access to `cookies()` outside "use cache" scope.');
        break;
      case 'error':
        console.error(new Error('Hydration Mismatch in Server Component <ClientSlot id="arena-root">'));
        break;
      case 'debug':
        console.debug('[React Compiler AST] Memoization slot #4 created for MemoizedProfileComponent', {
          inputs: ['userId', 'theme'],
          recomputations: 0,
        });
        break;
    }
  };

  const emitComplexObject = () => {
    console.log('⚡ [Next.js 16 Runtime Manifest]', {
      version: '16.3.3',
      turbopack: {
        persistentCaching: true,
        workers: 16,
        memoryConsumptionMb: 42.8,
      },
      ppr: {
        enabled: true,
        streamingBoundary: 'React 19 Suspense',
      },
      serverActions: {
        encryption: 'AES-256-GCM',
        concurrencyMutex: 'Active',
      },
    });
  };

  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    setCommandInput('');

    // Log the evaluated command
    console.log(`> ${cmd}`);

    try {
      // Safe execution in current window context
      // eslint-disable-next-line no-eval
      const result = window.eval(cmd);
      if (result !== undefined) {
        console.info('←', result);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const getLevelStyle = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return {
          rowBg: 'bg-rose-500/10 hover:bg-rose-500/15 border-l-4 border-l-rose-500 border-zinc-800/80',
          textColor: 'text-rose-400 dark:text-rose-300',
          badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          icon: <AlertOctagon size={13} className="text-rose-500 flex-shrink-0" />,
        };
      case 'warn':
        return {
          rowBg: 'bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-l-amber-500 border-zinc-800/80',
          textColor: 'text-amber-300 dark:text-amber-200',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />,
        };
      case 'info':
        return {
          rowBg: 'bg-sky-500/5 hover:bg-sky-500/10 border-l-4 border-l-sky-500 border-zinc-800/80',
          textColor: 'text-sky-300 dark:text-sky-200',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          icon: <Info size={13} className="text-sky-400 flex-shrink-0" />,
        };
      case 'debug':
        return {
          rowBg: 'bg-purple-500/5 hover:bg-purple-500/10 border-l-4 border-l-purple-500 border-zinc-800/80',
          textColor: 'text-purple-300 dark:text-purple-200',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: <Bug size={13} className="text-purple-400 flex-shrink-0" />,
        };
      case 'log':
      default:
        return {
          rowBg: 'bg-zinc-900/40 hover:bg-zinc-900/80 border-l-4 border-l-zinc-600 border-zinc-800/80',
          textColor: 'text-zinc-200',
          badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          icon: <Terminal size={13} className="text-emerald-400 flex-shrink-0" />,
        };
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-5">
      {/* Header Bento Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-black border border-zinc-800 text-emerald-400 flex items-center justify-center shadow-xs">
            <Terminal size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {t('console.title')}
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isPaused ? 'PAUSED' : 'INTERCEPTOR LIVE'}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {logs.length} {t('console.totalEntries')}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-0.5">
              {t('console.desc')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="console-pause-toggle-btn"
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
              isPaused
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700 border-transparent'
            }`}
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
            <span>{isPaused ? t('console.resume') : t('console.pause')}</span>
          </button>

          <button
            id="console-autoscroll-toggle-btn"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
              autoScroll
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700 border-transparent'
            }`}
          >
            <ArrowDown size={13} />
            <span>{t('console.autoScroll')}</span>
          </button>

          <button
            id="console-copy-btn"
            onClick={handleCopyLogs}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 text-xs font-mono font-semibold transition-all"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            <span>{copied ? t('console.copied') : t('tools.copy')}</span>
          </button>

          <button
            id="console-download-btn"
            onClick={handleDownloadLogs}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 text-xs font-mono font-semibold transition-all"
          >
            <Download size={13} />
          </button>

          <button
            id="console-clear-btn"
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-semibold transition-all"
          >
            <Trash2 size={13} />
            <span>{t('console.clear')}</span>
          </button>
        </div>
      </div>

      {/* Interactive Trigger Bar: Emitters */}
      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-zinc-600 dark:text-neutral-400 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>Test Log Triggers:</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-400">Click to emit sample console events</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => emitSample('log')}
            className="px-2.5 py-1 rounded-xl bg-zinc-200 dark:bg-neutral-800 hover:bg-zinc-300 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <Terminal size={12} className="text-emerald-500" />
            <span>{t('console.emitLog')}</span>
          </button>

          <button
            onClick={() => emitSample('info')}
            className="px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <Info size={12} className="text-sky-500" />
            <span>{t('console.emitInfo')}</span>
          </button>

          <button
            onClick={() => emitSample('warn')}
            className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <AlertTriangle size={12} className="text-amber-500" />
            <span>{t('console.emitWarn')}</span>
          </button>

          <button
            onClick={() => emitSample('error')}
            className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <AlertOctagon size={12} className="text-rose-500" />
            <span>{t('console.emitError')}</span>
          </button>

          <button
            onClick={() => emitSample('debug')}
            className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <Bug size={12} className="text-purple-500" />
            <span>Debug</span>
          </button>

          <button
            onClick={emitComplexObject}
            className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <Layers size={12} />
            <span>{t('console.emitObj')}</span>
          </button>
        </div>
      </div>

      {/* Terminal View Panel */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden font-mono flex flex-col">
        {/* Terminal Header Bar */}
        <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-zinc-500 mr-1 flex items-center gap-1">
              <Filter size={11} />
              Filter:
            </span>
            {(['all', 'log', 'info', 'warn', 'error', 'debug'] as const).map((lvl) => {
              const count = levelCounts[lvl];
              const isSelected = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <span>{lvl}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-zinc-400 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Filter Input */}
          <div className="relative w-full md:w-56">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('console.searchPlaceholder')}
              className="w-full pl-7 pr-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>
        </div>

        {/* Terminal Logs Output View */}
        <div
          ref={scrollContainerRef}
          className="h-80 overflow-y-auto p-3 space-y-1 scrollbar-thin bg-black/90 select-text"
        >
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
              <Terminal size={32} className="mb-2 opacity-40 text-emerald-500" />
              <p className="text-xs max-w-md">{t('console.empty')}</p>
            </div>
          ) : (
            filteredLogs.map((entry) => {
              const style = getLevelStyle(entry.level);
              const isExpanded = expandedId === entry.id;

              return (
                <div
                  key={entry.id}
                  className={`p-2 rounded-lg border transition-all text-xs ${style.rowBg}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {style.icon}
                      <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0 pt-0.5">
                        {entry.timestamp}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border flex-shrink-0 ${style.badge}`}
                      >
                        {entry.level}
                      </span>
                      {entry.count > 1 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          ×{entry.count}
                        </span>
                      )}

                      <div className={`font-mono text-xs break-all leading-relaxed ${style.textColor}`}>
                        {entry.formatted}
                      </div>
                    </div>

                    {entry.stack && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="text-zinc-500 hover:text-zinc-300 p-0.5 text-[10px] flex items-center gap-0.5"
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <span>Stack</span>
                      </button>
                    )}
                  </div>

                  {/* Stack Trace Collapsible */}
                  {entry.stack && isExpanded && (
                    <div className="mt-2 p-2 rounded bg-black/80 text-[10px] text-rose-300/80 font-mono overflow-x-auto whitespace-pre border border-rose-900/30">
                      {entry.stack}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Interactive REPL Prompt Footer */}
        <form
          onSubmit={handleExecuteCommand}
          className="p-2.5 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2"
        >
          <span className="text-emerald-400 font-bold text-sm pl-1">&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder={t('console.runPrompt')}
            className="flex-1 bg-transparent text-white text-xs font-mono placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1 transition-colors"
          >
            <span>Eval</span>
            <CornerDownLeft size={11} />
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  Flame,
  Activity,
  Boxes,
  Cpu,
  Terminal,
  FileCode2,
  Wrench,
  X,
  ArrowRight,
  Database,
  Share2,
  HardDrive,
  Container,
  Send,
  Shuffle,
  Gauge,
  Radio
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const commands = [
    {
      id: 'overview' as ActiveTab,
      title: t('nav.overview'),
      category: 'Navigation',
      icon: LayoutDashboard,
      keywords: 'dashboard bento metrics overview home',
    },
    {
      id: 'docker-cockpit' as ActiveTab,
      title: t('nav.dockerCockpit'),
      category: 'Docker & DevOps',
      icon: Container,
      keywords: 'docker container alpine standalone compose dockerfile multistage cgroups coldstart memory oom nonroot',
    },
    {
      id: 'server-actions-lab' as ActiveTab,
      title: t('nav.serverActionsLab'),
      category: 'Next.js 16.3 Engine',
      icon: Send,
      keywords: 'server actions use server useoptimistic useactionstate form progressive enhancement csrf mutex revalidatepath',
    },
    {
      id: 'middleware-inspector' as ActiveTab,
      title: t('nav.middlewareInspector'),
      category: 'Next.js 16.3 Engine',
      icon: Shuffle,
      keywords: 'middleware edge routing matcher redirect rewrite nexturl geo location ip parallel intercepting slots',
    },
    {
      id: 'test-arena' as ActiveTab,
      title: t('nav.testArena'),
      category: 'Testing',
      icon: Flame,
      keywords: 'test arena tests instant navigations server actions ppr compiler 16.3',
    },
    {
      id: 'ws-monitor' as ActiveTab,
      title: t('nav.wsMonitor'),
      category: 'Real-Time & Telemetry',
      icon: Radio,
      keywords: 'websocket event monitor real-time socket connection states incoming events payloads table stream telemetry debug ping pong',
    },
    {
      id: 'stress-lab' as ActiveTab,
      title: t('nav.stressLab'),
      category: 'Stress & Latency',
      icon: Gauge,
      keywords: 'stress test laboratory concurrent requests real-time line chart response time success rate latency p95 p99 throughput rps api simulator',
    },
    {
      id: 'performance-lab' as ActiveTab,
      title: t('nav.performanceLab'),
      category: 'Stress & Chaos',
      icon: Activity,
      keywords: 'stress chaos performance load 50000 benchmark rps heap v8',
    },
    {
      id: 'edge-sandbox' as ActiveTab,
      title: t('nav.edgeSandbox'),
      category: 'Next.js 16.3 Engine',
      icon: Boxes,
      keywords: 'ppr partial prerendering optimistic server actions flight rsc stream',
    },
    {
      id: 'compiler-inspector' as ActiveTab,
      title: t('nav.compilerInspector'),
      category: 'Compiler & AST',
      icon: Cpu,
      keywords: 'react compiler rust ast signals turbopack bytecode diff usememo',
    },
    {
      id: 'cache-lab' as ActiveTab,
      title: t('nav.cacheLab'),
      category: 'Cache Control',
      icon: Database,
      keywords: 'cache dynamic io use cache cachelife cachetag revalidatetag ttl purge',
    },
    {
      id: 'og-metadata' as ActiveTab,
      title: t('nav.ogMetadata'),
      category: 'Metadata & Social',
      icon: Share2,
      keywords: 'og image metadata generatemetadata vercel og imageresponse twitter serp schema',
    },
    {
      id: 'api-simulator' as ActiveTab,
      title: t('nav.apiSimulator'),
      category: 'API Sandbox',
      icon: Terminal,
      keywords: 'api route handler app router simulation get post stream',
    },
    {
      id: 'sqlite-studio' as ActiveTab,
      title: t('nav.sqliteStudio'),
      category: 'Storage & Database',
      icon: HardDrive,
      keywords: 'sqlite database disk storage volume mount directus wal pragma query persistent kalici veritabani',
    },
    {
      id: 'scratchpad' as ActiveTab,
      title: t('nav.scratchpad'),
      category: 'Notes',
      icon: FileCode2,
      keywords: 'notes scratchpad todo ideas deneme fikir',
    },
    {
      id: 'tools' as ActiveTab,
      title: t('nav.tools'),
      category: 'Utilities',
      icon: Wrench,
      keywords: 'tools config custom branding brand color palette css variable next.config.ts middleware otel uuid base64 json',
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 border-b border-zinc-200 dark:border-neutral-800">
            <Search size={18} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command, test scenario, or view..."
              className="w-full px-3 py-4 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none font-mono"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-neutral-200"
            >
              <X size={16} />
            </button>
          </div>

          {/* Command Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-400">
                No matching tools or test modules found.
              </div>
            ) : (
              filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      onSelectTab(cmd.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl text-left hover:bg-zinc-100 dark:hover:bg-neutral-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-neutral-800 flex items-center justify-center text-zinc-600 dark:text-neutral-300 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-white">
                          {cmd.title}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {cmd.category}
                        </div>
                      </div>
                    </div>

                    <ArrowRight
                      size={14}
                      className="text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
                    />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 bg-zinc-50 dark:bg-neutral-950 border-t border-zinc-200 dark:border-neutral-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Navigation Quick Jumper</span>
            <span>ESC to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

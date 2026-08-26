import React from 'react';
import {
  LayoutDashboard,
  Flame,
  Activity,
  Boxes,
  Cpu,
  Terminal,
  FileCode2,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  Sparkles,
  Server,
  Layers,
  Database,
  Share2
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useI18n } from '../i18n';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { t } = useI18n();

  const navGroups = [
    {
      groupKey: 'nav.group.main',
      items: [
        {
          id: 'overview' as ActiveTab,
          labelKey: 'nav.overview',
          icon: LayoutDashboard,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        },
        {
          id: 'api-simulator' as ActiveTab,
          labelKey: 'nav.apiSimulator',
          icon: Terminal,
          badge: 'RSC',
          badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
        },
      ],
    },
    {
      groupKey: 'nav.group.stress',
      items: [
        {
          id: 'test-arena' as ActiveTab,
          labelKey: 'nav.testArena',
          icon: Flame,
          badge: '12 Tests',
          badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        },
        {
          id: 'performance-lab' as ActiveTab,
          labelKey: 'nav.performanceLab',
          icon: Activity,
          badge: '50k RPS',
          badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        },
      ],
    },
    {
      groupKey: 'nav.group.runtime',
      items: [
        {
          id: 'edge-sandbox' as ActiveTab,
          labelKey: 'nav.edgeSandbox',
          icon: Boxes,
          badge: 'PPR',
          badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        },
        {
          id: 'cache-lab' as ActiveTab,
          labelKey: 'nav.cacheLab',
          icon: Database,
          badge: 'use cache',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        },
        {
          id: 'compiler-inspector' as ActiveTab,
          labelKey: 'nav.compilerInspector',
          icon: Cpu,
          badge: 'Rust AST',
          badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
        },
        {
          id: 'og-metadata' as ActiveTab,
          labelKey: 'nav.ogMetadata',
          icon: Share2,
          badge: 'OG Image',
          badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        },
      ],
    },
    {
      groupKey: 'nav.group.tools',
      items: [
        {
          id: 'scratchpad' as ActiveTab,
          labelKey: 'nav.scratchpad',
          icon: FileCode2,
        },
        {
          id: 'tools' as ActiveTab,
          labelKey: 'nav.tools',
          icon: Wrench,
          badge: 'v16.3',
          badgeColor: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
        },
      ],
    },
  ];

  return (
    <aside
      id="main-sidebar"
      className={`relative flex flex-col bg-white dark:bg-neutral-900/95 border-r border-zinc-200 dark:border-neutral-800 transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-900 to-black dark:from-neutral-800 dark:to-neutral-950 text-white flex items-center justify-center font-mono font-bold text-sm tracking-tighter shadow-sm border border-zinc-700/50">
            <span className="text-emerald-400">N</span>
            <span>16</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-zinc-900 dark:text-white tracking-tight">Next.js 16.3</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Arena
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-neutral-400 font-mono tracking-wider">
                Node 24 LTS (Krypton)
              </span>
            </div>
          )}
        </div>

        <button
          id="toggle-sidebar-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
          title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Group Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6 scrollbar-thin">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-neutral-500">
                {t(group.groupKey)}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    title={isCollapsed ? t(item.labelKey) : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-neutral-800 dark:text-white shadow-sm font-semibold'
                        : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-neutral-200 hover:bg-zinc-100 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-emerald-400'
                          : 'text-zinc-500 dark:text-neutral-400 group-hover:text-zinc-700 dark:group-hover:text-neutral-200'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{t(item.labelKey)}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          item.badgeColor || 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 border-zinc-200 dark:border-neutral-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Active left indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Info Card */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-zinc-200 dark:border-neutral-800">
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950/80 border border-zinc-200/80 dark:border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Turbopack Core
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Active
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-neutral-400 leading-snug">
              Rust AST compiler, PPR streaming engine & 16 worker threads.
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-zinc-200 dark:border-neutral-800 flex justify-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" title="Turbopack Active"></div>
        </div>
      )}
    </aside>
  );
};

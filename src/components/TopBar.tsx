import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Globe,
  RotateCcw,
  Flame,
  Search,
  CheckCircle2,
  Terminal,
  Layers,
  Sparkles,
  Command
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useI18n, Language } from '../i18n';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDark: boolean;
  setIsDark: (val: boolean | ((prev: boolean) => boolean)) => void;
  onResetAll: () => void;
  onOpenCommandPalette?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  onResetAll,
  onOpenCommandPalette,
}) => {
  const { t, language, setLanguage } = useI18n();

  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'overview':
        return t('nav.overview');
      case 'test-arena':
        return t('nav.testArena');
      case 'performance-lab':
        return t('nav.performanceLab');
      case 'edge-sandbox':
        return t('nav.edgeSandbox');
      case 'compiler-inspector':
        return t('nav.compilerInspector');
      case 'api-simulator':
        return t('nav.apiSimulator');
      case 'scratchpad':
        return t('nav.scratchpad');
      case 'tools':
        return t('nav.tools');
      default:
        return 'Next.js Arena';
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-neutral-800 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Active Tab Breadcrumb & Search Trigger */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 dark:text-neutral-500">
          <span className="hover:text-zinc-600 dark:hover:text-neutral-300 transition-colors">Next.js 16.3</span>
          <span>/</span>
          <span className="font-semibold text-zinc-900 dark:text-white truncate">
            {getTabTitle(activeTab)}
          </span>
        </div>

        {/* Quick Search Bar */}
        <button
          id="command-palette-trigger"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800/80 border border-zinc-200/80 dark:border-neutral-700/80 text-xs text-zinc-500 dark:text-neutral-400 hover:border-emerald-500/40 hover:text-zinc-800 dark:hover:text-neutral-200 transition-colors"
        >
          <Search size={14} className="text-zinc-400" />
          <span className="font-mono text-[11px]">{t('command.search')}</span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-700 rounded text-zinc-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action: Trigger Test Arena */}
        {activeTab !== 'test-arena' && (
          <button
            id="quick-arena-trigger-btn"
            onClick={() => setActiveTab('test-arena')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs transition-all transform active:scale-95"
          >
            <Flame size={14} className="animate-pulse" />
            <span className="hidden sm:inline">{t('header.arenaAction')}</span>
          </button>
        )}

        {/* Status Indicator Pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800/60 border border-zinc-200/60 dark:border-neutral-800 text-[11px] font-mono text-zinc-600 dark:text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Edge: 12ms</span>
        </div>

        {/* Reset State Button */}
        <button
          id="topbar-reset-btn"
          onClick={onResetAll}
          title={t('header.resetData')}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RotateCcw size={16} />
        </button>

        {/* Language Switcher */}
        <div className="flex items-center bg-zinc-100 dark:bg-neutral-800 p-0.5 rounded-xl border border-zinc-200 dark:border-neutral-700/60 text-xs font-mono font-bold">
          <button
            id="topbar-lang-tr"
            onClick={() => setLanguage('tr')}
            className={`px-2 py-1 rounded-lg transition-all ${
              language === 'tr'
                ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            TR
          </button>
          <button
            id="topbar-lang-en"
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg transition-all ${
              language === 'en'
                ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          id="topbar-theme-toggle-btn"
          onClick={() => setIsDark((prev) => !prev)}
          title={t('header.toggleTheme')}
          className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};

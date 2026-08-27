import React, { useState, useEffect } from 'react';
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
  Command,
  Volume2,
  VolumeX,
  Zap,
  Activity
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useI18n, Language } from '../i18n';
import { audioFx } from '../utils/audioFx';
import { motion } from 'motion/react';

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
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => audioFx.isEnabled());
  const [livePing, setLivePing] = useState<number>(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setLivePing(Math.floor(Math.random() * 6) + 10);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const nextState = audioFx.toggle();
    setSoundEnabled(nextState);
  };

  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'overview':
        return t('nav.overview');
      case 'edge-scraper':
        return t('nav.edgeScraper');
      case 'test-arena':
        return t('nav.testArena');
      case 'ws-monitor':
        return t('nav.wsMonitor');
      case 'performance-lab':
        return t('nav.performanceLab');
      case 'stress-lab':
        return t('nav.stressLab');
      case 'edge-sandbox':
        return t('nav.edgeSandbox');
      case 'compiler-inspector':
        return t('nav.compilerInspector');
      case 'cache-lab':
        return t('nav.cacheLab');
      case 'og-metadata':
        return t('nav.ogMetadata');
      case 'docker-cockpit':
        return t('nav.dockerCockpit');
      case 'server-actions-lab':
        return t('nav.serverActionsLab');
      case 'middleware-inspector':
        return t('nav.middlewareInspector');
      case 'api-simulator':
        return t('nav.apiSimulator');
      case 'scratchpad':
        return t('nav.scratchpad');
      case 'sqlite-studio':
        return t('nav.sqliteStudio');
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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          id="command-palette-trigger"
          onClick={() => {
            audioFx.playClick();
            onOpenCommandPalette?.();
          }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800/80 border border-zinc-200/80 dark:border-neutral-700/80 text-xs text-zinc-500 dark:text-neutral-400 hover:border-emerald-500/40 hover:text-zinc-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <Search size={14} className="text-zinc-400" />
          <span className="font-mono text-[11px]">{t('command.search')}</span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-700 rounded text-zinc-500 shadow-2xs">
            ⌘K
          </kbd>
        </motion.button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action: Trigger Test Arena */}
        {activeTab !== 'test-arena' && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            id="quick-arena-trigger-btn"
            onClick={() => {
              audioFx.playTurbo();
              setActiveTab('test-arena');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs transition-all cursor-pointer"
          >
            <Flame size={14} className="animate-pulse" />
            <span className="hidden sm:inline">{t('header.arenaAction')}</span>
          </motion.button>
        )}

        {/* Status Indicator Pill with Live Ping */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800/60 border border-zinc-200/60 dark:border-neutral-800 text-[11px] font-mono text-zinc-600 dark:text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Edge: {livePing}ms</span>
        </div>

        {/* Procedural Audio FX Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          id="topbar-audio-toggle-btn"
          onClick={handleToggleSound}
          title={soundEnabled ? 'Developer SFX: Açık (Mute)' : 'Developer SFX: Kapalı (Unmute)'}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-zinc-100 dark:bg-neutral-800 border-zinc-200 dark:border-neutral-700 text-zinc-400'
          }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </motion.button>

        {/* Reset State Button */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: -30 }}
          whileTap={{ scale: 0.95 }}
          id="topbar-reset-btn"
          onClick={() => {
            audioFx.playClick();
            onResetAll();
          }}
          title={t('header.resetData')}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <RotateCcw size={16} />
        </motion.button>

        {/* Language Switcher */}
        <div className="flex items-center bg-zinc-100 dark:bg-neutral-800 p-0.5 rounded-xl border border-zinc-200 dark:border-neutral-700/60 text-xs font-mono font-bold">
          <button
            id="topbar-lang-tr"
            onClick={() => {
              audioFx.playClick();
              setLanguage('tr');
            }}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'tr'
                ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            TR
          </button>
          <button
            id="topbar-lang-en"
            onClick={() => {
              audioFx.playClick();
              setLanguage('en');
            }}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.08, rotate: isDark ? 20 : -20 }}
          whileTap={{ scale: 0.92 }}
          id="topbar-theme-toggle-btn"
          onClick={() => {
            audioFx.playTabSwitch();
            setIsDark((prev) => !prev);
          }}
          title={t('header.toggleTheme')}
          className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
        </motion.button>
      </div>
    </header>
  );
};

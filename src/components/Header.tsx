import React from 'react';
import { Moon, Sun, RefreshCw, Layers, Terminal, Sparkles, Rocket, Swords, Gauge, Globe } from 'lucide-react';
import { ActiveTab } from '../types';
import { useI18n, Language } from '../i18n';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  onResetAll,
}) => {
  const { language, setLanguage, t } = useI18n();

  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'overview', label: t('nav.overview'), icon: '⚡' },
    { id: 'test-arena', label: t('nav.testArena'), icon: '⚔️' },
    { id: 'performance-lab', label: t('nav.performanceLab'), icon: '📊' },
    { id: 'api-simulator', label: t('nav.apiSimulator'), icon: '🚀' },
    { id: 'scratchpad', label: t('nav.scratchpad'), icon: '📝' },
    { id: 'tools', label: t('nav.tools'), icon: '🛠️' },
  ];

  return (
    <header className="border-b border-zinc-200 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <span className="font-mono tracking-tight font-black text-emerald-500">N</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  NextJS <span className="text-emerald-500">Test Arena</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {t('app.badge')}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 border border-zinc-200 dark:border-neutral-700">
                  Node 24 LTS
                </span>
                <span className="hidden lg:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
                  Rust Compiler
                </span>
              </div>
              <p className="text-zinc-500 dark:text-neutral-500 font-mono text-[11px]">
                {t('app.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Navigation Pill Tabs */}
          <nav className="hidden xl:flex items-center gap-1 bg-zinc-100 dark:bg-neutral-900 p-1 rounded-full border border-zinc-200 dark:border-neutral-800 text-xs font-medium">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-zinc-900 text-white dark:bg-emerald-500 dark:text-neutral-950 font-bold shadow-sm'
                    : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Arena Quick Action */}
          <button
            onClick={() => setActiveTab('test-arena')}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-neutral-950 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>{t('header.arenaAction')}</span>
          </button>

          {/* Language Switcher Flag Selector */}
          <div className="flex items-center p-0.5 rounded-full bg-zinc-100 dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setLanguage('tr')}
              title="Türkçe"
              className={`px-2 py-1 rounded-full transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                language === 'tr'
                  ? 'bg-white dark:bg-neutral-800 text-zinc-900 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span className="text-sm">🇹🇷</span>
              <span className="text-[11px] font-mono">TR</span>
            </button>
            <button
              onClick={() => setLanguage('en')}
              title="English"
              className={`px-2 py-1 rounded-full transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                language === 'en'
                  ? 'bg-white dark:bg-neutral-800 text-zinc-900 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span className="text-sm">🇬🇧</span>
              <span className="text-[11px] font-mono">EN</span>
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={onResetAll}
            title={t('header.resetData')}
            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-zinc-200 dark:border-neutral-800 rounded-full text-xs font-semibold text-zinc-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            title={t('header.toggleTheme')}
            className="p-1.5 rounded-full text-zinc-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-neutral-900 transition-colors border border-zinc-200 dark:border-neutral-800 cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub Navigation for Medium / Mobile screens */}
      <div className="xl:hidden flex overflow-x-auto px-4 py-2 gap-1.5 border-t border-zinc-200 dark:border-neutral-800 bg-zinc-50 dark:bg-neutral-950">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-full font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-900 text-white dark:bg-emerald-500 dark:text-neutral-950 font-bold shadow-xs'
                : 'text-zinc-600 dark:text-neutral-400 bg-zinc-100 dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};

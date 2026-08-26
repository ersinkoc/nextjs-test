import React from 'react';
import { Moon, Sun, RefreshCw, Layers, Terminal, Sparkles, Rocket } from 'lucide-react';
import { ActiveTab } from '../types';

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
  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Bento Dashboard', icon: '⚡' },
    { id: 'scratchpad', label: 'Not & Denemeler', icon: '📝' },
    { id: 'api-simulator', label: 'App Router & API', icon: '🚀' },
    { id: 'tools', label: 'Geliştirici Araçları', icon: '🛠️' },
  ];

  return (
    <header className="border-b border-zinc-200 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <span className="font-mono tracking-tight font-black text-emerald-500">N</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                NextJS <span className="text-emerald-500">Playground</span>
              </h1>
              <p className="text-zinc-500 dark:text-neutral-500 font-mono text-xs mt-0.5">
                v15.2.0 &bull; Development Environment &bull; Bento Architecture
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Status badge */}
          <div className="px-3.5 py-1.5 bg-zinc-100 dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-full text-xs font-semibold flex items-center gap-2 text-zinc-800 dark:text-neutral-300">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Operational</span>
          </div>

          {/* Navigation Pill Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-zinc-100 dark:bg-neutral-900 p-1 rounded-full border border-zinc-200 dark:border-neutral-800 text-xs font-medium">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
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

          {/* Quick action button */}
          <button
            onClick={onResetAll}
            title="Örnek verileri sıfırla"
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-zinc-200 dark:border-neutral-800 rounded-full text-xs font-semibold text-zinc-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sıfırla</span>
          </button>

          {/* Deploy Action Button */}
          <button
            onClick={() => {
              setActiveTab('api-simulator');
            }}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-neutral-950 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>TEST RUNNER</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            title="Tema Değiştir"
            className="p-1.5 rounded-full text-zinc-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-neutral-900 transition-colors border border-zinc-200 dark:border-neutral-800"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Navigation */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 gap-1.5 border-t border-zinc-200 dark:border-neutral-800 bg-zinc-50 dark:bg-neutral-950">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-3 py-1 text-xs rounded-full font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-900 text-white dark:bg-emerald-500 dark:text-neutral-950 font-bold'
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

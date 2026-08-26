import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CommandPalette } from './components/CommandPalette';
import { OverviewHero } from './components/OverviewHero';
import { InteractiveCounter } from './components/InteractiveCounter';
import { QuickNotes } from './components/QuickNotes';
import { ApiSimulator } from './components/ApiSimulator';
import { DeveloperTools } from './components/DeveloperTools';
import { TestArena } from './components/TestArena';
import { PerformanceLab } from './components/PerformanceLab';
import { EdgeStreamSandbox } from './components/EdgeStreamSandbox';
import { CompilerInspector } from './components/CompilerInspector';
import { DynamicCacheLab } from './components/DynamicCacheLab';
import { OgMetadataStudio } from './components/OgMetadataStudio';
import { ActiveTab, NoteItem } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { I18nProvider, useI18n } from './i18n';

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Next.js 16.3 Instant Navigations & Turbopack Persistent Cache',
    content: 'Partial Prefetching ve Rust React Compiler AST optimizasyonu doğrulandı.',
    category: 'deneme',
    completed: true,
    createdAt: 'Bugün, 14:20',
  },
  {
    id: 'note-2',
    title: 'Node 24 LTS & Server Actions Form Sözleşmesi',
    content: 'V8 v13.4 motoru ve strict origin CSRF koruması test edildi.',
    category: 'fikir',
    completed: false,
    createdAt: 'Bugün, 15:45',
  },
  {
    id: 'note-3',
    title: 'Partial Prerendering (PPR) Shell & Streaming Holes',
    content: '0ms statik HTML kabuk teslimatı ve asenkron RSC parçacıkları.',
    category: 'todo',
    completed: false,
    createdAt: 'Bugün, 16:10',
  },
];

function AppContent() {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('nextjs_arena_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return true;
  });
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('deneme_app_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_NOTES;
      }
    }
    return INITIAL_NOTES;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nextjs_arena_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nextjs_arena_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const savedBrandColor = localStorage.getItem('nextjs_arena_brand_color');
    if (savedBrandColor) {
      document.documentElement.style.setProperty('--brand-primary', savedBrandColor);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('deneme_app_notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = (title: string, category: NoteItem['category'], content = '') => {
    const newNote: NoteItem = {
      id: 'note_' + Math.random().toString(36).substring(2, 9),
      title,
      content,
      category,
      completed: false,
      createdAt: language === 'tr' ? 'Az önce' : 'Just now',
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleToggleNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleResetAll = () => {
    setNotes(INITIAL_NOTES);
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-neutral-950 text-zinc-900 dark:text-neutral-200 flex font-sans transition-colors selection:bg-emerald-500 selection:text-black">
      {/* Modern Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Command & Status Bar */}
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          setIsDark={setIsDark}
          onResetAll={handleResetAll}
          onOpenCommandPalette={() => setIsCommandOpen(true)}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Primary Bento Hero Grid */}
                <OverviewHero setActiveTab={setActiveTab} notesCount={notes.length} />

                {/* Second Bento Row: Interactive Counter & Scratchpad */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                  <InteractiveCounter />
                  <QuickNotes
                    notes={notes}
                    onAddNote={handleAddNote}
                    onToggleNote={handleToggleNote}
                    onDeleteNote={handleDeleteNote}
                  />
                </div>

                {/* Third Bento Row: API Simulator */}
                <div>
                  <ApiSimulator />
                </div>
              </motion.div>
            )}

            {activeTab === 'test-arena' && (
              <motion.div
                key="test-arena"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <TestArena />
              </motion.div>
            )}

            {activeTab === 'performance-lab' && (
              <motion.div
                key="performance-lab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <PerformanceLab />
              </motion.div>
            )}

            {activeTab === 'edge-sandbox' && (
              <motion.div
                key="edge-sandbox"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <EdgeStreamSandbox />
              </motion.div>
            )}

            {activeTab === 'compiler-inspector' && (
              <motion.div
                key="compiler-inspector"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <CompilerInspector />
              </motion.div>
            )}

            {activeTab === 'cache-lab' && (
              <motion.div
                key="cache-lab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <DynamicCacheLab />
              </motion.div>
            )}

            {activeTab === 'og-metadata' && (
              <motion.div
                key="og-metadata"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <OgMetadataStudio />
              </motion.div>
            )}

            {activeTab === 'api-simulator' && (
              <motion.div
                key="api-simulator"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <ApiSimulator />
              </motion.div>
            )}

            {activeTab === 'scratchpad' && (
              <motion.div
                key="scratchpad"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"
              >
                <div className="lg:col-span-2">
                  <QuickNotes
                    notes={notes}
                    onAddNote={handleAddNote}
                    onToggleNote={handleToggleNote}
                    onDeleteNote={handleDeleteNote}
                  />
                </div>
                <div>
                  <InteractiveCounter />
                </div>
              </motion.div>
            )}

            {activeTab === 'tools' && (
              <motion.div
                key="tools"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <DeveloperTools />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-zinc-200 dark:border-neutral-800 py-6 bg-white dark:bg-neutral-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-neutral-500 font-bold font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Next.js 16.3.3 Enterprise & Extreme Arena</span>
            </div>
            <div>{t('footer.env')}</div>
            <div>{t('footer.runtime')}</div>
          </div>
        </footer>
      </div>

      {/* Global Command Palette Modal (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

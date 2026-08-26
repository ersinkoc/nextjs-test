import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewHero } from './components/OverviewHero';
import { InteractiveCounter } from './components/InteractiveCounter';
import { QuickNotes } from './components/QuickNotes';
import { ApiSimulator } from './components/ApiSimulator';
import { DeveloperTools } from './components/DeveloperTools';
import { ActiveTab, NoteItem } from './types';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Next.js 15 App Router & Turbopack özelliklerini incele',
    content: 'Yeni async Request API ve caching davranışları kontrol edildi.',
    category: 'deneme',
    completed: true,
    createdAt: 'Bugün, 14:20',
  },
  {
    id: 'note-2',
    title: 'Server Action form doğrulama yapısı oluştur',
    content: 'zod veya standard-schema ile action parametreleri doğrulanabilir.',
    category: 'fikir',
    completed: false,
    createdAt: 'Bugün, 15:45',
  },
  {
    id: 'note-3',
    title: 'Bento Grid tasarım bileşenlerini test et',
    content: 'Deep neutral zemin, emerald vurgular ve rounded-3xl kartlar.',
    category: 'todo',
    completed: false,
    createdAt: 'Bugün, 16:10',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return true; // Default to dark for premium Bento Grid aesthetic
  });

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
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
      createdAt: 'Az önce',
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
    <div className="min-h-screen bg-zinc-100 dark:bg-neutral-950 text-zinc-900 dark:text-neutral-200 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-black">
      {/* Bento Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        onResetAll={handleResetAll}
      />

      {/* Main Content Bento Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
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

          {activeTab === 'scratchpad' && (
            <motion.div
              key="scratchpad"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
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

          {activeTab === 'api-simulator' && (
            <motion.div
              key="api-simulator"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ApiSimulator />
            </motion.div>
          )}

          {activeTab === 'tools' && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DeveloperTools />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bento Styled Footer */}
      <footer className="mt-8 border-t border-zinc-200 dark:border-neutral-800 py-6 bg-white dark:bg-neutral-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-neutral-500 font-bold font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Project ID: PRJ_91002_NEXT_DEV</span>
          </div>
          <div>Environment: Production-Preview</div>
          <div>Next.js: v15.2.0 &bull; Node: 20.10.0</div>
        </div>
      </footer>
    </div>
  );
}

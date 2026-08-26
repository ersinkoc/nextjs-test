import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Search, Tag, FileText, Sparkles } from 'lucide-react';
import { NoteItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';

interface QuickNotesProps {
  notes: NoteItem[];
  onAddNote: (title: string, category: NoteItem['category'], content?: string) => void;
  onToggleNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export const QuickNotes: React.FC<QuickNotesProps> = ({
  notes,
  onAddNote,
  onToggleNote,
  onDeleteNote,
}) => {
  const { t, language } = useI18n();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoteItem['category']>('deneme');
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddNote(title.trim(), category);
    setTitle('');
  };

  const categories: { key: NoteItem['category']; label: string; color: string }[] = [
    { key: 'deneme', label: t('cat.deneme'), color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { key: 'fikir', label: t('cat.fikir'), color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    { key: 'todo', label: t('cat.todo'), color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
    { key: 'not', label: t('cat.not'), color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  ];

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedFilter === 'all' || n.category === selectedFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-500" />
          {t('notes.badge')} ({notes.length})
        </span>

        <span className="text-[10px] font-mono font-semibold uppercase bg-zinc-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-full text-zinc-600 dark:text-neutral-400 border border-zinc-200 dark:border-neutral-700">
          Local Storage
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('notes.placeholder')}
            className="flex-1 px-4 py-2.5 text-xs bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-neutral-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-2xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> {t('notes.add')}
          </button>
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] text-zinc-400 dark:text-neutral-500 mr-1 flex items-center gap-1 font-mono">
            <Tag className="w-3 h-3 text-emerald-500" /> {t('notes.tag')}:
          </span>
          {categories.map((c) => (
            <button
              type="button"
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                category === c.key
                  ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent font-bold shadow-xs'
                  : 'bg-zinc-50 dark:bg-neutral-800/80 text-zinc-600 dark:text-neutral-400 border-zinc-200 dark:border-neutral-700/60 hover:bg-zinc-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </form>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3 pb-3 border-b border-zinc-100 dark:border-neutral-800/80 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400 dark:text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('notes.searchPlaceholder')}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-neutral-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-1 items-center overflow-x-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2.5 py-1 text-[11px] rounded-full transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-emerald-500 text-neutral-950 font-bold'
                : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {t('notes.all')}
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedFilter(c.key)}
              className={`px-2.5 py-1 text-[11px] rounded-full transition-all cursor-pointer ${
                selectedFilter === c.key
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1">
        <AnimatePresence mode="popLayout">
          {filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-zinc-400 dark:text-neutral-500 text-xs flex flex-col items-center gap-1"
            >
              <Sparkles className="w-5 h-5 text-emerald-500/60 mb-1" />
              <span>{t('notes.empty')}</span>
              <span className="text-[11px] text-zinc-500">{t('notes.emptySub')}</span>
            </motion.div>
          ) : (
            filteredNotes.map((item) => {
              const catInfo = categories.find((c) => c.key === item.category);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    item.completed
                      ? 'bg-zinc-50/50 dark:bg-neutral-950/40 border-zinc-200/50 dark:border-neutral-800/40 opacity-60'
                      : 'bg-zinc-50/90 dark:bg-neutral-950 border-zinc-200 dark:border-neutral-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50'
                  }`}
                >
                  <button
                    onClick={() => onToggleNote(item.id)}
                    className="text-zinc-400 hover:text-emerald-500 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${
                        item.completed
                          ? 'line-through text-zinc-400 dark:text-neutral-500'
                          : 'text-zinc-800 dark:text-neutral-200'
                      }`}
                    >
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-medium ${
                          catInfo?.color || ''
                        }`}
                      >
                        {catInfo?.label || item.category}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-neutral-500 font-mono">
                        {item.createdAt}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteNote(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-neutral-800 cursor-pointer"
                    title={language === 'tr' ? 'Sil' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Plus, Minus, RotateCcw, Zap, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const InteractiveCounter: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [history, setHistory] = useState<{ id: string; val: number; change: string; time: string }[]>([]);

  const handleIncrement = () => {
    const nextVal = count + step;
    setCount(nextVal);
    logAction(nextVal, `+${step}`);
  };

  const handleDecrement = () => {
    const nextVal = count - step;
    setCount(nextVal);
    logAction(nextVal, `-${step}`);
  };

  const handleReset = () => {
    setCount(0);
    logAction(0, 'Sıfırlandı');
  };

  const handleRandom = () => {
    const randomVal = Math.floor(Math.random() * 200) - 100;
    setCount(randomVal);
    logAction(randomVal, 'Rastgele');
  };

  const logAction = (val: number, change: string) => {
    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      val,
      change,
      time: new Date().toLocaleTimeString(),
    };
    setHistory((prev) => [newEntry, ...prev.slice(0, 3)]);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            Client State Engine
          </span>
          <span className="text-[10px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            'use client'
          </span>
        </div>

        {/* Counter Display */}
        <div className="my-5 text-center py-6 bg-zinc-50 dark:bg-neutral-950 rounded-2xl border border-zinc-200/80 dark:border-neutral-800/80 relative overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={count}
              initial={{ opacity: 0, y: -15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono"
            >
              {count}
            </motion.div>
          </AnimatePresence>
          <p className="text-xs text-zinc-400 dark:text-neutral-500 mt-2 font-mono">
            Mevcut değer &bull; Adım Boyutu: {step}
          </p>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={handleDecrement}
            className="flex items-center justify-center p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 transition-colors font-bold active:scale-95 border border-zinc-200 dark:border-neutral-700/60"
            title="Azalt"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={handleIncrement}
            className="col-span-2 flex items-center justify-center p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-all font-bold active:scale-95 shadow-sm text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 mr-1 stroke-[3]" /> Artır (+{step})
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 transition-colors active:scale-95 border border-zinc-200 dark:border-neutral-700/60"
            title="Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Step & Random selectors */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-neutral-800/80 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 dark:text-neutral-500 font-mono text-[11px]">Adım:</span>
            {[1, 5, 10, 50].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all ${
                  step === s
                    ? 'bg-zinc-900 text-white dark:bg-emerald-500 dark:text-neutral-950 font-bold shadow-xs'
                    : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200 dark:hover:bg-neutral-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleRandom}
            className="text-[11px] flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" /> Rastgele
          </button>
        </div>
      </div>

      {/* History Log */}
      {history.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-neutral-800/80">
          <p className="text-[11px] font-bold text-zinc-400 dark:text-neutral-500 mb-2 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Son Değişiklikler:
          </p>
          <div className="space-y-1.5">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-neutral-400 bg-zinc-50 dark:bg-neutral-950 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-neutral-800/60"
              >
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.change}</span>
                <span className="font-semibold text-zinc-800 dark:text-neutral-200">
                  Sonuç: {item.val}
                </span>
                <span className="text-zinc-400 dark:text-neutral-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

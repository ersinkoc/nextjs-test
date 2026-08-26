import React, { useState } from 'react';
import {
  Boxes,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Heart,
  ShoppingCart,
  Send,
  Code2,
  Terminal,
  Radio,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

export const EdgeStreamSandbox: React.FC = () => {
  const { t } = useI18n();

  // PPR State
  const [pprStreaming, setPprStreaming] = useState(false);
  const [pprStage, setPprStage] = useState<'idle' | 'shell' | 'chunk1' | 'chunk2' | 'complete'>('idle');
  const [streamChunks, setStreamChunks] = useState<string[]>([]);

  // Optimistic Server Action State
  const [likes, setLikes] = useState(142);
  const [optimisticLikes, setOptimisticLikes] = useState(142);
  const [isPending, setIsPending] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);

  // Flight protocol inspector selection
  const [activeFlightTab, setActiveFlightTab] = useState<'raw' | 'parsed'>('raw');

  const startPprSimulation = async () => {
    setPprStreaming(true);
    setPprStage('shell');
    setStreamChunks(['[0ms] 🟢 Static Shell HTML delivered from CDN edge (TTFB: 4ms)']);

    await new Promise((r) => setTimeout(r, 400));
    setPprStage('chunk1');
    setStreamChunks((prev) => [
      ...prev,
      '[420ms] 📦 RSC Chunk #1 Received: <DynamicPricing data={{ currency: "USD", price: 299 }} />',
    ]);

    await new Promise((r) => setTimeout(r, 500));
    setPprStage('chunk2');
    setStreamChunks((prev) => [
      ...prev,
      '[920ms] 📦 RSC Chunk #2 Received: <LiveInventory stock={18} warehouse="fra-1" />',
    ]);

    await new Promise((r) => setTimeout(r, 300));
    setPprStage('complete');
    setStreamChunks((prev) => [
      ...prev,
      '[1220ms] ✨ Stream Complete: HTML hydration fully finalized with zero layout shift (CLS: 0.00)',
    ]);
    setPprStreaming(false);
  };

  const handleTriggerAction = async () => {
    if (isPending) return;

    setIsPending(true);
    // Optimistically update UI immediately
    setOptimisticLikes((prev) => prev + 1);

    const logEntry = `[${new Date().toLocaleTimeString()}] Optimistic increment applied: ${likes} -> ${likes + 1}`;
    setActionLog((prev) => [logEntry, ...prev]);

    // Simulate network server delay
    await new Promise((r) => setTimeout(r, 600));

    if (simulateFailure) {
      // Revert optimistic state!
      setOptimisticLikes(likes);
      setActionLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ❌ Server Action 500 Error: Mutation rolled back to ${likes}`,
        ...prev,
      ]);
    } else {
      // Commit mutation
      setLikes((prev) => prev + 1);
      setActionLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ✓ Server Action 200 OK: State synchronized permanently`,
        ...prev,
      ]);
    }

    setIsPending(false);
  };

  const sampleFlightPayload = `1:I["(app)/components/DynamicStats.tsx",["app/stats","default"],""]
0:{"children":[["$","header",null,{"children":"Next.js 16.3 Store"}],["$","div",null,{"className":"grid","children":[["$","$L1",null,{"price":299,"stock":18}]]}]]}`;

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {t('edge.badge')}
          </span>
          <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
            RSC Flight Stream & Optimistic Mutations
          </span>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
          {t('edge.title')}
        </h2>
      </div>

      {/* Main Two-Column Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Live PPR Simulator */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes size={18} className="text-indigo-500" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  {t('edge.pprTitle')}
                </h3>
              </div>
              <button
                id="start-ppr-stream-btn"
                onClick={startPprSimulation}
                disabled={pprStreaming}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-xs transition-all disabled:opacity-50"
              >
                <Play size={13} className="fill-current" />
                <span>{pprStreaming ? 'Streaming...' : t('edge.startPprStream')}</span>
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-neutral-400">
              {t('edge.pprDesc')}
            </p>
          </div>

          {/* Interactive Shell & Hole View */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-3 font-mono text-xs">
            {/* Static Shell Header */}
            <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-zinc-800 dark:text-white">Static Shell: Navbar & Banner</span>
              </div>
              <span className="text-[10px] text-emerald-500 font-bold">0ms (Instant Edge CDN)</span>
            </div>

            {/* Dynamic Hole #1: Live Pricing */}
            <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-dashed border-indigo-400/60 flex items-center justify-between">
              <div>
                <div className="font-bold text-indigo-600 dark:text-indigo-400">Dynamic Hole 1: Pricing Engine</div>
                <div className="text-[11px] text-zinc-500">
                  {pprStage === 'chunk1' || pprStage === 'chunk2' || pprStage === 'complete' ? (
                    <span className="text-emerald-500 font-bold">$299.00 USD (Personalized)</span>
                  ) : (
                    <span className="text-zinc-400 animate-pulse">[Suspense Skeleton Loading...]</span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Suspense boundary</span>
            </div>

            {/* Dynamic Hole #2: Realtime Stock */}
            <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-dashed border-teal-400/60 flex items-center justify-between">
              <div>
                <div className="font-bold text-teal-600 dark:text-teal-400">Dynamic Hole 2: Inventory Warehouse</div>
                <div className="text-[11px] text-zinc-500">
                  {pprStage === 'chunk2' || pprStage === 'complete' ? (
                    <span className="text-teal-500 font-bold">18 units available in Frankfurt Hub</span>
                  ) : (
                    <span className="text-zinc-400 animate-pulse">[Suspense Skeleton Loading...]</span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Stream chunk #2</span>
            </div>
          </div>

          {/* Stream Log Terminal */}
          <div className="p-3 rounded-2xl bg-black border border-zinc-800 text-[11px] font-mono space-y-1 h-28 overflow-y-auto scrollbar-thin">
            {streamChunks.length === 0 ? (
              <span className="text-zinc-500">Click &quot;Start PPR Stream&quot; to inspect frame-by-frame RSC stream chunking...</span>
            ) : (
              streamChunks.map((chunk, idx) => (
                <div key={idx} className="text-emerald-400 leading-tight">
                  {chunk}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Server Action Optimistic State & Rollback */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {t('edge.actionsTitle')}
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-neutral-400">
              {t('edge.actionsDesc')}
            </p>
          </div>

          {/* Action Sandbox Card */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono text-zinc-500 uppercase font-bold">
                  {t('edge.optimisticCounter')}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white font-mono tracking-tight">
                    {optimisticLikes}
                  </span>
                  {isPending && (
                    <span className="text-xs font-mono font-bold text-amber-500 animate-pulse">
                      (Pending sync...)
                    </span>
                  )}
                </div>
              </div>

              {/* Heart Button */}
              <button
                id="optimistic-like-btn"
                onClick={handleTriggerAction}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-mono text-xs font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
              >
                <Heart size={16} className="fill-current animate-pulse" />
                <span>{t('edge.triggerAction')}</span>
              </button>
            </div>

            {/* Error Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-neutral-800 text-xs">
              <span className="text-zinc-600 dark:text-neutral-400 font-medium">
                {t('edge.simulateError')}
              </span>
              <button
                id="toggle-simulate-error-btn"
                onClick={() => setSimulateFailure(!simulateFailure)}
                className={`px-3 py-1 rounded-xl font-mono text-xs font-bold border transition-all ${
                  simulateFailure
                    ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                    : 'bg-zinc-200 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 border-zinc-300 dark:border-neutral-700'
                }`}
              >
                {simulateFailure ? 'Error Sim Active' : 'Normal (200 OK)'}
              </button>
            </div>
          </div>

          {/* Action Log Box */}
          <div className="p-3 rounded-2xl bg-black border border-zinc-800 text-[11px] font-mono space-y-1 h-28 overflow-y-auto scrollbar-thin">
            {actionLog.length === 0 ? (
              <span className="text-zinc-500">Submit the Server Action to see optimistic state transition and rollback logs...</span>
            ) : (
              actionLog.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-tight ${
                    log.includes('❌') ? 'text-rose-400 font-bold' : 'text-emerald-400'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RSC Flight Protocol Inspector Bento */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-sky-500" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
              {t('edge.flightTitle')}
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20">
            Next.js 16.3 Protocol
          </span>
        </div>

        <pre className="p-4 rounded-2xl bg-zinc-950 text-sky-400 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
          <code>{sampleFlightPayload}</code>
        </pre>
      </div>
    </div>
  );
};

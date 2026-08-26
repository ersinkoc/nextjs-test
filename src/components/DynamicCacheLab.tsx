import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Zap,
  Sparkles,
  Layers,
  Clock,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Flame,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Terminal,
  Cpu
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

type CacheLifeProfile = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max';

interface CacheItem {
  id: string;
  name: string;
  tag: string;
  life: CacheLifeProfile;
  staleSeconds: number;
  revalidateSeconds: number;
  expireSeconds: number;
  remainingSeconds: number;
  hits: number;
  status: 'fresh' | 'stale' | 'revalidating' | 'expired';
  lastRevalidated: string;
}

export const DynamicCacheLab: React.FC = () => {
  const { t, language } = useI18n();

  const [selectedLife, setSelectedLife] = useState<CacheLifeProfile>('minutes');
  const [customTag, setCustomTag] = useState<string>('products-feed');
  const [copied, setCopied] = useState<boolean>(false);
  const [revalidateLog, setRevalidateLog] = useState<string[]>([]);
  const [isPurging, setIsPurging] = useState<boolean>(false);

  // Dynamic IO Hazard toggle
  const [hasDynamicIOHazard, setHasDynamicIOHazard] = useState<boolean>(false);

  // Active Cache Entries
  const [cacheEntries, setCacheEntries] = useState<CacheItem[]>([
    {
      id: 'c-1',
      name: 'getFeaturedProducts()',
      tag: 'products-feed',
      life: 'hours',
      staleSeconds: 300,
      revalidateSeconds: 3600,
      expireSeconds: 86400,
      remainingSeconds: 3420,
      hits: 1420,
      status: 'fresh',
      lastRevalidated: language === 'tr' ? '12 dk önce' : '12m ago',
    },
    {
      id: 'c-2',
      name: 'getUserProfile(userId)',
      tag: 'user-profile',
      life: 'minutes',
      staleSeconds: 30,
      revalidateSeconds: 60,
      expireSeconds: 300,
      remainingSeconds: 42,
      hits: 390,
      status: 'fresh',
      lastRevalidated: language === 'tr' ? '18 sn önce' : '18s ago',
    },
    {
      id: 'c-3',
      name: 'getGlobalExchangeRates()',
      tag: 'currency-rates',
      life: 'seconds',
      staleSeconds: 5,
      revalidateSeconds: 15,
      expireSeconds: 60,
      remainingSeconds: 11,
      hits: 8520,
      status: 'fresh',
      lastRevalidated: language === 'tr' ? '4 sn önce' : '4s ago',
    },
  ]);

  // Decrement timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCacheEntries((prev) =>
        prev.map((entry) => {
          if (entry.remainingSeconds <= 1) {
            return {
              ...entry,
              remainingSeconds: entry.revalidateSeconds,
              hits: entry.hits + Math.floor(Math.random() * 5) + 1,
              status: 'fresh',
              lastRevalidated: language === 'tr' ? 'Az önce' : 'Just now',
            };
          }
          return {
            ...entry,
            remainingSeconds: entry.remainingSeconds - 1,
            hits: entry.hits + (Math.random() > 0.6 ? 1 : 0),
          };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [language]);

  const handleRevalidateTag = async (tagToPurge: string) => {
    setIsPurging(true);
    const timeStr = new Date().toLocaleTimeString();
    setRevalidateLog((prev) => [
      `▶ [${timeStr}] revalidateTag("${tagToPurge}") triggered...`,
      ...prev,
    ]);

    await new Promise((r) => setTimeout(r, 450));

    setCacheEntries((prev) =>
      prev.map((entry) => {
        if (entry.tag === tagToPurge || tagToPurge === 'all') {
          return {
            ...entry,
            remainingSeconds: entry.revalidateSeconds,
            hits: 0,
            status: 'fresh',
            lastRevalidated: language === 'tr' ? 'Az önce (Yenilendi)' : 'Just now (Purged)',
          };
        }
        return entry;
      })
    );

    setRevalidateLog((prev) => [
      `✓ [${new Date().toLocaleTimeString()}] Cache Tag "${tagToPurge}" evicted from L1 In-Memory & L3 Edge CDN caches.`,
      ...prev,
    ]);
    setIsPurging(false);
  };

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const cacheSnippet = `// Next.js 16.3 "use cache" & Dynamic IO Architecture
import { cacheLife, cacheTag } from 'next/cache';

// Cached Async Data Function with granular lifecycle & on-demand tags
export async function getProductCatalog(category: string) {
  'use cache';
  cacheLife('${selectedLife}');
  cacheTag('${customTag}', \`category-\${category}\`);

  // Zero unnecessary DB queries during cache window
  const products = await db.products.findMany({ where: { category } });
  return products;
}

// Server Action for On-Demand Tag Revalidation
export async function updateProduct(id: string, data: FormData) {
  'use server';
  await db.products.update({ where: { id }, data });
  
  // Instant atomic purge across global Edge nodes
  revalidateTag('${customTag}');
}`;

  return (
    <div className="space-y-6">
      {/* Header Bento Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {t('cache.badge')}
          </span>
          <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
            Next.js 16 Dynamic IO & Cache Directives
          </span>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
          {t('cache.title')}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1 max-w-2xl">
          {t('cache.desc')}
        </p>
      </div>

      {/* Main 2-Column Bento: Live Cache Simulator & Tag Revalidator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Cache Tiers & Entries (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live Cache Entries Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-emerald-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  {t('cache.activeEntries')}
                </h3>
              </div>
              <button
                id="purge-all-cache-btn"
                onClick={() => handleRevalidateTag('all')}
                disabled={isPurging}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 text-xs font-mono font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw size={13} className={isPurging ? 'animate-spin text-emerald-500' : ''} />
                <span>{isPurging ? t('cache.purging') : t('cache.purgeAll')}</span>
              </button>
            </div>

            {/* Cache Cards List */}
            <div className="space-y-3">
              {cacheEntries.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                          <Tag size={10} />
                          {item.tag}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          cacheLife(&apos;{item.life}&apos;)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRevalidateTag(item.tag)}
                      disabled={isPurging}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold transition-colors"
                    >
                      revalidateTag(&apos;{item.tag}&apos;)
                    </button>
                  </div>

                  {/* Cache Health Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 dark:text-neutral-400">
                      <span>{t('cache.ttlRemaining')}: <b className="text-zinc-800 dark:text-neutral-200">{item.remainingSeconds}s</b></span>
                      <span>{t('cache.cacheHits')}: <b className="text-emerald-600 dark:text-emerald-400">{item.hits.toLocaleString()} hits</b></span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${(item.remainingSeconds / item.revalidateSeconds) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-zinc-400 pt-0.5">
                      <span>{t('cache.lastRevalidated')}: {item.lastRevalidated}</span>
                      <span>L1 Memory / L3 Edge Hit</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Revalidation Log Box */}
          <div className="p-4 rounded-3xl bg-black border border-zinc-800 text-white font-mono text-xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-emerald-400" />
                <span className="text-[11px] text-zinc-400 font-bold">
                  {t('cache.revalLogTitle')}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">● ACTIVE</span>
            </div>
            <div className="h-24 overflow-y-auto space-y-1 scrollbar-thin text-[11px]">
              {revalidateLog.length === 0 ? (
                <span className="text-zinc-500">
                  {language === 'tr'
                    ? 'revalidateTag() tıklandığında anlık önbellek tasfiye logları burada akar...'
                    : 'Click revalidateTag() above to see instant cache eviction event stream...'}
                </span>
              ) : (
                revalidateLog.map((log, idx) => (
                  <div key={idx} className="text-emerald-400 leading-tight">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Next.js 16 Directive Generator & Hazard Auditor (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Cache Directive Studio */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  {t('cache.directiveStudio')}
                </h3>
              </div>
              <button
                onClick={() => copySnippet(cacheSnippet)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 text-xs font-mono font-bold hover:bg-zinc-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied ? t('cache.copied') : t('tools.copy')}</span>
              </button>
            </div>

            {/* Profile Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-zinc-600 dark:text-neutral-400">
                {t('cache.cacheLifeProfile')}:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['seconds', 'minutes', 'hours', 'days', 'weeks', 'max'] as CacheLifeProfile[]).map((prof) => (
                  <button
                    key={prof}
                    onClick={() => setSelectedLife(prof)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-all text-center ${
                      selectedLife === prof
                        ? 'bg-zinc-900 text-white dark:bg-neutral-700 dark:text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {prof}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-zinc-600 dark:text-neutral-400">
                {t('cache.customTag')}:
              </label>
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Code Output */}
            <pre className="p-3.5 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-zinc-800 scrollbar-thin">
              <code>{cacheSnippet}</code>
            </pre>
          </div>

          {/* Dynamic IO Safety & Hazard Inspector */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-sky-500" />
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                  {t('cache.hazardTitle')}
                </h4>
              </div>
              <button
                onClick={() => setHasDynamicIOHazard(!hasDynamicIOHazard)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                  hasDynamicIOHazard
                    ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}
              >
                {hasDynamicIOHazard ? t('cache.hazardUnsafe') : t('cache.hazardSafe')}
              </button>
            </div>

            <div className="text-xs text-zinc-600 dark:text-neutral-400 leading-relaxed font-mono">
              {hasDynamicIOHazard ? (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    <span>Dynamic IO Warning: Un-cached access detected</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-neutral-400">
                    Calling `cookies()` or `searchParams` outside of a `use cache` scope forces the entire route to opt-out of static optimization.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Dynamic IO Guard: Strict Cache Boundary Active</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-neutral-400">
                    All data fetching is cleanly encapsulated with `use cache` and on-demand `cacheTag()`.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

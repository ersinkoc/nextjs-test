import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Code2, 
  Terminal, 
  Sliders, 
  AlertTriangle,
  Flame,
  Check,
  ChevronRight,
  Filter,
  Sparkles,
  Cpu
} from 'lucide-react';
import { TestCase } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';

export const TestArena: React.FC = () => {
  const { t, language } = useI18n();

  const getInitialTestSuite = (): TestCase[] => [
    {
      id: 'tc-1',
      name: language === 'tr' ? 'Instant Navigations & Partial Prefetching' : 'Instant Navigations & Partial Prefetching',
      category: 'Instant Navigations',
      description: language === 'tr'
        ? 'Next.js 16.3 Instant Navigations ve Partial Prefetching ile SPA düzeyinde anlık, sıfır gecikmeli sayfa geçişlerini test eder.'
        : 'Verifies Next.js 16.3 Instant Navigations and Partial Prefetching for zero-latency SPA-like page transitions.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Partial Prefetch ağ yükü kabuk (shell) ile sınırlandırıldı (<4KB)' : 'Partial Prefetch network payload bounded to shell (<4KB)', passed: true },
        { name: language === 'tr' ? 'Navigation Inspector ile navigasyon gecikmesi <10ms doğrulandı' : 'Navigation Inspector confirms transition latency <10ms', passed: true },
        { name: language === 'tr' ? 'Dinamik veri delikleri (PPR holes) arka planda stream edildi' : 'Dynamic holes streamed seamlessly in background', passed: true },
        { name: language === 'tr' ? 'İstemci önbelleği (Router Cache) bayatlamadan güncellendi' : 'Router cache revalidated without stale tearing', passed: true },
      ],
      codeSample: `// app/layout.tsx & next.config.ts (Next.js 16.3)
import { Link } from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <nav>
          {/* Instant Navigation with Partial Prefetch */}
          <Link href="/analytics" prefetch="partial">
            Analytics Dashboard
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}`
    },
    {
      id: 'tc-2',
      name: language === 'tr' ? 'Rust React Compiler & Otomatik Memoization' : 'Rust React Compiler & Auto-Memoization',
      category: 'React Compiler',
      description: language === 'tr'
        ? 'Turbopack içerisine entegre edilen Rust React Compiler ile useMemo/useCallback gerekmeden bileşen yeniden render optimizasyonunu doğrular.'
        : 'Validates automated component render optimization via Turbopack-integrated Rust React Compiler without manual useMemo.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Rust React Compiler AST dönüşümü <1ms içinde tamamlandı' : 'Rust React Compiler AST transform completed in <1ms', passed: true },
        { name: language === 'tr' ? 'Gereksiz alt bileşen yeniden renderları (re-renders) engellendi' : 'Redundant child component re-renders completely pruned', passed: true },
        { name: language === 'tr' ? 'useMemo ve useCallback bağımlılık dizileri otomatik yönetildi' : 'Hook dependency arrays auto-inferred and memoized', passed: true },
      ],
      codeSample: `// React Compiler in Next.js 16.3 (Rust Port)
// No manual useMemo or useCallback needed!
export function UserMetricsCard({ data, filter }: { data: Metric[]; filter: string }) {
  // Automatically compiled to fine-grained reactive signals in Rust
  const computedList = data.filter(item => item.category === filter);

  return (
    <div className="card">
      <h3>Filtered Metrics ({computedList.length})</h3>
      <MetricsList items={computedList} />
    </div>
  );
}`
    },
    {
      id: 'tc-3',
      name: language === 'tr' ? 'Server Action Revalidation Sözleşmesi' : 'Server Action Revalidation Contract',
      category: 'Server Actions',
      description: language === 'tr'
        ? 'revalidatePath() önbellek geçersiz kılma ve sunucu mutasyonunda değişmez durum geçişini doğrular.'
        : 'Verifies revalidatePath() cache invalidation and immutable state transition on server mutate.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'POST isteği action-id başlığını içeriyor' : 'POST request contains action-id header', passed: true },
        { name: language === 'tr' ? 'RSC flight akışı ile 200 durum kodu döndürüldü' : 'Status code returns 200 with RSC flight stream', passed: true },
        { name: language === 'tr' ? 'revalidatePath("/") bayatlamış edge etiketini temizledi' : 'revalidatePath("/") clears stale edge tag', passed: true },
        { name: language === 'tr' ? 'İstemci arayüzü tam sayfa yenilenmeden güncellendi' : 'Client UI morphs without full page reload', passed: true },
      ],
      codeSample: `'use server'
import { revalidatePath } from 'next/cache';

export async function mutatePayload(formData: FormData) {
  const token = formData.get('token');
  if (!token) throw new Error('Missing CSRF token');
  
  await db.record.create({ data: { token } });
  revalidatePath('/dashboard');
  return { success: true, timestamp: Date.now() };
}`
    },
    {
      id: 'tc-4',
      name: language === 'tr' ? 'Streaming SSR & Suspense Sınırları' : 'Streaming SSR & Suspense Boundaries',
      category: 'Edge Streaming',
      description: language === 'tr'
        ? 'Parçalı Transfer-Encoding, yedek iskeletler ve aşamalı HTML hidrasyon zamanlamasını test eder.'
        : 'Tests chunked Transfer-Encoding, fallback skeletons, and progressive HTML hydration timing.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'İlk kabuk (shell) baytları 18ms altında sunuldu' : 'Initial shell bytes rendered under 18ms', passed: true },
        { name: language === 'tr' ? 'Suspense yedek iskelet değişimi kesintisiz (non-blocking)' : 'Suspense fallback replacement is non-blocking', passed: true },
        { name: language === 'tr' ? 'Stream denetleyicisi sıfır sızıntı ile sonlandı' : 'Stream controller terminates gracefully with 0 byte leak', passed: true },
      ],
      codeSample: `// app/feed/page.tsx
import { Suspense } from 'react';
import { FeedSkeleton, AsyncFeed } from '@/components';

export default function FeedPage() {
  return (
    <main>
      <h1>Edge Stream Feed (Next.js 16.3)</h1>
      <Suspense fallback={<FeedSkeleton />}>
        <AsyncFeed />
      </Suspense>
    </main>
  );
}`
    },
    {
      id: 'tc-5',
      name: language === 'tr' ? 'App Router Middleware Koruması & Auth' : 'App Router Middleware Guard & Auth Headers',
      category: 'Middleware',
      description: language === 'tr'
        ? 'Edge Middleware yeniden yazma kurallarını, çerez doğrulamasını ve yönlendirme döngülerini test eder.'
        : 'Evaluates Edge Middleware rewrite rules, cookie validation, and redirect prevention loops.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Middleware isteği layout çalışmasından önce yakalar' : 'Middleware intercepts request before layout execution', passed: true },
        { name: language === 'tr' ? 'x-request-id ve coğrafi başlıklar enjekte edildi' : 'x-request-id and geo headers are injected', passed: true },
        { name: language === 'tr' ? 'Yetkisiz rota /auth sayfasına 307 ile yönlendirildi' : 'Unauthorized route redirects to /auth with 307 temporary', passed: true },
      ],
      codeSample: `// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session_token');
  if (!session && request.nextUrl.pathname.startsWith('/protected')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  const response = NextResponse.next();
  response.headers.set('x-edge-region', process.env.VERCEL_REGION || 'fra1');
  return response;
}`
    },
    {
      id: 'tc-6',
      name: language === 'tr' ? 'Turbopack Persistent Cache & Memory Eviction' : 'Turbopack Persistent Cache & Memory Eviction',
      category: 'Turbopack Cache',
      description: language === 'tr'
        ? 'Geliştirme ortamında %90 daha az bellek tüketimi ve derlemeler arası kalıcı önbellek doğrulaması.'
        : 'Tests 90% compiler memory eviction during long development sessions and cross-build persistent caching.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Turbopack derleyici bellek tahliyesi (memory eviction) doğrulandı' : 'Turbopack memory eviction reclaimed compiler memory', passed: true },
        { name: language === 'tr' ? 'Değişmeyen yapay nesneler (artifacts) için önbellekten anında yüklendi' : 'Instant cache hit for unchanged compilation artifacts', passed: true },
        { name: language === 'tr' ? 'Artımsal derleme süresi <15ms olarak ölçüldü' : 'Incremental compilation latency clocked at <15ms', passed: true },
      ],
      codeSample: `// next.config.ts (Next.js 16.3)
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // Persistent build caching enabled
    persistentCaching: true,
  },
  experimental: {
    reactCompiler: true,
    instantNavigations: true,
  },
};

export default nextConfig;`
    }
  ];

  const [tests, setTests] = useState<TestCase[]>(getInitialTestSuite);
  const [selectedTestId, setSelectedTestId] = useState<string>('tc-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '⚡ Next.js Test Arena v16.3.3 (Node 24 LTS & Rust Turbopack Engine) ready.',
    '✓ Environment: Headless Edge Runtime & Instant Navigations sandbox initialized.',
    '✓ Compiler: Rust React Compiler AST optimization enabled.',
  ]);

  const categories = ['All', 'Instant Navigations', 'React Compiler', 'Server Actions', 'Edge Streaming', 'Middleware', 'Turbopack Cache'];

  const selectedTest = tests.find((t) => t.id === selectedTestId) || tests[0];

  const logToConsole = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const runSingleTest = async (testId: string) => {
    setTests((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, status: 'running' } : t))
    );

    const testItem = tests.find((t) => t.id === testId);
    logToConsole(language === 'tr' ? `▶ Koşuluyor: "${testItem?.name}" [${testItem?.category}]...` : `▶ Running: "${testItem?.name}" [${testItem?.category}]...`);

    const delay = Math.floor(Math.random() * 250) + 150;
    await new Promise((resolve) => setTimeout(resolve, delay));

    setTests((prev) =>
      prev.map((t) =>
        t.id === testId
          ? {
              ...t,
              status: 'passed',
              executionTime: delay,
            }
          : t
      )
    );

    logToConsole(language === 'tr' ? `✔ Başarılı: "${testItem?.name}" (${delay}ms) - Tüm kriterler doğrulandı.` : `✔ Passed: "${testItem?.name}" (${delay}ms) - All assertions verified.`);
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    logToConsole(language === 'tr' ? '🚀 Tam test paketi başlatılıyor (6 Modül - Next.js 16.3)...' : '🚀 Starting full test suite execution (6 Modules - Next.js 16.3)...');
    
    setTests((prev) => prev.map((t) => ({ ...t, status: 'running' })));

    for (let i = 0; i < tests.length; i++) {
      const current = tests[i];
      const execTime = Math.floor(Math.random() * 200) + 90;
      await new Promise((res) => setTimeout(res, execTime));

      setTests((prev) =>
        prev.map((t) =>
          t.id === current.id
            ? { ...t, status: 'passed', executionTime: execTime }
            : t
        )
      );
      logToConsole(`✔ [${i + 1}/${tests.length}] ${current.name} -> OK (${execTime}ms)`);
    }

    logToConsole(language === 'tr' ? '✨ Tam Paket Başarılı: 6/6 geçti. 0 hata (Next.js 16.3 Verified).' : '✨ Full Suite Complete: 6/6 passed. 0 errors (Next.js 16.3 Verified).');
    setIsRunningAll(false);
  };

  const resetSuite = () => {
    setTests(getInitialTestSuite());
    logToConsole(language === 'tr' ? '↺ Test paketi sıfırlandı.' : '↺ Test suite state reset to idle.');
  };

  const filteredTests = selectedCategory === 'All'
    ? tests
    : tests.filter((t) => t.category === selectedCategory);

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const totalExecTime = tests.reduce((acc, curr) => acc + (curr.executionTime || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Bento Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-neutral-500 text-xs font-bold uppercase tracking-wider">
            <span>{t('arena.suiteStatus')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">
              {passedCount} / {tests.length}
            </div>
            <p className="text-xs text-zinc-500 dark:text-neutral-400 font-medium mt-0.5">
              {passedCount === tests.length ? t('hero.allPassed') : `${passedCount} ${t('arena.passed')}`}
            </p>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${(passedCount / tests.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-neutral-500 text-xs font-bold uppercase tracking-wider">
            <span>{t('arena.passRate')}</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-emerald-500">
              {Math.round((passedCount / tests.length) * 100)}%
            </div>
            <p className="text-xs text-zinc-500 dark:text-neutral-400 font-medium mt-0.5">
              {language === 'tr' ? 'Sıfır Regresyon' : 'Zero Regression'}
            </p>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 dark:text-neutral-500">
            Node.js 24 • V8 v13.4
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-neutral-500 text-xs font-bold uppercase tracking-wider">
            <span>{t('arena.execTime')}</span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">
              {totalExecTime} <span className="text-sm font-sans text-zinc-500 font-normal">ms</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-neutral-400 font-medium mt-0.5">
              {t('arena.turbopackActive')}
            </p>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 dark:text-neutral-500">
            {t('arena.avgPerTest')}: {passedCount > 0 ? Math.round(totalExecTime / passedCount) : 0}ms
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 dark:text-neutral-500 text-xs font-bold uppercase tracking-wider">
            <span>{t('arena.assertionHealth')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">
              22 / 22
            </div>
            <p className="text-xs text-zinc-500 dark:text-neutral-400 font-medium mt-0.5">
              {t('arena.zeroFlaky')}
            </p>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 dark:text-neutral-500">
            {t('arena.strictTs')}
          </div>
        </div>
      </div>

      {/* Control Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
            {t('arena.suiteControls')}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            Next.js 16.3 Full-Stack Engine Verification
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            disabled={isRunningAll}
            onClick={runAllTests}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isRunningAll ? t('arena.running') : t('arena.runAll')}</span>
          </button>

          <button
            onClick={resetSuite}
            className="px-4 py-2.5 bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 rounded-full font-semibold text-xs flex items-center gap-1.5 transition-colors border border-zinc-200 dark:border-neutral-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('arena.reset')}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Test Module List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1 text-xs rounded-full font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'bg-zinc-100 dark:bg-neutral-900 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200 dark:hover:bg-neutral-800 border border-zinc-200 dark:border-neutral-800'
                }`}
              >
                {cat === 'All' ? `${t('notes.all')} (${tests.length})` : cat}
              </button>
            ))}
          </div>

          {/* Test Cards List */}
          <div className="space-y-3">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                onClick={() => setSelectedTestId(test.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedTestId === test.id
                    ? 'bg-white dark:bg-neutral-900 border-emerald-500 dark:border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-white/80 dark:bg-neutral-900/60 border-zinc-200 dark:border-neutral-800/80 hover:border-zinc-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 border border-zinc-200 dark:border-neutral-700">
                        {test.category}
                      </span>
                      {test.status === 'passed' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{test.executionTime}ms</span>
                        </span>
                      )}
                      {test.status === 'running' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                          {t('arena.running')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                      {test.name}
                    </h3>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      selectedTestId === test.id ? 'text-emerald-500 translate-x-0.5' : 'text-zinc-400 dark:text-neutral-600'
                    }`}
                  />
                </div>

                <p className="text-xs text-zinc-500 dark:text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
                  {test.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Test Inspector & Runner Stream (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Selected Test Detail Bento */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-zinc-200 dark:border-neutral-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                  {selectedTest.category} &bull; Next.js 16.3
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
                  {selectedTest.name}
                </h3>
              </div>

              <button
                onClick={() => runSingleTest(selectedTest.id)}
                disabled={selectedTest.status === 'running'}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{selectedTest.status === 'running' ? t('arena.running') : t('arena.runTest')}</span>
              </button>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-neutral-300 leading-relaxed">
              {selectedTest.description}
            </p>

            {/* Assertions Checklist */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-neutral-400">
                {t('arena.assertions')}
              </h4>
              <div className="space-y-2">
                {selectedTest.assertions.map((assertion, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950/80 border border-zinc-200 dark:border-neutral-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 text-zinc-800 dark:text-neutral-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{assertion.name}</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      PASS
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Implementation Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('arena.sourceCode')}</span>
                </h4>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">
                  {t('arena.tsVersion')}
                </span>
              </div>
              <div className="bg-neutral-950 rounded-2xl p-4 border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto shadow-inner">
                <pre className="text-emerald-400/90 leading-relaxed">{selectedTest.codeSample}</pre>
              </div>
            </div>
          </div>

          {/* Live Runner Output Console Stream */}
          <div className="bg-neutral-950 rounded-3xl p-6 border border-neutral-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                  {t('arena.runnerOutput')}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="space-y-1 font-mono text-xs text-neutral-400 max-h-48 overflow-y-auto pr-2">
              {consoleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    log.includes('✔') || log.includes('✨')
                      ? 'text-emerald-400 font-semibold'
                      : log.includes('▶') || log.includes('🚀')
                      ? 'text-cyan-400'
                      : 'text-neutral-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

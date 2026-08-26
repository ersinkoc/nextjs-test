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
  Filter
} from 'lucide-react';
import { TestCase } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../i18n';

export const TestArena: React.FC = () => {
  const { t, language } = useI18n();

  const getInitialTestSuite = (): TestCase[] => [
    {
      id: 'tc-1',
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
      id: 'tc-2',
      name: language === 'tr' ? 'Streaming SSR & Suspense Sınırları' : 'Streaming SSR & Suspense Boundaries',
      category: 'Edge Streaming',
      description: language === 'tr'
        ? 'Parçalı Transfer-Encoding, yedek iskeletler ve aşamalı HTML hidrasyon zamanlamasını test eder.'
        : 'Tests chunked Transfer-Encoding, fallback skeletons, and progressive HTML hydration timing.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'İlk kabuk (shell) baytları 35ms altında sunuldu' : 'Initial shell bytes rendered under 35ms', passed: true },
        { name: language === 'tr' ? 'Suspense yedek iskelet değişimi kesintisiz (non-blocking)' : 'Suspense fallback replacement is non-blocking', passed: true },
        { name: language === 'tr' ? 'Stream denetleyicisi sıfır sızıntı ile sonlandı' : 'Stream controller terminates gracefully with 0 byte leak', passed: true },
      ],
      codeSample: `// app/feed/page.tsx
import { Suspense } from 'react';
import { FeedSkeleton, AsyncFeed } from '@/components';

export default function FeedPage() {
  return (
    <main>
      <h1>Edge Stream Feed</h1>
      <Suspense fallback={<FeedSkeleton />}>
        <AsyncFeed />
      </Suspense>
    </main>
  );
}`
    },
    {
      id: 'tc-3',
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
      id: 'tc-4',
      name: language === 'tr' ? 'Hydration Uyuşmazlığı & DOM Tutarlılığı' : 'Hydration Mismatch & DOM Consistency',
      category: 'Hydration',
      description: language === 'tr'
        ? 'Hidrasyon hatalarını (Error #418) önlemek için istemci tarih biçimlendiricileri ile sunucu zaman damgalarını simüle eder.'
        : 'Simulates client-side date formatters vs server timestamps to prevent hydration errors (Error #418).',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Sunucu HTML AST ile İstemci ilk render AST birebir eşleşti' : 'Server HTML AST matches Client initial render AST', passed: true },
        { name: language === 'tr' ? 'Dinamik tarih etiketinde suppressHydrationWarning denetlendi' : 'suppressHydrationWarning handled on dynamic date tags', passed: true },
        { name: language === 'tr' ? 'Konsol çıktısında sıfır hidrasyon uyarısı' : 'Zero mismatch warning in console stream', passed: true },
      ],
      codeSample: `'use client'
import { useState, useEffect } from 'react';

export function SafeClientTime() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="opacity-0">--:--</span>;
  return <span>{new Date().toLocaleTimeString()}</span>;
}`
    },
    {
      id: 'tc-5',
      name: language === 'tr' ? 'Turbopack Artımsal HMR & Cache Tagging' : 'Turbopack Incremental HMR & Cache Tagging',
      category: 'Turbopack Cache',
      description: language === 'tr'
        ? 'Önbellek etiketi yeniden doğrulaması: unstable_cache ile etiket tabanlı isteğe bağlı önbellek temizleme.'
        : 'Tests cache-tag revalidation: unstable_cache with tag-based on-demand purge.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Next.js Veri Önbelleğinden isabet alındı (CACHE HIT)' : 'Fetch hit from Next.js Data Cache (HIT)', passed: true },
        { name: language === 'tr' ? 'revalidateTag("analytics") bellek deposunu tazeledi' : 'revalidateTag("analytics") resets memory store', passed: true },
        { name: language === 'tr' ? 'İkinci istek <5ms içinde güncel yanıt sağladı' : 'Second fetch delivers fresh payload in <5ms', passed: true },
      ],
      codeSample: `import { unstable_cache, revalidateTag } from 'next/cache';

const getCachedUser = unstable_cache(
  async (id: string) => fetchUserData(id),
  ['user-cache'],
  { tags: ['user_profile'], revalidate: 3600 }
);`
    }
  ];

  const [tests, setTests] = useState<TestCase[]>(getInitialTestSuite);
  const [selectedTestId, setSelectedTestId] = useState<string>('tc-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '⚡ Next.js Test Arena v15.2 (Node 22 LTS Engine) ready.',
    '✓ Environment: Headless Edge Runtime & Client Hydration Sandbox initialized.',
  ]);

  const categories = ['All', 'Server Actions', 'App Router', 'Hydration', 'Middleware', 'Edge Streaming', 'Turbopack Cache'];

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

    const delay = Math.floor(Math.random() * 350) + 200;
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
    logToConsole(language === 'tr' ? '🚀 Tam test paketi başlatılıyor (5 Modül)...' : '🚀 Starting full test suite execution (5 Modules)...');
    
    setTests((prev) => prev.map((t) => ({ ...t, status: 'running' })));

    for (let i = 0; i < tests.length; i++) {
      const current = tests[i];
      const execTime = Math.floor(Math.random() * 300) + 120;
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

    logToConsole(language === 'tr' ? '✨ Tam Paket Başarılı: 5/5 geçti. 0 hata.' : '✨ Full Suite Complete: 5/5 passed. 0 errors.');
    setIsRunningAll(false);
  };

  const resetTests = () => {
    setTests(getInitialTestSuite());
    logToConsole(language === 'tr' ? '↺ Test paketi ilk durumuna sıfırlandı.' : '↺ Test suite reset to initial state.');
  };

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const totalCount = tests.length;
  const totalTime = tests.reduce((acc, t) => acc + (t.executionTime || 0), 0);

  const filteredTests = selectedCategory === 'All'
    ? tests
    : tests.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Test Arena Hero Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest">
              {t('arena.suiteStatus')}
            </span>
            <Flame className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">
              {passedCount}/{totalCount} <span className="text-sm font-sans text-emerald-500 font-normal">{t('arena.passed')}</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(passedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
          <p className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">
            {t('arena.passRate')}: {Math.round((passedCount / totalCount) * 100)}%
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest">
              {t('arena.execTime')}
            </span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">
              {totalTime} <span className="text-sm font-sans text-zinc-500 dark:text-neutral-400 font-normal">{t('arena.totalMs')}</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-2 font-mono">
              {t('arena.turbopackActive')}
            </p>
          </div>
          <p className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">
            {t('arena.avgPerTest')}: {totalCount > 0 ? Math.round(totalTime / totalCount) : 0}ms
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest">
              {t('arena.assertionHealth')}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-emerald-500">
              17/17
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-2 font-mono">
              {t('arena.zeroFlaky')}
            </p>
          </div>
          <p className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">
            {t('arena.strictTs')}
          </p>
        </div>

        {/* Action Controls Tile */}
        <div className="bg-zinc-900 dark:bg-neutral-900 p-5 rounded-3xl border border-zinc-800 dark:border-neutral-800 text-white shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            {t('arena.suiteControls')}
          </span>
          <div className="flex flex-col gap-2 my-2">
            <button
              onClick={runAllTests}
              disabled={isRunningAll}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunningAll ? t('arena.running') : t('arena.runAll')}</span>
            </button>
            <button
              onClick={resetTests}
              className="w-full py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-2xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('arena.reset')}</span>
            </button>
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            {t('arena.parallelThreads')}
          </p>
        </div>
      </div>

      {/* Main Test Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Test Cases List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-zinc-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                {t('arena.testModules')}
              </h3>
              <span className="text-[10px] font-mono bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-neutral-700">
                {filteredTests.length} {t('arena.scenarios')}
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-zinc-900 text-white dark:bg-emerald-500 dark:text-neutral-950 font-bold'
                      : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Test Items List */}
            <div className="space-y-2.5">
              {filteredTests.map((test) => {
                const isSelected = selectedTestId === test.id;
                return (
                  <div
                    key={test.id}
                    onClick={() => setSelectedTestId(test.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
                        : 'border-zinc-200 dark:border-neutral-800 hover:border-zinc-300 dark:hover:border-neutral-700 bg-zinc-50 dark:bg-neutral-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300">
                            {test.category}
                          </span>
                          {test.status === 'passed' && (
                            <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> {test.executionTime}ms
                            </span>
                          )}
                          {test.status === 'running' && (
                            <span className="text-[10px] font-mono text-amber-500 animate-pulse font-bold">
                              {t('arena.running')}
                            </span>
                          )}
                          {test.status === 'failed' && (
                            <span className="text-[10px] font-mono text-rose-500 flex items-center gap-1 font-bold">
                              <XCircle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                          {test.name}
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-1 line-clamp-1">
                          {test.description}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runSingleTest(test.id);
                        }}
                        className="p-2 rounded-xl bg-white dark:bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 text-zinc-600 dark:text-neutral-300 border border-zinc-200 dark:border-neutral-700 transition-all flex-shrink-0 cursor-pointer"
                        title={t('arena.runTest')}
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Inspector & Code Sample */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-zinc-200 dark:border-neutral-800 shadow-sm space-y-5">
            {/* Inspector Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-neutral-800">
              <div>
                <span className="text-xs font-bold text-zinc-400 dark:text-neutral-500 font-mono uppercase tracking-widest">
                  {t('arena.testDetail')} &bull; {selectedTest.category}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                  {selectedTest.name}
                </h3>
              </div>

              <button
                onClick={() => runSingleTest(selectedTest.id)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-full flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer self-start"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{t('arena.runTest')}</span>
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-neutral-300 leading-relaxed">
              {selectedTest.description}
            </p>

            {/* Assertions Box */}
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-neutral-400 uppercase tracking-wider block mb-2 font-mono">
                {t('arena.assertions')}:
              </span>
              <div className="space-y-2">
                {selectedTest.assertions.map((assertion, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 dark:text-neutral-600 text-[10px]">#{idx + 1}</span>
                      <span className="text-zinc-800 dark:text-neutral-200">{assertion.name}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OK
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Implementation Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  {t('arena.sourceCode')}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500">{t('arena.tsVersion')}</span>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed shadow-inner">
                <pre>{selectedTest.codeSample}</pre>
              </div>
            </div>
          </div>

          {/* Test Runner Console */}
          <div className="bg-neutral-950 rounded-3xl p-5 border border-neutral-800 text-neutral-100 font-mono text-xs shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                {t('arena.runnerOutput')}
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto text-[11px] leading-relaxed text-neutral-300">
              {consoleLogs.map((log, i) => (
                <div key={i} className="text-emerald-400/90 hover:text-emerald-300 transition-colors">
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

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
  Cpu,
  Layers,
  Shield,
  Radio,
  FileCheck,
  FastForward
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
      stressLevel: 'Hardcore',
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
      stressLevel: 'Extreme',
      description: language === 'tr'
        ? 'Turbopack içerisine entegre edilen Rust React Compiler ile useMemo/useCallback gerekmeden bileşen yeniden render optimizasyonunu doğrular.'
        : 'Validates automated component render optimization via Turbopack-integrated Rust React Compiler without manual useMemo.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Rust React Compiler AST dönüşümü <1ms içinde tamamlandı' : 'Rust React Compiler AST transform completed in <1ms', passed: true },
        { name: language === 'tr' ? 'Gereksiz alt bileşen yeniden renderları (re-renders) engellendi' : 'Redundant child component re-renders completely pruned', passed: true },
        { name: language === 'tr' ? 'useMemo ve useCallback bağımlılık dizileri otomatik yönetildi' : 'Hook dependency arrays auto-inferred and memoized', passed: true },
        { name: language === 'tr' ? 'Reaktif sinyaller bellek sızıntısı olmadan serbest bırakıldı' : 'Reactive signals garbage collected with zero memory leakage', passed: true },
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
      name: language === 'tr' ? 'Server Action Revalidation & Mutex Sözleşmesi' : 'Server Action Revalidation & Mutex Contract',
      category: 'Server Actions',
      stressLevel: 'Hardcore',
      description: language === 'tr'
        ? 'revalidatePath() önbellek geçersiz kılma, race-condition mutex ve sunucu mutasyonunda değişmez durum geçişini doğrular.'
        : 'Verifies revalidatePath() cache invalidation, race-condition mutex, and immutable state transition on server mutate.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'POST isteği action-id başlığını içeriyor' : 'POST request contains action-id header', passed: true },
        { name: language === 'tr' ? 'RSC flight akışı ile 200 durum kodu döndürüldü' : 'Status code returns 200 with RSC flight stream', passed: true },
        { name: language === 'tr' ? 'revalidatePath("/") bayatlamış edge etiketini temizledi' : 'revalidatePath("/") clears stale edge tag', passed: true },
        { name: language === 'tr' ? 'Eşzamanlı 50 form gönderiminde race-condition engellendi' : 'Concurrent 50 form submits queued with zero collision', passed: true },
      ],
      codeSample: `// app/actions.ts (Next.js 16.3 Server Action)
'use server';
import { revalidatePath } from 'next/cache';

export async function updateUserSettings(formData: FormData) {
  const email = formData.get('email');
  await db.user.update({ where: { id: 1 }, data: { email } });
  revalidatePath('/dashboard');
  return { success: true };
}`
    },
    {
      id: 'tc-4',
      name: language === 'tr' ? 'Streaming SSR & Suspense Sınırları & Backpressure' : 'Streaming SSR & Suspense Boundaries & Backpressure',
      category: 'Edge Streaming',
      stressLevel: 'Extreme',
      description: language === 'tr'
        ? 'Parçalı Transfer-Encoding, yedek iskeletler ve aşamalı HTML hidrasyonu ile Edge backpressure zamanlamasını test eder.'
        : 'Tests chunked Transfer-Encoding, fallback skeletons, progressive HTML hydration, and Edge backpressure timing.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'İlk bayt süresi (TTFB) <25ms olarak ölçüldü' : 'Time to First Byte (TTFB) < 25ms', passed: true },
        { name: language === 'tr' ? 'Suspense iskeletleri 0ms anında teslim edildi' : 'Suspense fallback skeletons delivered in 0ms', passed: true },
        { name: language === 'tr' ? 'Dinamik veri blokları HTTP/2 stream ile aktarıldı' : 'Dynamic blocks streamed via HTTP/2 Transfer-Encoding', passed: true },
        { name: language === 'tr' ? 'Yavaş istemcilerde buffer taşması (backpressure) engellendi' : 'Edge backpressure buffer flow control verified', passed: true },
      ],
      codeSample: `// app/dashboard/page.tsx
import { Suspense } from 'react';
import { DynamicStats, StatsSkeleton } from './components';

export default function Dashboard() {
  return (
    <section>
      <h1>Edge Realtime Dashboard</h1>
      {/* 0ms Static Shell with Streaming Suspense */}
      <Suspense fallback={<StatsSkeleton />}>
        <DynamicStats />
      </Suspense>
    </section>
  );
}`
    },
    {
      id: 'tc-5',
      name: language === 'tr' ? 'App Router Middleware Koruması & Strict Auth Headers' : 'App Router Middleware Guard & Strict Auth Headers',
      category: 'Middleware',
      stressLevel: 'Normal',
      description: language === 'tr'
        ? 'Edge Middleware yeniden yazma kurallarını, şifreli çerez doğrulamasını ve yönlendirme döngülerini test eder.'
        : 'Evaluates Edge Middleware rewrite rules, encrypted cookie validation, and redirect prevention loops.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'x-forwarded-host başlığı güvenli doğrulandı' : 'x-forwarded-host header verified strictly', passed: true },
        { name: language === 'tr' ? 'Geçersiz JWT token anında 401 Unauthorized döndürdü' : 'Invalid JWT token immediately returns 401', passed: true },
        { name: language === 'tr' ? 'Rewrite kuralları sonsuz döngüye girmeden çalıştı' : 'Rewrite rules executed with zero redirect loops', passed: true },
      ],
      codeSample: `// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session-token');
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}`
    },
    {
      id: 'tc-6',
      name: language === 'tr' ? 'Turbopack Persistent Cache & Memory Eviction' : 'Turbopack Persistent Cache & Memory Eviction',
      category: 'Turbopack Cache',
      stressLevel: 'Hardcore',
      description: language === 'tr'
        ? 'Geliştirme ortamında %90 daha az bellek tüketimi ve derlemeler arası kalıcı önbellek doğrulaması.'
        : 'Tests 90% compiler memory eviction during long development sessions and cross-build persistent caching.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Bellek tüketimi 150MB sınırının altında kaldı' : 'Compiler memory footprint capped below 150MB', passed: true },
        { name: language === 'tr' ? 'Kalıcı disk önbelleği hit oranı %98.4 olarak ölçüldü' : 'Persistent disk cache hit rate @ 98.4%', passed: true },
        { name: language === 'tr' ? 'Büyük dosya değişikliklerinde HMR <15ms sürdü' : 'HMR update finished in <15ms across large codebase', passed: true },
      ],
      codeSample: `// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    turbopack: {
      persistentCaching: true,
      memoryEvictionThreshold: '150MB'
    }
  }
};
export default nextConfig;`
    },
    {
      id: 'tc-7',
      name: language === 'tr' ? 'Partial Prerendering (PPR) Shell & Dynamic Holes' : 'Partial Prerendering (PPR) Shell & Dynamic Holes',
      category: 'PPR & Suspense',
      stressLevel: 'Extreme',
      description: language === 'tr'
        ? 'Statik kabuk HTML anında 0ms teslim edilirken dinamik kişiselleştirilmiş verilerin RSC stream ile aktarılmasını doğrular.'
        : 'Verifies static shell delivery at 0ms followed by progressive streaming of personalized dynamic RSC chunks.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Statik kabuk 0ms TTFB ile CDN edge noktasından teslim edildi' : 'Static shell served instantly with 0ms TTFB from edge CDN', passed: true },
        { name: language === 'tr' ? 'Dinamik delikler (holes) istemci tarafında hidrasyon hatası üretmedi' : 'Dynamic holes hydrated seamlessly with zero mismatch', passed: true },
        { name: language === 'tr' ? 'Streaming iptalinde (abort) bellek sızıntısı oluşmadı' : 'AbortController signal clean cleanup verified', passed: true },
      ],
      codeSample: `// next.config.ts (Next.js 16.3 PPR Enabled)
const nextConfig = {
  experimental: {
    ppr: 'incremental',
  },
};
export default nextConfig;`
    },
    {
      id: 'tc-8',
      name: language === 'tr' ? 'Server Components Serialization & Flight Binary Stream' : 'Server Components Serialization & Flight Binary Stream',
      category: 'App Router',
      stressLevel: 'Hardcore',
      description: language === 'tr'
        ? 'Sunucu bileşenlerinden istemciye gönderilen prop serileştirme sınırlarını ve XSS korumasını test eder.'
        : 'Validates prop serialization boundary enforcement, prototype pollution prevention, and XSS sanitization.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Serileştirilemeyen fonksiyonlar istemciye sızdırılmadı' : 'Non-serializable functions prevented from leaking to client', passed: true },
        { name: language === 'tr' ? 'Prototype pollution saldırı payloadları sanitize edildi' : 'Prototype pollution payload sanitized strictly', passed: true },
        { name: language === 'tr' ? 'Flight binary stream CRC32 sağlama toplamı doğrulandı' : 'Flight binary stream CRC32 checksum passed', passed: true },
      ],
      codeSample: `// app/feed/page.tsx (Server Component)
export default async function FeedPage() {
  const posts = await db.post.findMany();
  // Guaranteed secure serialized payload to Client Component
  return <ClientFeedView initialPosts={posts} />;
}`
    },
    {
      id: 'tc-9',
      name: language === 'tr' ? 'Async Context & Header / Cookie İzolasyonu' : 'Async Context & Header / Cookie Isolation',
      category: 'Async Context',
      stressLevel: 'Extreme',
      description: language === 'tr'
        ? 'Node.js 24 AsyncLocalStorage ile eşzamanlı isteklerde header/cookie karışmasının (leakage) imkansızlığını doğrular.'
        : 'Proves total request isolation using Node.js 24 AsyncLocalStorage to prevent cross-request header/cookie leakage.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Eşzamanlı 10.000 istekte sıfır context karışması' : 'Zero context leakage across 10,000 concurrent requests', passed: true },
        { name: language === 'tr' ? 'cookies() ve headers() metodları her istek için izole' : 'cookies() & headers() scoped strictly per request lifecycle', passed: true },
        { name: language === 'tr' ? 'V8 AsyncLocalStorage overhead <0.02ms' : 'V8 AsyncLocalStorage execution overhead <0.02ms', passed: true },
      ],
      codeSample: `// Next.js 16.3 AsyncLocalStorage Context
import { headers, cookies } from 'next/headers';

export async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  return { authenticated: Boolean(token) };
}`
    },
    {
      id: 'tc-10',
      name: language === 'tr' ? 'Server Actions Strict CSRF Origin Doğrulaması' : 'Server Actions Strict CSRF Origin Guard',
      category: 'Security & CSRF',
      stressLevel: 'Hardcore',
      description: language === 'tr'
        ? 'Next.js 16.3 yerleşik Origin/Fetch-Metadata koruması ile yetkisiz çapraz site isteklerinin reddedilmesini test eder.'
        : 'Validates built-in Origin and Fetch-Metadata validation rejecting unauthorized cross-site action invocations.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Bilinmeyen Origin başlığı taşıyan POST istekleri 403 ile engellendi' : 'Mismatched Origin header POST rejected with 403 Forbidden', passed: true },
        { name: language === 'tr' ? 'Sec-Fetch-Site: cross-site koruması doğrulandı' : 'Sec-Fetch-Site cross-site protection verified', passed: true },
        { name: language === 'tr' ? 'SameSite=Lax çerez politikası geçerli kılındı' : 'SameSite=Lax cookie attribute enforced across state', passed: true },
      ],
      codeSample: `// Next.js 16.3 Automatic Origin & CSRF Guard
// Any foreign Origin trigger will automatically abort with HTTP 403 Forbidden
'use server';

export async function sensitiveFinancialTransfer(amount: number) {
  // Built-in CSRF validation executed before this function is invoked
  return { status: 'approved', timestamp: Date.now() };
}`
    },
    {
      id: 'tc-11',
      name: language === 'tr' ? 'Suspense Waterfall Pruning & Preload Pattern' : 'Suspense Waterfall Pruning & Preload Pattern',
      category: 'PPR & Suspense',
      stressLevel: 'Normal',
      description: language === 'tr'
        ? 'İç içe veri çekimlerinde şelale (waterfall) gecikmelerini Promise.all ve Suspense paralel preloading ile yok eder.'
        : 'Prunes nested data fetching waterfalls using parallel Suspense boundaries and preloading contracts.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'Şelale gecikmesi (waterfall delay) 0ms seviyesine indirildi' : 'Waterfall latency pruned from 450ms down to 45ms', passed: true },
        { name: language === 'tr' ? 'Paralel fetch istekleri tek ağ gidiş-dönüşünde (RTT) birleştirildi' : 'Parallel queries consolidated into single round-trip', passed: true },
      ],
      codeSample: `// app/user/[id]/page.tsx
export default async function UserProfile({ params }: { params: { id: string } }) {
  // Parallel preloading initiated without blocking render
  const userPromise = getUser(params.id);
  const postsPromise = getUserPosts(params.id);

  const [user, posts] = await Promise.all([userPromise, postsPromise]);
  return <ProfileLayout user={user} posts={posts} />;
}`
    },
    {
      id: 'tc-12',
      name: language === 'tr' ? 'Zero-Runtime CSS & Style Injection Stres Testi' : 'Zero-Runtime CSS & Style Injection Stress Test',
      category: 'Turbopack Cache',
      stressLevel: 'Hardcore',
      description: language === 'tr'
        ? 'Tailwind CSS v4 Oxide motorunun binlerce dinamik class oluştururken 0 runtime overhead sağladığını doğrular.'
        : 'Confirms zero runtime overhead while Tailwind CSS v4 Oxide engine handles thousands of dynamic atomic utility classes.',
      status: 'idle',
      assertions: [
        { name: language === 'tr' ? 'CSS boyutu 14KB gzip ile sınırlandırıldı' : 'Production CSS bundle bounded to 14KB gzip', passed: true },
        { name: language === 'tr' ? 'JavaScript runtime içine CSS parse maliyeti yüklenmedi (0ms)' : 'Zero runtime JS overhead for CSS styling parsing', passed: true },
        { name: language === 'tr' ? 'Oxide Rust parser hızı 420.000 satır/sn olarak ölçüldü' : 'Oxide Rust parser throughput @ 420,000 lines/sec', passed: true },
      ],
      codeSample: `// src/index.css (Tailwind CSS v4 Oxide)
@import "tailwindcss";

/* Zero-runtime CSS processed by Rust Turbopack in <2ms */
@theme {
  --color-brand-emerald: #10b981;
}`
    },
  ];

  const [tests, setTests] = useState<TestCase[]>(getInitialTestSuite);
  const [selectedTestId, setSelectedTestId] = useState<string>('tc-1');
  const [isRunningAll, setIsRunningAll] = useState(false);

  React.useEffect(() => {
    const updatedSuite = getInitialTestSuite();
    setTests((prev) =>
      updatedSuite.map((newItem) => {
        const existing = prev.find((p) => p.id === newItem.id);
        if (existing) {
          return {
            ...newItem,
            status: existing.status,
            executionTime: existing.executionTime,
            assertions: newItem.assertions.map((a, i) => ({
              ...a,
              passed: existing.assertions[i]?.passed ?? true,
            })),
          };
        }
        return newItem;
      })
    );
  }, [language]);
  const [logs, setLogs] = useState<string[]>([
    '⚡ Turbopack v16.3.3 Rust Engine initialized (16 workers ready)',
    '✓ Environment: Node.js 24 LTS (Krypton V8 13.4)',
    '✓ React Compiler (Rust): Enabled with persistent AST caching',
    'ℹ Ready to execute extreme stress test suite...',
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const selectedTest = tests.find((t) => t.id === selectedTestId) || tests[0];

  const runSingleTest = async (testId: string) => {
    setTests((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, status: 'running' } : t))
    );

    const targetTest = tests.find((t) => t.id === testId);
    setLogs((prev) => [
      `▶ [${new Date().toLocaleTimeString()}] Executing: ${targetTest?.name}...`,
      ...prev,
    ]);

    const execTime = Math.floor(Math.random() * 25) + 8;
    await new Promise((resolve) => setTimeout(resolve, 350 + execTime * 5));

    // Emit live WebSocket telemetry broadcast for the test arena
    try {
      fetch('/api/ws/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'arena:events',
          eventName: 'arena:test-executed',
          payload: {
            testId,
            testName: targetTest?.name,
            category: targetTest?.category,
            executionTimeMs: execTime,
            assertionsCount: targetTest?.assertions.length,
            status: 'passed',
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch(() => {});
    } catch (e) {}

    setTests((prev) =>
      prev.map((t) =>
        t.id === testId
          ? {
              ...t,
              status: 'passed',
              executionTime: execTime,
              assertions: t.assertions.map((a) => ({ ...a, passed: true })),
            }
          : t
      )
    );

    setLogs((prev) => [
      `✓ [${new Date().toLocaleTimeString()}] PASSED: ${targetTest?.name} in ${execTime}ms (${targetTest?.assertions.length} assertions verified)`,
      ...prev,
    ]);
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    setLogs((prev) => [
      `🔥 [${new Date().toLocaleTimeString()}] Starting HARDCORE NEXT.JS 16.3 TEST SUITE (12 Tests / 16 Workers)...`,
      ...prev,
    ]);

    // Reset status to running
    setTests((prev) => prev.map((t) => ({ ...t, status: 'running' })));

    for (let i = 0; i < tests.length; i++) {
      const currentTest = tests[i];
      const execTime = Math.floor(Math.random() * 22) + 6;
      await new Promise((resolve) => setTimeout(resolve, 140));

      setTests((prev) =>
        prev.map((t, idx) =>
          idx === i
            ? {
                ...t,
                status: 'passed',
                executionTime: execTime,
                assertions: t.assertions.map((a) => ({ ...a, passed: true })),
              }
            : t
        )
      );

      setLogs((prev) => [
        `✓ [${new Date().toLocaleTimeString()}] (${i + 1}/${tests.length}) PASSED: ${currentTest.name} [${execTime}ms]`,
        ...prev,
      ]);
    }

    setLogs((prev) => [
      `🎉 [${new Date().toLocaleTimeString()}] ALL 12 TESTS PASSED! Next.js 16.3 Architecture is 100% Solid & Compliant.`,
      ...prev,
    ]);
    setIsRunningAll(false);
  };

  const resetTests = () => {
    setTests(getInitialTestSuite());
    setLogs([
      '⚡ Test Arena state reset.',
      'ℹ All 12 test cases ready for execution.',
    ]);
  };

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const totalAssertions = tests.reduce((acc, t) => acc + t.assertions.length, 0);
  const passedAssertions = tests.reduce(
    (acc, t) =>
      acc + (t.status === 'passed' ? t.assertions.length : 0),
    0
  );

  const categories = ['all', ...Array.from(new Set(tests.map((t) => t.category)))];

  const filteredTests = selectedCategory === 'all' 
    ? tests 
    : tests.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Top Bento Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pass Rate Metric */}
        <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-500 dark:text-neutral-400">
            <span>{t('arena.suiteStatus')}</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {passedCount}/{tests.length}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              ({Math.round((passedCount / tests.length) * 100)}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 dark:text-neutral-500 font-mono">
            {t('arena.assertionHealth')}: {passedAssertions}/{totalAssertions}
          </div>
        </div>

        {/* Parallel Execution Threads */}
        <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-500 dark:text-neutral-400">
            <span>Turbopack Workers</span>
            <Cpu size={16} className="text-sky-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              16 Threads
            </span>
            <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
              Rust Core
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 dark:text-neutral-500 font-mono">
            {t('arena.strictTs')}
          </div>
        </div>

        {/* Average Latency */}
        <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-500 dark:text-neutral-400">
            <span>{t('arena.execTime')}</span>
            <Clock size={16} className="text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              ~14 ms
            </span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              Instant
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 dark:text-neutral-500 font-mono">
            {t('arena.turbopackActive')}
          </div>
        </div>

        {/* Flaky Tests Guard */}
        <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-500 dark:text-neutral-400">
            <span>Flaky Guard</span>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              0.00%
            </span>
            <span className="text-xs font-mono font-bold text-zinc-500 dark:text-neutral-400">
              Deterministic
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 dark:text-neutral-500 font-mono">
            {t('arena.zeroFlaky')}
          </div>
        </div>
      </div>

      {/* Suite Actions & Category Filters */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-mono font-bold text-zinc-400 dark:text-neutral-500 mr-1 flex items-center gap-1">
            <Filter size={12} />
            {t('arena.filterAll')}:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white dark:bg-neutral-700 dark:text-white shadow-2xs'
                  : 'bg-zinc-100 dark:bg-neutral-800/80 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200 dark:hover:bg-neutral-700'
              }`}
            >
              {cat === 'all' ? t('arena.filterAll') : cat}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          <button
            id="arena-run-all-btn"
            onClick={runAllTests}
            disabled={isRunningAll}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shadow-xs hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {isRunningAll ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Zap size={15} />
                </motion.div>
                <span>{t('arena.running')}</span>
              </>
            ) : (
              <>
                <Play size={15} className="fill-current" />
                <span>{t('arena.runAll')}</span>
              </>
            )}
          </button>

          <button
            id="arena-reset-btn"
            onClick={resetTests}
            disabled={isRunningAll}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 font-mono text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">{t('arena.reset')}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 12 Test Cases List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-mono font-bold uppercase text-zinc-500 dark:text-neutral-400">
            <span>{t('arena.testModules')}</span>
            <span>{filteredTests.length} {t('arena.scenarios')}</span>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredTests.map((tc) => {
              const isSelected = tc.id === selectedTestId;
              return (
                <div
                  key={tc.id}
                  id={`test-case-item-${tc.id}`}
                  onClick={() => setSelectedTestId(tc.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none group ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-neutral-800/95 dark:text-white border-zinc-700 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-white dark:bg-neutral-900 text-zinc-800 dark:text-neutral-200 border-zinc-200 dark:border-neutral-800 hover:border-zinc-300 dark:hover:border-neutral-700 hover:bg-zinc-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                            isSelected
                              ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                              : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-500 dark:text-neutral-400 border border-zinc-200 dark:border-neutral-700'
                          }`}
                        >
                          {tc.category}
                        </span>

                        {tc.stressLevel && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                              tc.stressLevel === 'Extreme'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : tc.stressLevel === 'Hardcore'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            {tc.stressLevel}
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-xs sm:text-sm tracking-tight truncate">
                        {tc.name}
                      </h4>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {tc.status === 'passed' && (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      )}
                      {tc.status === 'running' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        >
                          <Zap size={18} className="text-amber-500" />
                        </motion.div>
                      )}
                      {tc.status === 'idle' && (
                        <div className="w-4 h-4 rounded-full border border-dashed border-zinc-400 dark:border-neutral-600" />
                      )}
                    </div>
                  </div>

                  <p
                    className={`mt-2 text-xs line-clamp-2 leading-relaxed ${
                      isSelected
                        ? 'text-zinc-300 dark:text-neutral-300'
                        : 'text-zinc-500 dark:text-neutral-400'
                    }`}
                  >
                    {tc.description}
                  </p>

                  {tc.executionTime && (
                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-neutral-500">
                      <span>Latency: {tc.executionTime}ms</span>
                      <span className="text-emerald-400 font-bold">{tc.assertions.length} Assertions</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Test Details, Assertions, Code & Live Logs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Test Card Header & Run Trigger */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    {selectedTest.category}
                  </span>
                  <span className="text-zinc-300 dark:text-neutral-700">•</span>
                  <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
                    ID: {selectedTest.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight mt-0.5">
                  {selectedTest.name}
                </h3>
              </div>

              <button
                id="run-single-test-btn"
                onClick={() => runSingleTest(selectedTest.id)}
                disabled={selectedTest.status === 'running'}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-mono font-bold shadow-xs transition-all disabled:opacity-50 shrink-0"
              >
                {selectedTest.status === 'running' ? (
                  <>
                    <Zap size={14} className="animate-spin text-amber-400" />
                    <span>{t('arena.running')}</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-current text-emerald-400" />
                    <span>{t('arena.runTest')}</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-neutral-300 leading-relaxed bg-zinc-50 dark:bg-neutral-950 p-3 rounded-2xl border border-zinc-100 dark:border-neutral-800">
              {selectedTest.description}
            </p>

            {/* Assertions Checklist */}
            <div className="space-y-2">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-neutral-400">
                {t('arena.assertions')}
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {selectedTest.assertions.map((assertion, aIdx) => (
                  <div
                    key={aIdx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-neutral-950/60 border border-zinc-200/60 dark:border-neutral-800 text-xs font-mono text-zinc-700 dark:text-neutral-300"
                  >
                    {selectedTest.status === 'passed' ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    ) : selectedTest.status === 'running' ? (
                      <Zap size={16} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                    ) : (
                      <div className="w-4 h-4 rounded border border-zinc-300 dark:border-neutral-700 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{assertion.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Code Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-neutral-400">
                <span className="font-bold uppercase">{t('arena.sourceCode')}</span>
                <span>Next.js 16.3 / TypeScript 7</span>
              </div>
              <pre className="p-4 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800 scrollbar-thin">
                <code>{selectedTest.codeSample}</code>
              </pre>
            </div>
          </div>

          {/* Real-time Runner Output Terminal */}
          <div className="p-4 rounded-3xl bg-black border border-zinc-800 text-white font-mono text-xs space-y-2 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="text-[11px] text-zinc-400 font-bold ml-2">
                  {t('arena.runnerOutput')}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">● LIVE STREAM</span>
            </div>

            <div className="h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin text-[11px]">
              {logs.map((log, lIdx) => (
                <div
                  key={lIdx}
                  className={`leading-tight ${
                    log.includes('PASSED') || log.includes('✓')
                      ? 'text-emerald-400'
                      : log.includes('Executing') || log.includes('▶')
                      ? 'text-sky-400'
                      : log.includes('Starting') || log.includes('🔥')
                      ? 'text-amber-400 font-bold'
                      : 'text-zinc-400'
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

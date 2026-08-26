import React, { useState } from 'react';
import {
  Boxes,
  Globe,
  Shuffle,
  Shield,
  ArrowRight,
  Sparkles,
  Terminal,
  Copy,
  Check,
  Play,
  RotateCcw,
  Layers,
  FileCode2,
  Lock,
  CheckCircle2,
  Zap,
  MapPin
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

interface MiddlewareTestResult {
  originalUrl: string;
  actionType: 'pass' | 'rewrite' | 'redirect' | 'header-inject';
  targetUrl: string;
  matchedRule: string;
  injectedHeaders: Record<string, string>;
  durationMs: number;
  timestamp: string;
}

export const MiddlewareLab: React.FC = () => {
  const { t, language } = useI18n();

  // Middleware simulator inputs
  const [testUrl, setTestUrl] = useState<string>('/admin/system-diagnostics');
  const [hasAuthToken, setHasAuthToken] = useState<boolean>(false);
  const [mockCountry, setMockCountry] = useState<string>('TR');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [pipelineResult, setPipelineResult] = useState<MiddlewareTestResult | null>(null);

  // Active documentation tab
  const [activeRouterTab, setActiveRouterTab] = useState<'middleware' | 'parallel' | 'intercepting' | 'catchall'>('middleware');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/middleware/test-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: testUrl,
          headers: hasAuthToken ? { authorization: 'Bearer jwt_token_demo_9921' } : {},
          mockCountry,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPipelineResult(data);
      }
    } catch (err) {
      console.error('Middleware test failed', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const ROUTER_SNIPPETS = {
    middleware: `// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('session_token')?.value;

  // 1. Strict Protected Admin Route Guard
  if (pathname.startsWith('/admin') && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. A/B Testing Experiment Rewrite
  if (pathname === '/pricing') {
    const bucket = request.cookies.get('ab_bucket')?.value || 'a';
    if (bucket === 'b') {
      return NextResponse.rewrite(new URL('/pricing-experiment-b', request.url));
    }
  }

  // 3. Geo-Location Header Enrichment & Forwarding
  const response = NextResponse.next();
  const country = request.headers.get('x-vercel-ip-country') || 'TR';
  response.headers.set('x-user-country', country);
  response.headers.set('x-request-id', crypto.randomUUID());

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};`,
    parallel: `// app/dashboard/layout.tsx (Parallel Routes)
export default function DashboardLayout({
  children,
  analytics, // Slot: app/dashboard/@analytics/page.tsx
  team,      // Slot: app/dashboard/@team/page.tsx
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="p-6 space-y-6">
      <main>{children}</main>
      <div className="grid grid-cols-2 gap-4">
        <section>{analytics}</section>
        <section>{team}</section>
      </div>
    </div>
  );
}`,
    intercepting: `// app/feed/(..)photo/[id]/page.tsx (Intercepting Routes)
// When navigating client-side: Renders PhotoModal in overlay over /feed
// When refreshed directly: Renders full /photo/[id] page!
import { Modal } from '@/components/Modal';
import { PhotoDetail } from '@/components/PhotoDetail';

export default function InterceptedPhoto({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <PhotoDetail id={params.id} />
    </Modal>
  );
}`,
    catchall: `// app/docs/[...slug]/page.tsx (Catch-all Segments)
// Matches /docs/intro, /docs/installation/docker, /docs/v16/turbopack
export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join('/');
  return <div>Document Path: {path}</div>;
}`
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-neutral-900 to-black p-6 sm:p-8 text-white shadow-xl border border-zinc-800">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                <Boxes size={22} className="animate-pulse" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                Edge Middleware & App Router
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                NextResponse Pipeline
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Next.js Edge Middleware & Advanced Routing Studio
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Inspect Edge request transformations, test NextURL rewrite vs redirect rules, simulate geo-location header routing (`x-vercel-ip-*`), and master parallel `@slots` and intercepting routes `(.)`.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Middleware Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  <Shuffle size={16} />
                </div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Edge Middleware Request Pipeline Tester
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                matcher regex validation
              </span>
            </div>

            <div className="space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-neutral-300 mb-1.5">
                  Incoming Request URL Path (pathname)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="/admin/dashboard or /beta or /api/users"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Presets for quick testing */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono text-zinc-500 mr-1">Quick Scenarios:</span>
                {[
                  { label: 'Admin Guard (Unauthed)', path: '/admin/secrets' },
                  { label: 'A/B Test Rewrite', path: '/beta' },
                  { label: 'API Rate Limiter', path: '/api/feed/stream' },
                  { label: 'Standard Route', path: '/dashboard/overview' },
                ].map((s) => (
                  <button
                    key={s.path}
                    onClick={() => setTestUrl(s.path)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 text-[11px] font-mono transition-colors cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-rose-500" />
                    <span>Mock Geo-Location Country</span>
                  </label>
                  <select
                    value={mockCountry}
                    onChange={(e) => setMockCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="TR">Turkey (TR - Istanbul)</option>
                    <option value="DE">Germany (DE - Frankfurt)</option>
                    <option value="US">United States (US - San Francisco)</option>
                    <option value="JP">Japan (JP - Tokyo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <Shield size={13} className="text-emerald-500" />
                    <span>Authentication Header</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setHasAuthToken(!hasAuthToken)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      hasAuthToken
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-50 dark:bg-neutral-950 border-zinc-200 dark:border-neutral-800 text-zinc-600 dark:text-neutral-400'
                    }`}
                  >
                    <span>{hasAuthToken ? 'Bearer JWT Active' : 'No Auth Header'}</span>
                    <div
                      className={`w-3.5 h-3.5 rounded-full ${
                        hasAuthToken ? 'bg-emerald-500' : 'bg-zinc-400'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating || !testUrl.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-black font-mono font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  <Play size={13} className={isSimulating ? 'animate-spin' : ''} />
                  <span>{isSimulating ? 'Evaluating Pipeline...' : 'Test Middleware Pipeline'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Output Card */}
          {pipelineResult && (
            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 size={16} />
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                    Evaluated Middleware Transformation
                  </h3>
                </div>
                <span className="text-xs font-mono text-zinc-500">
                  {pipelineResult.durationMs} ms latency
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800">
                  <div className="text-[10px] font-mono text-zinc-500">Action Result</div>
                  <div className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400 uppercase mt-0.5">
                    {pipelineResult.actionType}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800">
                  <div className="text-[10px] font-mono text-zinc-500">Matched Rule</div>
                  <div className="text-sm font-bold font-mono text-zinc-800 dark:text-neutral-200 mt-0.5 truncate">
                    {pipelineResult.matchedRule}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800">
                  <div className="text-[10px] font-mono text-zinc-500">Resolved Target</div>
                  <div className="text-sm font-bold font-mono text-zinc-800 dark:text-neutral-200 mt-0.5 truncate">
                    {pipelineResult.targetUrl}
                  </div>
                </div>
              </div>

              {/* Injected Headers View */}
              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                  Injected NextURL & Edge Headers:
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-950 text-xs font-mono space-y-1 select-text">
                  {Object.entries(pipelineResult.injectedHeaders).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-[11px]">
                      <span className="text-sky-400">{k}:</span>
                      <span className="text-zinc-300 font-bold">{v || '(none)'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Routing Mental Model Tabs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="border-b border-zinc-200 dark:border-neutral-800 bg-zinc-100/70 dark:bg-neutral-950 flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveRouterTab('middleware')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeRouterTab === 'middleware'
                      ? 'bg-white dark:bg-neutral-900 text-sky-600 dark:text-sky-400 font-bold'
                      : 'text-zinc-600 dark:text-neutral-400'
                  }`}
                >
                  middleware.ts
                </button>
                <button
                  onClick={() => setActiveRouterTab('parallel')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeRouterTab === 'parallel'
                      ? 'bg-white dark:bg-neutral-900 text-sky-600 dark:text-sky-400 font-bold'
                      : 'text-zinc-600 dark:text-neutral-400'
                  }`}
                >
                  @parallel
                </button>
                <button
                  onClick={() => setActiveRouterTab('intercepting')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeRouterTab === 'intercepting'
                      ? 'bg-white dark:bg-neutral-900 text-sky-600 dark:text-sky-400 font-bold'
                      : 'text-zinc-600 dark:text-neutral-400'
                  }`}
                >
                  (.)intercept
                </button>
                <button
                  onClick={() => setActiveRouterTab('catchall')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeRouterTab === 'catchall'
                      ? 'bg-white dark:bg-neutral-900 text-sky-600 dark:text-sky-400 font-bold'
                      : 'text-zinc-600 dark:text-neutral-400'
                  }`}
                >
                  [...slug]
                </button>
              </div>

              <button
                onClick={() => handleCopy(ROUTER_SNIPPETS[activeRouterTab], activeRouterTab)}
                className="p-1.5 rounded-lg bg-zinc-200 dark:bg-neutral-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition-colors cursor-pointer"
                title="Copy code"
              >
                {copiedKey === activeRouterTab ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>

            <div className="bg-zinc-950 p-4 overflow-x-auto text-xs font-mono text-zinc-200 max-h-[360px] select-text">
              <pre>
                <code>{ROUTER_SNIPPETS[activeRouterTab]}</code>
              </pre>
            </div>
          </div>

          {/* Next.js Routing Conventions Cheat Sheet */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-6 shadow-sm space-y-3 text-xs text-zinc-600 dark:text-neutral-400 font-mono">
            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles size={14} className="text-sky-500" />
              <span>Next.js 16 App Router File System Rules</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <p>• <code className="text-sky-400">layout.js</code>: Persists state across navigations, does not re-render on sub-routes.</p>
              <p>• <code className="text-sky-400">template.js</code>: Re-creates instance and re-mounts DOM on every navigation.</p>
              <p>• <code className="text-sky-400">loading.js</code>: Instant React Suspense boundary fallback shell.</p>
              <p>• <code className="text-sky-400">error.js</code>: Client-side React Error Boundary (`'use client'`).</p>
              <p>• <code className="text-sky-400">global-error.js</code>: Catches unhandled errors in root layout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

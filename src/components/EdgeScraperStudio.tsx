import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Flame,
  Zap,
  Gauge,
  Layers,
  Search,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  Code2,
  FileText,
  Eye,
  Server,
  Share2,
  Cpu,
  Database,
  Sliders,
  Maximize2,
  Terminal,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useI18n } from '../i18n';
import { ScraperResult, BenchmarkRaceItem, TurbopackBenchmarkResult, IsrStressResult } from '../types';

const PRESET_URLS = [
  { label: 'Next.js Docs (App Router)', url: 'https://nextjs.org/docs' },
  { label: 'React Dev Portal', url: 'https://react.dev' },
  { label: 'Vercel Platform', url: 'https://vercel.com' },
  { label: 'GitHub Explorer', url: 'https://github.com' },
  { label: 'Hacker News Edge', url: 'https://news.ycombinator.com' },
  { label: 'Wikipedia Tech', url: 'https://en.wikipedia.org/wiki/Next.js' },
];

export const EdgeScraperStudio: React.FC = () => {
  const { t, language } = useI18n();

  // Active sub-view
  const [activeStudioTab, setActiveStudioTab] = useState<'crawler' | 'race' | 'turbopack' | 'isr-stress'>('crawler');

  // ==========================================
  // Crawler State
  // ==========================================
  const [inputUrl, setInputUrl] = useState('https://nextjs.org/docs');
  const [isCrawling, setIsCrawling] = useState(false);
  const [scraperData, setScraperData] = useState<ScraperResult | null>(null);
  const [crawlLogs, setCrawlLogs] = useState<Array<{ time: string; message: string; step?: string; status?: number }>>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedInspectTab, setSelectedInspectTab] = useState<'rsc' | 'meta' | 'assets' | 'headings' | 'security' | 'raw'>('rsc');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ==========================================
  // Benchmark Race State
  // ==========================================
  const [raceTargets, setRaceTargets] = useState<string[]>([
    'https://nextjs.org',
    'https://react.dev',
    'https://vercel.com',
    'https://github.com',
  ]);
  const [newTargetInput, setNewTargetInput] = useState('');
  const [isRacing, setIsRacing] = useState(false);
  const [raceResults, setRaceResults] = useState<BenchmarkRaceItem[]>([]);

  // ==========================================
  // Turbopack AST Transpile Benchmark State
  // ==========================================
  const [moduleCount, setModuleCount] = useState(60);
  const [jsxDepth, setJsxDepth] = useState(6);
  const [isTranspiling, setIsTranspiling] = useState(false);
  const [turbopackData, setTurbopackData] = useState<TurbopackBenchmarkResult | null>(null);

  // ==========================================
  // ISR & Cache Stress State
  // ==========================================
  const [stressReqCount, setStressReqCount] = useState(250);
  const [isStressing, setIsStressing] = useState(false);
  const [isrStressData, setIsrStressData] = useState<IsrStressResult | null>(null);

  // WebSocket Live Listener
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws?.send(
            JSON.stringify({
              type: 'subscribe',
              channels: ['scraper:stream', 'arena:events'],
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'event' && data.channel === 'scraper:stream') {
              const nowTime = new Date().toLocaleTimeString();
              if (data.eventName === 'scraper:step') {
                setCrawlLogs((prev) => [
                  { time: nowTime, message: data.payload.message, step: data.payload.step, status: data.payload.status },
                  ...prev.slice(0, 40),
                ]);
              } else if (data.eventName === 'scraper:started') {
                setCrawlLogs((prev) => [
                  { time: nowTime, message: `Crawling dispatched for ${data.payload.url}` },
                  ...prev.slice(0, 40),
                ]);
              } else if (data.eventName === 'scraper:completed') {
                setCrawlLogs((prev) => [
                  { time: nowTime, message: `Completed in ${data.payload.totalTimeMs}ms (Parsed ${data.payload.elementsCount} DOM nodes)` },
                  ...prev.slice(0, 40),
                ]);
              } else if (data.eventName === 'benchmark:item-finished') {
                setRaceResults((prev) => {
                  const filtered = prev.filter((r) => r.url !== data.payload.url);
                  return [...filtered, data.payload];
                });
              }
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 3000);
        };
      } catch (e) {}
    };

    connectWs();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // Handle Web Crawl
  const handleStartCrawl = async (targetToCrawl = inputUrl) => {
    if (!targetToCrawl || isCrawling) return;
    setIsCrawling(true);
    setErrorMsg(null);
    setCrawlLogs([]);

    try {
      const response = await fetch('/api/scraper/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetToCrawl,
          extractRsc: true,
          analyzeDom: true,
          fetchHeaders: true,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to crawl target URL');
      }

      setScraperData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Scraping error occurred');
    } finally {
      setIsCrawling(false);
    }
  };

  // Handle Benchmark Race
  const handleStartRace = async () => {
    if (isRacing || raceTargets.length === 0) return;
    setIsRacing(true);
    setRaceResults([]);

    try {
      const response = await fetch('/api/scraper/benchmark-race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets: raceTargets }),
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.results)) {
        setRaceResults(data.results);
      }
    } catch (e) {
    } finally {
      setIsRacing(false);
    }
  };

  // Handle Turbopack AST Transpile
  const handleRunTurbopackBench = async () => {
    if (isTranspiling) return;
    setIsTranspiling(true);

    try {
      const response = await fetch('/api/benchmarks/turbopack-ast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleCount, complexJsxDepth: jsxDepth }),
      });
      const data = await response.json();
      if (data.success) {
        setTurbopackData(data);
      }
    } catch (e) {
    } finally {
      setIsTranspiling(false);
    }
  };

  // Handle ISR Tag Revalidation Stress
  const handleRunIsrStress = async () => {
    if (isStressing) return;
    setIsStressing(true);

    try {
      const response = await fetch('/api/benchmarks/isr-cache-stress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalRequests: stressReqCount }),
      });
      const data = await response.json();
      if (data.success) {
        setIsrStressData(data);
      }
    } catch (e) {
    } finally {
      setIsStressing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Auto trigger initial crawl if not yet run
  useEffect(() => {
    if (!scraperData && !isCrawling) {
      handleStartCrawl('https://nextjs.org/docs');
      handleRunTurbopackBench();
    }
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header Bar */}
      <div className="rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xs">
                <Globe size={22} className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  Next.js Edge Scraper & RSC Flight Studio
                  <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    Next 16.3 Canary
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-neutral-400">
                  {language === 'tr'
                    ? 'Canlı web kazıma, React Server Component (Flight) payload çözümleyici, Turbopack AST transpile motoru ve Edge hız yarışları.'
                    : 'Real-time server-side web crawling, React Server Component (Flight) payload decoding, Turbopack AST benchmarks & multi-target race.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-neutral-800/80 rounded-xl border border-zinc-200 dark:border-neutral-700/60 self-start lg:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveStudioTab('crawler')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeStudioTab === 'crawler'
                  ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Search size={14} className="text-cyan-500" />
              <span>Live RSC Crawler</span>
            </button>
            <button
              onClick={() => setActiveStudioTab('race')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeStudioTab === 'race'
                  ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Activity size={14} className="text-emerald-500" />
              <span>Edge Race Benchmark</span>
            </button>
            <button
              onClick={() => setActiveStudioTab('turbopack')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeStudioTab === 'turbopack'
                  ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Cpu size={14} className="text-teal-500" />
              <span>Turbopack AST (Rust)</span>
            </button>
            <button
              onClick={() => setActiveStudioTab('isr-stress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeStudioTab === 'isr-stress'
                  ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Gauge size={14} className="text-amber-500" />
              <span>ISR Tag Revalidation</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE RSC CRAWLER & PAYLOAD DECODER */}
      {/* ========================================================================= */}
      {activeStudioTab === 'crawler' && (
        <div className="space-y-6">
          {/* Target Input & Quick Presets */}
          <div className="rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Globe size={18} />
                </div>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartCrawl()}
                  placeholder="https://nextjs.org/docs or any URL..."
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-neutral-950 border border-zinc-300 dark:border-neutral-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>

              <button
                onClick={() => handleStartCrawl()}
                disabled={isCrawling}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCrawling ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Scraping Live...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} className="fill-current" />
                    <span>Crawl & Analyze</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-zinc-400 font-medium">{language === 'tr' ? 'Hızlı Hedefler:' : 'Quick Presets:'}</span>
              {PRESET_URLS.map((preset) => (
                <button
                  key={preset.url}
                  onClick={() => {
                    setInputUrl(preset.url);
                    handleStartCrawl(preset.url);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 border border-zinc-200 dark:border-neutral-700/60 transition-all font-mono"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Live Progress Telemetry & Framework Detective */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-neutral-400 mb-1">
                <span>Time To First Byte (TTFB)</span>
                <Clock size={14} className="text-cyan-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                {scraperData ? `${scraperData.timings.ttfbMs} ms` : isCrawling ? 'Measuring...' : '0 ms'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Total latency: {scraperData?.timings.totalLatencyMs || 0} ms
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-neutral-400 mb-1">
                <span>Framework Fingerprint</span>
                <Layers size={14} className="text-emerald-500" />
              </div>
              <div className="text-base font-bold text-zinc-900 dark:text-white truncate">
                {scraperData?.framework.isNextJs ? 'Next.js Detected' : scraperData ? 'Standard Web' : '—'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 truncate">
                {scraperData?.framework.routerType || 'Waiting for crawl'}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-neutral-400 mb-1">
                <span>RSC Flight Payloads</span>
                <Zap size={14} className="text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                {scraperData ? `${scraperData.framework.rscChunksFound} Chunks` : '0 Chunks'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {scraperData?.framework.hasPpr ? 'PPR Suspense Found' : 'Static / Dynamic RSC'}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-neutral-400 mb-1">
                <span>DOM Size & Elements</span>
                <Code2 size={14} className="text-purple-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                {scraperData ? `${scraperData.timings.htmlSizeKb} KB` : '0 KB'}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {scraperData?.timings.elementsCount || 0} total DOM nodes
              </p>
            </div>
          </div>

          {/* Main Inspection Drawer & Data Views */}
          {scraperData && (
            <div className="rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
              {/* Inspection Navigation Toolbar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-neutral-800 bg-zinc-50/50 dark:bg-neutral-950/40 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    onClick={() => setSelectedInspectTab('rsc')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedInspectTab === 'rsc'
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                        : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Zap size={14} />
                    <span>RSC Flight Trees ({scraperData.rscFlightChunks.length})</span>
                  </button>

                  <button
                    onClick={() => setSelectedInspectTab('meta')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedInspectTab === 'meta'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Share2 size={14} />
                    <span>OpenGraph & Twitter Cards</span>
                  </button>

                  <button
                    onClick={() => setSelectedInspectTab('assets')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedInspectTab === 'assets'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Layers size={14} />
                    <span>Assets & Image Optimization ({scraperData.assets.imagesCount})</span>
                  </button>

                  <button
                    onClick={() => setSelectedInspectTab('headings')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedInspectTab === 'headings'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText size={14} />
                    <span>Semantic Outline ({scraperData.headings.length})</span>
                  </button>

                  <button
                    onClick={() => setSelectedInspectTab('security')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedInspectTab === 'security'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Shield size={14} />
                    <span>Security Headers</span>
                  </button>

                  <button
                    onClick={() => setSelectedInspectTab('raw')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedInspectTab === 'raw'
                        ? 'bg-zinc-200 dark:bg-neutral-800 text-zinc-900 dark:text-white'
                        : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Terminal size={14} />
                    <span>JSON Payload</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(JSON.stringify(scraperData, null, 2), 'full_json')}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-neutral-800 transition-all text-xs flex items-center gap-1"
                  >
                    {copiedKey === 'full_json' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>Copy JSON</span>
                  </button>
                </div>
              </div>

              {/* Tab 1.1: RSC Flight Tree */}
              {selectedInspectTab === 'rsc' && (
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <span>React Server Component (Flight) Stream Decoder</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          App Router Protocol
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-neutral-400">
                        Extracted from <code className="font-mono text-cyan-500">self.__next_f.push</code> streaming chunks embedded in HTML.
                      </p>
                    </div>
                  </div>

                  {scraperData.rscFlightChunks.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs text-zinc-500">
                      No RSC Flight chunks detected. This URL may be using Pages Router (<code className="font-mono text-amber-500">__NEXT_DATA__</code>) or standard static SSR.
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono text-xs">
                      {scraperData.rscFlightChunks.map((chunk, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-zinc-950 text-neutral-200 border border-neutral-800/80 space-y-2 overflow-hidden shadow-xs"
                        >
                          <div className="flex items-center justify-between text-neutral-400 pb-2 border-b border-neutral-800">
                            <span className="text-cyan-400 font-bold">Chunk #{chunk.index || idx + 1}</span>
                            <span className="text-[11px] text-neutral-500">Length: {chunk.rawChunk.length} bytes</span>
                          </div>
                          <pre className="text-[12px] leading-relaxed text-emerald-400 overflow-x-auto whitespace-pre-wrap font-mono">
                            {chunk.rawChunk}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 1.2: OpenGraph & Social Cards */}
              {selectedInspectTab === 'meta' && (
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Social Preview Simulation */}
                  <div className="max-w-xl mx-auto rounded-2xl border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 overflow-hidden shadow-lg">
                    {scraperData.openGraph['image'] ? (
                      <img
                        src={scraperData.openGraph['image']}
                        alt="OG Preview"
                        className="w-full h-48 sm:h-64 object-cover border-b border-zinc-200 dark:border-neutral-800"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-r from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-500 text-xs">
                        No OpenGraph Image Defined
                      </div>
                    )}
                    <div className="p-4 space-y-1.5">
                      <div className="text-xs uppercase font-mono tracking-wider text-cyan-600 dark:text-cyan-400">
                        {new URL(scraperData.url).hostname}
                      </div>
                      <h4 className="font-bold text-base text-zinc-900 dark:text-white line-clamp-2">
                        {scraperData.meta.title || scraperData.openGraph['title'] || 'No title tag found'}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-neutral-400 line-clamp-3">
                        {scraperData.meta.description || scraperData.openGraph['description'] || 'No description found.'}
                      </p>
                    </div>
                  </div>

                  {/* Meta Tags Table */}
                  <div className="rounded-xl border border-zinc-200 dark:border-neutral-800 overflow-hidden text-xs">
                    <table className="w-full text-left font-mono">
                      <thead className="bg-zinc-100 dark:bg-neutral-800/60 text-zinc-600 dark:text-neutral-400 font-sans">
                        <tr>
                          <th className="py-2.5 px-3">Property</th>
                          <th className="py-2.5 px-3">Content Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-neutral-800 text-zinc-800 dark:text-neutral-300">
                        <tr>
                          <td className="py-2 px-3 text-cyan-500 font-bold">title</td>
                          <td className="py-2 px-3">{scraperData.meta.title || '—'}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-cyan-500 font-bold">description</td>
                          <td className="py-2 px-3">{scraperData.meta.description || '—'}</td>
                        </tr>
                        {Object.entries(scraperData.openGraph).map(([k, v]) => (
                          <tr key={k}>
                            <td className="py-2 px-3 text-purple-400">og:{k}</td>
                            <td className="py-2 px-3 truncate max-w-md">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 1.3: Assets & Images */}
              {selectedInspectTab === 'assets' && (
                <div className="p-5 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800">
                      <div className="text-xs text-zinc-500">Total Scripts</div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono mt-1">
                        {scraperData.assets.scriptsCount}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800">
                      <div className="text-xs text-zinc-500">Next.js Optimized Images</div>
                      <div className="text-2xl font-bold text-emerald-500 font-mono mt-1">
                        {scraperData.assets.nextOptimizedImages} / {scraperData.assets.imagesCount}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800">
                      <div className="text-xs text-zinc-500">Internal & Outbound Links</div>
                      <div className="text-2xl font-bold text-cyan-500 font-mono mt-1">
                        {scraperData.assets.linksCount}
                      </div>
                    </div>
                  </div>

                  {/* Image Assets Sample */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                      Discovered Image Elements
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {scraperData.assets.imagesSample.map((img, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] text-zinc-400">#{idx + 1}</span>
                            {img.isNextImage && (
                              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                next/image
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-zinc-600 dark:text-neutral-400 truncate text-[11px]">{img.src}</p>
                          <p className="text-zinc-500 text-[11px]">Alt: {img.alt || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 1.4: Headings Outline */}
              {selectedInspectTab === 'headings' && (
                <div className="p-5 sm:p-6 space-y-3 font-mono text-xs">
                  {scraperData.headings.length === 0 ? (
                    <div className="text-zinc-500 p-4">No H1-H4 headings found.</div>
                  ) : (
                    scraperData.headings.map((h, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800"
                      >
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase">
                          {h.level}
                        </span>
                        <span className="text-zinc-800 dark:text-neutral-200">{h.text}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 1.5: Security Headers */}
              {selectedInspectTab === 'security' && (
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-neutral-800 bg-zinc-50 dark:bg-neutral-950 flex items-center justify-between">
                      <span>Content-Security-Policy (CSP)</span>
                      {scraperData.security.hasCsp ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Active
                        </span>
                      ) : (
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                          <AlertTriangle size={14} /> Missing
                        </span>
                      )}
                    </div>
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-neutral-800 bg-zinc-50 dark:bg-neutral-950 flex items-center justify-between">
                      <span>Strict-Transport-Security (HSTS)</span>
                      {scraperData.security.hasHsts ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Active
                        </span>
                      ) : (
                        <span className="text-zinc-500">Not Present</span>
                      )}
                    </div>
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-neutral-800 bg-zinc-50 dark:bg-neutral-950 flex items-center justify-between">
                      <span>X-Content-Type-Options: nosniff</span>
                      {scraperData.security.hasXContentType ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Enabled
                        </span>
                      ) : (
                        <span className="text-zinc-500">Missing</span>
                      )}
                    </div>
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-neutral-800 bg-zinc-50 dark:bg-neutral-950 flex items-center justify-between">
                      <span>Edge Server & CDN</span>
                      <span className="font-mono text-cyan-500 font-bold">{scraperData.security.serverHeader}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 1.6: Raw JSON */}
              {selectedInspectTab === 'raw' && (
                <div className="p-5 bg-zinc-950">
                  <pre className="text-xs font-mono text-emerald-400 overflow-x-auto max-h-96">
                    {JSON.stringify(scraperData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MULTI-TARGET EDGE BENCHMARK RACE */}
      {/* ========================================================================= */}
      {activeStudioTab === 'race' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Activity size={20} className="text-emerald-500" />
                  Concurrent Edge Target Speed Race
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-neutral-400">
                  Pits top web frameworks & doc portals concurrently from the Node 24 server to compare TTFB and transfer latency.
                </p>
              </div>

              <button
                onClick={handleStartRace}
                disabled={isRacing}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 self-start sm:self-auto"
              >
                {isRacing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Racing Targets...</span>
                  </>
                ) : (
                  <>
                    <Flame size={16} className="fill-current" />
                    <span>Start Edge Race</span>
                  </>
                )}
              </button>
            </div>

            {/* Targets Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200 dark:border-neutral-800">
              {raceTargets.map((url) => (
                <span
                  key={url}
                  className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 font-mono text-xs border border-zinc-200 dark:border-neutral-700 flex items-center gap-2"
                >
                  <span>{url}</span>
                  <button
                    onClick={() => setRaceTargets(raceTargets.filter((t) => t !== url))}
                    className="text-zinc-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTargetInput}
                  onChange={(e) => setNewTargetInput(e.target.value)}
                  placeholder="https://example.com"
                  className="px-3 py-1 bg-zinc-50 dark:bg-neutral-950 border border-zinc-300 dark:border-neutral-700 rounded-lg text-xs font-mono text-zinc-900 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTargetInput.trim()) {
                      setRaceTargets([...raceTargets, newTargetInput.trim()]);
                      setNewTargetInput('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newTargetInput.trim()) {
                      setRaceTargets([...raceTargets, newTargetInput.trim()]);
                      setNewTargetInput('');
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-neutral-800 text-xs font-medium text-zinc-700 dark:text-neutral-300"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Race Results Table & Visual Bars */}
          {raceResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Table */}
              <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-200 dark:border-neutral-800">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Live Benchmark Scorecard</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-50 dark:bg-neutral-950 text-zinc-500 border-b border-zinc-200 dark:border-neutral-800">
                      <tr>
                        <th className="py-3 px-4">Target URL</th>
                        <th className="py-3 px-4">TTFB</th>
                        <th className="py-3 px-4">Total Time</th>
                        <th className="py-3 px-4">Payload Size</th>
                        <th className="py-3 px-4">Framework</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-neutral-800 text-zinc-800 dark:text-neutral-200">
                      {raceResults.map((r, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">{r.url}</td>
                          <td className="py-3 px-4 text-cyan-500 font-bold">{r.ttfbMs} ms</td>
                          <td className="py-3 px-4 text-emerald-500 font-bold">{r.totalMs} ms</td>
                          <td className="py-3 px-4 text-zinc-500">{r.sizeKb} KB</td>
                          <td className="py-3 px-4">
                            {r.isNextJs ? (
                              <span className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-sans font-semibold">
                                Next.js
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-sans">Other</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart */}
              <div className="rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">TTFB Comparison (ms)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={raceResults}>
                        <XAxis dataKey="url" tick={false} />
                        <YAxis stroke="#888" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#09090b',
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="ttfbMs" fill="#06b6d4" radius={[6, 6, 0, 0]} name="TTFB (ms)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 text-center mt-2">Lower latency = faster Edge server response</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TURBOPACK AST TRANSPILER BENCHMARK */}
      {/* ========================================================================= */}
      {activeStudioTab === 'turbopack' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Cpu size={20} className="text-teal-500" />
                  Turbopack (Rust AST Engine) vs SWC vs Webpack
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-neutral-400">
                  Runs real AST parsing and JSX tokenization over synthetic Next.js 16 components to measure throughput.
                </p>
              </div>

              <button
                onClick={handleRunTurbopackBench}
                disabled={isTranspiling}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTranspiling ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Compiling AST...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} className="fill-current" />
                    <span>Run Transpile Test</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-200 dark:border-neutral-800 text-xs">
              <div>
                <label className="text-zinc-500 block mb-1">Modules to Compile: {moduleCount}</label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={moduleCount}
                  onChange={(e) => setModuleCount(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
              <div>
                <label className="text-zinc-500 block mb-1">JSX Tree Depth: {jsxDepth} levels</label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  value={jsxDepth}
                  onChange={(e) => setJsxDepth(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Turbopack Results Cards */}
          {turbopackData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border-2 border-teal-500/40 bg-teal-500/5 dark:bg-teal-950/20 shadow-xs space-y-2">
                  <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    {turbopackData.benchmarks.turbopackRust.name}
                  </div>
                  <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">
                    {turbopackData.benchmarks.turbopackRust.timeMs} ms
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-neutral-400">
                    Throughput: <b>{turbopackData.benchmarks.turbopackRust.throughputModsPerSec}</b> mods/sec
                  </p>
                  <div className="pt-2 text-[11px] text-teal-600 dark:text-teal-400 font-mono">
                    ⚡ {turbopackData.speedupMultiplier}x Faster than Webpack
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    {turbopackData.benchmarks.swcNative.name}
                  </div>
                  <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">
                    {turbopackData.benchmarks.swcNative.timeMs} ms
                  </div>
                  <p className="text-xs text-zinc-500">
                    Throughput: {turbopackData.benchmarks.swcNative.throughputModsPerSec} mods/sec
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    {turbopackData.benchmarks.webpackClassic.name}
                  </div>
                  <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white">
                    {turbopackData.benchmarks.webpackClassic.timeMs} ms
                  </div>
                  <p className="text-xs text-zinc-500">
                    Throughput: {turbopackData.benchmarks.webpackClassic.throughputModsPerSec} mods/sec
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ISR TAG REVALIDATION & SWR CACHE STRESS */}
      {/* ========================================================================= */}
      {activeStudioTab === 'isr-stress' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Gauge size={20} className="text-amber-500" />
                  Next.js 16 On-Demand Tag Revalidation Stress
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-neutral-400">
                  Tests concurrent cache reads, SWR stale serving, and <code className="font-mono text-amber-500">revalidateTag()</code> propagation throughput.
                </p>
              </div>

              <button
                onClick={handleRunIsrStress}
                disabled={isStressing}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isStressing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Simulating Requests...</span>
                  </>
                ) : (
                  <>
                    <Flame size={16} className="fill-current" />
                    <span>Run ISR Stress</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-neutral-800 text-xs">
              <label className="text-zinc-500 block mb-1">Simulated Requests: {stressReqCount}</label>
              <input
                type="range"
                min="50"
                max="800"
                step="50"
                value={stressReqCount}
                onChange={(e) => setStressReqCount(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {isrStressData && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="text-xs text-zinc-500">Hit Rate %</div>
                <div className="text-3xl font-bold font-mono text-emerald-500 mt-1">
                  {isrStressData.hitRatePercent}%
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">{isrStressData.cacheHits} Cache Hits</p>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="text-xs text-zinc-500">Throughput (RPS)</div>
                <div className="text-3xl font-bold font-mono text-cyan-500 mt-1">
                  {isrStressData.rps} req/s
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">{isrStressData.totalDurationMs} ms duration</p>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="text-xs text-zinc-500">Revalidations Triggered</div>
                <div className="text-3xl font-bold font-mono text-amber-500 mt-1">
                  {isrStressData.revalidationsTriggered}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">{isrStressData.staleServed} Stale Served</p>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="text-xs text-zinc-500">Avg Read Latency</div>
                <div className="text-3xl font-bold font-mono text-purple-500 mt-1">
                  {isrStressData.averageLatencyMs} ms
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">In-Memory SWR</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

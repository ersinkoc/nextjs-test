import React, { useState, useEffect } from 'react';
import {
  Code2,
  Copy,
  Check,
  Terminal,
  Cpu,
  Key,
  FileCode,
  Sparkles,
  ArrowRightLeft,
  Braces,
  Hash,
  Shield,
  Layers,
  Settings,
  Palette,
  RotateCcw,
  Eye,
  CheckCircle2,
  Paintbrush
} from 'lucide-react';
import { useI18n } from '../i18n';
import { ConsoleMonitor } from './ConsoleMonitor';
import { SystemResources } from './SystemResources';

const COLOR_PRESETS = [
  { name: 'Emerald Next.js', color: '#10b981' },
  { name: 'NineDeploy Blue', color: '#2563eb' },
  { name: 'Cyber Cyan', color: '#06b6d4' },
  { name: 'Electric Violet', color: '#8b5cf6' },
  { name: 'Sunset Amber', color: '#f59e0b' },
  { name: 'Rose Crimson', color: '#f43f5e' },
  { name: 'Teal Turbo', color: '#14b8a6' },
  { name: 'Ruby Red', color: '#dc2626' },
];

export const DeveloperTools: React.FC = () => {
  const { t, language } = useI18n();

  // Custom Branding Color
  const [brandColor, setBrandColor] = useState<string>(() => {
    return localStorage.getItem('nextjs_arena_brand_color') || '#10b981';
  });

  const [uuid, setUuid] = useState<string>('e7b9a4c1-58d2-4e89-b76f-9988a101f3e2');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [base64Input, setBase64Input] = useState<string>('Hello Next.js 16.3 & Node 24 LTS!');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');

  const [caseInput, setCaseInput] = useState<string>('nextjs_instant_navigations_arena');

  const [jsonInput, setJsonInput] = useState<string>(
    '{"framework":"Next.js 16.3.3","node":"24 LTS (Krypton)","turbopack":{"persistentCaching":true},"reactCompiler":true,"features":["Instant Navigations","Partial Prefetching","Edge Streaming"]}'
  );
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Config Studio Tab
  const [activeConfigTab, setActiveConfigTab] = useState<'next-config' | 'middleware' | 'otel'>('next-config');

  const applyBrandColor = (color: string) => {
    setBrandColor(color);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
      document.documentElement.style.setProperty('--brand-primary', color);
      localStorage.setItem('nextjs_arena_brand_color', color);
    }
  };

  const handleResetBrandColor = () => {
    applyBrandColor('#10b981');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const generateUuid = () => {
    const newUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    setUuid(newUuid);
  };

  const getBase64Output = () => {
    try {
      if (base64Mode === 'encode') {
        return btoa(unescape(encodeURIComponent(base64Input)));
      } else {
        return decodeURIComponent(escape(atob(base64Input)));
      }
    } catch (e) {
      return language === 'tr' ? '[Geçersiz Base64 Girişi]' : '[Invalid Base64 Input]';
    }
  };

  const toCamelCase = (str: string) =>
    str.replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase());
  const toKebabCase = (str: string) =>
    str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
  const toSnakeCase = (str: string) =>
    str.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase();

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setFormattedJson(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const next16ConfigSnippet = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Persistent build caching for 90% memory drop
    persistentCaching: true,
  },
  experimental: {
    // Next.js 16.3 Rust React Compiler & Instant Navigations
    reactCompiler: true,
    instantNavigations: true,
    ppr: 'incremental',
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;`;

  const middlewareSnippet = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Edge security header injection & strict routing
  const response = NextResponse.next();
  response.headers.set('x-nextjs-arena-edge', 'v16.3');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};`;

  const otelSnippet = `// instrumentation.ts (Next.js 16.3 OpenTelemetry & Telemetry Guard)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('⚡ Node.js 24 LTS Runtime initialized with OpenTelemetry SDK');
  }
}`;

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            {t('tools.badge')}
          </span>
          <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
            Next.js 16.3 Dev Suite
          </span>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
          {t('tools.title')}
        </h2>
      </div>

      {/* Real-time System Resources & D3 Telemetry Widgets */}
      <SystemResources />

      {/* Custom Branding & CSS Variable Override Bento */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs transition-colors"
              style={{ backgroundColor: brandColor }}
            >
              <Palette size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  {t('tools.brandingTitle')}
                </h3>
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-colors"
                  style={{
                    backgroundColor: `${brandColor}18`,
                    color: brandColor,
                    borderColor: `${brandColor}40`,
                  }}
                >
                  --brand-primary: {brandColor}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-0.5">
                {t('tools.brandingDesc')}
              </p>
            </div>
          </div>

          <button
            id="reset-brand-color-btn"
            onClick={handleResetBrandColor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 text-xs font-mono font-semibold transition-all w-fit"
          >
            <RotateCcw size={13} />
            <span>{t('tools.resetDefault')}</span>
          </button>
        </div>

        {/* 2-Column Controls & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Color Picker, Hex Input & Presets (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Native Color Picker & Hex Input Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-3">
              <label className="text-xs font-mono font-semibold text-zinc-600 dark:text-neutral-400 flex items-center gap-1.5">
                <Paintbrush size={14} style={{ color: brandColor }} />
                <span>{t('tools.colorPickerLabel')}</span>
              </label>

              <div className="flex items-center gap-3">
                {/* HTML5 Color Input with Custom Styled Wrapper */}
                <div className="relative flex-shrink-0">
                  <input
                    type="color"
                    id="brand-color-picker"
                    value={brandColor}
                    onChange={(e) => applyBrandColor(e.target.value)}
                    className="w-12 h-12 rounded-2xl cursor-pointer border-2 border-white dark:border-neutral-800 shadow-md p-0 overflow-hidden bg-transparent"
                  />
                </div>

                {/* Hex Code Input with live sync */}
                <div className="flex-1 space-y-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400">
                      HEX
                    </span>
                    <input
                      type="text"
                      id="brand-hex-input"
                      value={brandColor}
                      onChange={(e) => applyBrandColor(e.target.value)}
                      placeholder="#10b981"
                      className="w-full pl-12 pr-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-700 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2"
                      style={{ outlineColor: brandColor }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Swatch Presets */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-2.5">
              <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-neutral-400 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                <span>{t('tools.presetsLabel')}</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = brandColor.toLowerCase() === preset.color.toLowerCase();
                  return (
                    <button
                      key={preset.color}
                      onClick={() => applyBrandColor(preset.color)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left font-mono text-[11px] font-semibold transition-all border ${
                        isSelected
                          ? 'bg-white dark:bg-neutral-900 shadow-xs ring-2'
                          : 'bg-white/60 dark:bg-neutral-900/60 hover:bg-white dark:hover:bg-neutral-900 border-zinc-200/60 dark:border-neutral-800'
                      }`}
                      style={{
                        borderColor: isSelected ? preset.color : undefined,
                        outlineColor: isSelected ? preset.color : undefined,
                      }}
                    >
                      <span
                        className="w-4 h-4 rounded-lg flex-shrink-0 shadow-2xs"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="truncate text-zinc-800 dark:text-neutral-200">
                        {preset.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live UI Component Showcase & CSS Code Box (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Live Component Preview Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-neutral-400 flex items-center gap-1.5">
                  <Eye size={14} className="text-indigo-500" />
                  <span>{t('tools.liveBrandPreview')}</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">CSS var(--brand-primary)</span>
              </div>

              {/* Dynamic Styled Sample Elements */}
              <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Brand Button */}
                  <button
                    className="px-4 py-2 rounded-xl text-white font-mono text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
                    style={{ backgroundColor: brandColor }}
                  >
                    <CheckCircle2 size={13} />
                    <span>{t('tools.brandButtonPreview')}</span>
                  </button>

                  {/* Brand Outline Badge */}
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 transition-colors"
                    style={{
                      borderColor: brandColor,
                      color: brandColor,
                      backgroundColor: `${brandColor}18`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: brandColor }} />
                    <span>{t('tools.brandBadgePreview')}</span>
                  </span>

                  {/* Secondary Tag */}
                  <span
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border"
                    style={{ backgroundColor: `${brandColor}25`, color: brandColor, borderColor: `${brandColor}50` }}
                  >
                    {t('tools.brandPill')}
                  </span>
                </div>

                {/* Progress Bar styled with brand color */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>Turbopack Engine Efficiency</span>
                    <span style={{ color: brandColor }} className="font-bold">98.4% Optimal</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: '98.4%', backgroundColor: brandColor }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generated CSS Variable Snippet */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                  <Code2 size={13} style={{ color: brandColor }} />
                  <span>{t('tools.cssVariableSnippet')}</span>
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `:root {\n  --brand-primary: ${brandColor};\n}\n\n@theme {\n  --color-brand: var(--brand-primary);\n}`,
                      'brand-css'
                    )
                  }
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition-colors"
                >
                  {copiedId === 'brand-css' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedId === 'brand-css' ? 'Copied' : t('tools.copy')}</span>
                </button>
              </div>

              <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto" style={{ color: brandColor }}>
                <code>{`:root {\n  --brand-primary: ${brandColor};\n}\n\n/* Tailwind CSS Theme Integration */\n@theme {\n  --color-brand: var(--brand-primary);\n}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Intercepted Console Monitor */}
      <ConsoleMonitor />

      {/* Config Studio Bento */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-emerald-500" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Next.js 16.3 Configuration Studio
            </h3>
          </div>

          <div className="flex items-center bg-zinc-100 dark:bg-neutral-800 p-0.5 rounded-xl border border-zinc-200 dark:border-neutral-700 text-xs font-mono font-bold">
            <button
              onClick={() => setActiveConfigTab('next-config')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeConfigTab === 'next-config'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-500 shadow-xs'
                  : 'text-zinc-500 dark:text-neutral-400'
              }`}
            >
              next.config.ts
            </button>
            <button
              onClick={() => setActiveConfigTab('middleware')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeConfigTab === 'middleware'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-500 shadow-xs'
                  : 'text-zinc-500 dark:text-neutral-400'
              }`}
            >
              middleware.ts
            </button>
            <button
              onClick={() => setActiveConfigTab('otel')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeConfigTab === 'otel'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-500 shadow-xs'
                  : 'text-zinc-500 dark:text-neutral-400'
              }`}
            >
              instrumentation.ts
            </button>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() =>
              copyToClipboard(
                activeConfigTab === 'next-config'
                  ? next16ConfigSnippet
                  : activeConfigTab === 'middleware'
                  ? middlewareSnippet
                  : otelSnippet,
                'config-code'
              )
            }
            className="absolute right-4 top-4 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 hover:text-white text-xs font-mono border border-zinc-700 transition-colors"
          >
            {copiedId === 'config-code' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copiedId === 'config-code' ? 'Copied' : t('tools.copy')}</span>
          </button>
          <pre className="p-4 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
            <code>
              {activeConfigTab === 'next-config'
                ? next16ConfigSnippet
                : activeConfigTab === 'middleware'
                ? middlewareSnippet
                : otelSnippet}
            </code>
          </pre>
        </div>
      </div>

      {/* 4 Utility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* UUID Generator */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-sky-500" />
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                {t('tools.uuidTitle')}
              </h4>
            </div>
            <button
              id="generate-uuid-btn"
              onClick={generateUuid}
              className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-xs font-mono font-semibold transition-all"
            >
              {t('tools.generateNew')}
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 flex items-center justify-between font-mono text-xs text-zinc-800 dark:text-neutral-200">
            <span className="truncate pr-2">{uuid}</span>
            <button
              onClick={() => copyToClipboard(uuid, 'uuid')}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-neutral-200 p-1"
            >
              {copiedId === 'uuid' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono">{t('tools.uuidSub')}</p>
        </div>

        {/* Base64 Converter */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash size={16} className="text-teal-500" />
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                {t('tools.base64Title')}
              </h4>
            </div>
            <button
              onClick={() => setBase64Mode((m) => (m === 'encode' ? 'decode' : 'encode'))}
              className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-xs font-mono font-semibold transition-all"
            >
              {base64Mode === 'encode' ? 'Mode: Encode' : 'Mode: Decode'}
            </button>
          </div>

          <input
            type="text"
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder={t('tools.base64Placeholder')}
            className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 flex items-center justify-between font-mono text-xs text-zinc-800 dark:text-neutral-200">
            <span className="truncate pr-2">{getBase64Output()}</span>
            <button
              onClick={() => copyToClipboard(getBase64Output(), 'base64')}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-neutral-200 p-1"
            >
              {copiedId === 'base64' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Text Case Converter */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={16} className="text-amber-500" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
              {t('tools.caseTitle')}
            </h4>
          </div>

          <input
            type="text"
            value={caseInput}
            onChange={(e) => setCaseInput(e.target.value)}
            placeholder={t('tools.casePlaceholder')}
            className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <div className="space-y-1.5 font-mono text-xs">
            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 flex justify-between">
              <span className="text-zinc-400">camelCase:</span>
              <span className="text-zinc-900 dark:text-white font-bold">{toCamelCase(caseInput)}</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 flex justify-between">
              <span className="text-zinc-400">kebab-case:</span>
              <span className="text-zinc-900 dark:text-white font-bold">{toKebabCase(caseInput)}</span>
            </div>
          </div>
        </div>

        {/* JSON Validator & Formatter */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Braces size={16} className="text-indigo-500" />
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                {t('tools.jsonTitle')}
              </h4>
            </div>
            <button
              onClick={handleFormatJson}
              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all"
            >
              {t('tools.jsonFormat')}
            </button>
          </div>

          <textarea
            rows={3}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          {jsonError && (
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[11px] font-mono">
              Error: {jsonError}
            </div>
          )}

          {formattedJson && (
            <pre className="p-3 rounded-xl bg-zinc-950 text-emerald-400 font-mono text-[11px] max-h-32 overflow-y-auto scrollbar-thin">
              <code>{formattedJson}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

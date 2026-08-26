import React, { useState } from 'react';
import {
  Share2,
  Image,
  Globe,
  Twitter,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Code2,
  Layout,
  Layers,
  Palette,
  FileCode,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion } from 'motion/react';

type SocialPlatform = 'twitter' | 'google' | 'discord' | 'facebook';
type ColorTheme = 'emerald' | 'indigo' | 'dark' | 'sunset' | 'cyberpunk';

export const OgMetadataStudio: React.FC = () => {
  const { t, language } = useI18n();

  const [title, setTitle] = useState<string>(
    language === 'tr'
      ? 'Next.js 16.3 Hardcore Test Arenası & Rust Turbopack'
      : 'Next.js 16.3 Hardcore Test Arena & Rust Turbopack'
  );
  const [description, setDescription] = useState<string>(
    language === 'tr'
      ? 'Partial Prerendering (PPR), Server Actions Mutex, Rust React Compiler AST ve 50.000 RPS stres test laboratuvarı.'
      : 'Partial Prerendering (PPR), Server Actions Mutex, Rust React Compiler AST, and 50,000 RPS concurrency stress testing.'
  );
  const [tag, setTag] = useState<string>('Performance & Architecture');
  const [author, setAuthor] = useState<string>('Next.js Core Team');
  const [theme, setTheme] = useState<ColorTheme>('emerald');
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('twitter');
  const [copied, setCopied] = useState<string | null>(null);

  const getThemeStyles = () => {
    switch (theme) {
      case 'indigo':
        return {
          bg: 'from-slate-950 via-indigo-950 to-neutral-950',
          accent: 'from-indigo-400 to-sky-300',
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          border: 'border-indigo-500/30',
        };
      case 'sunset':
        return {
          bg: 'from-neutral-950 via-rose-950 to-amber-950',
          accent: 'from-amber-400 to-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          border: 'border-rose-500/30',
        };
      case 'cyberpunk':
        return {
          bg: 'from-zinc-950 via-purple-950 to-cyan-950',
          accent: 'from-cyan-400 to-purple-400',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          border: 'border-cyan-500/30',
        };
      case 'dark':
        return {
          bg: 'from-zinc-950 via-zinc-900 to-black',
          accent: 'from-zinc-100 to-zinc-400',
          badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          border: 'border-zinc-800',
        };
      case 'emerald':
      default:
        return {
          bg: 'from-neutral-950 via-zinc-900 to-emerald-950',
          accent: 'from-emerald-400 to-teal-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          border: 'border-emerald-500/30',
        };
    }
  };

  const currentTheme = getThemeStyles();

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const metadataSnippet = `// app/blog/[slug]/page.tsx (Next.js 16.3)
import type { Metadata, ResolvingMetadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: '${title}',
    description: '${description}',
    openGraph: {
      title: '${title}',
      description: '${description}',
      url: \`https://arena.nextjs.org/\${slug}\`,
      siteName: 'Next.js 16 Arena',
      images: [
        {
          url: \`/api/og?title=\${encodeURIComponent('${title}')}\`,
          width: 1200,
          height: 630,
          alt: '${title}',
        },
      ],
      type: 'article',
      publishedTime: new Date().toISOString(),
      authors: ['${author}'],
    },
    twitter: {
      card: 'summary_large_image',
      title: '${title}',
      description: '${description}',
      creator: '@nextjs',
      images: [\`/api/og?title=\${encodeURIComponent('${title}')}\`],
    },
  };
}`;

  const ogRouteSnippet = `// app/api/og/route.tsx (Next.js 16 ImageResponse)
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '${title}';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: '#09090b',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>Next.js 16.3</span>
          <span style={{ fontSize: 16, color: '#71717a' }}>•</span>
          <span style={{ fontSize: 16, color: '#a1a1aa' }}>${tag}</span>
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          {title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 20, color: '#71717a' }}>${author}</span>
          <span style={{ fontSize: 18, color: '#10b981', fontWeight: 600 }}>arena.nextjs.org</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}`;

  const jsonLdSnippet = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: title,
      description: description,
      author: {
        '@type': 'Organization',
        name: author,
        url: 'https://arena.nextjs.org',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Next.js 16 Arena',
        logo: {
          '@type': 'ImageObject',
          url: 'https://arena.nextjs.org/icon.png',
        },
      },
      inLanguage: language === 'tr' ? 'tr-TR' : 'en-US',
      datePublished: new Date().toISOString(),
    },
    null,
    2
  );

  return (
    <div className="space-y-6">
      {/* Header Bento Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {t('og.badge')}
          </span>
          <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
            Next.js 16 generateMetadata & @vercel/og ImageResponse
          </span>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
          {t('og.title')}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1 max-w-2xl">
          {t('og.desc')}
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls & Code Generators (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Metadata Parameters Form */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                {t('og.customizer')}
              </h3>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-zinc-600 dark:text-neutral-400">
                {t('og.cardTitle')}:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-zinc-600 dark:text-neutral-400">
                {t('og.cardDesc')}:
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Tag & Author Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-zinc-600 dark:text-neutral-400">
                  {t('og.cardTag')}:
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-zinc-600 dark:text-neutral-400">
                  {t('og.cardAuthor')}:
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-zinc-600 dark:text-neutral-400 flex items-center gap-1.5">
                <Palette size={13} />
                {t('og.themePreset')}:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['emerald', 'indigo', 'sunset', 'cyberpunk', 'dark'] as ColorTheme[]).map((thm) => (
                  <button
                    key={thm}
                    onClick={() => setTheme(thm)}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-mono font-bold capitalize transition-all ${
                      theme === thm
                        ? 'bg-zinc-900 text-white dark:bg-neutral-700 dark:text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {thm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Code Tabs */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode size={16} className="text-emerald-500" />
                <h4 className="font-bold text-xs font-mono uppercase text-zinc-800 dark:text-neutral-200">
                  generateMetadata Code
                </h4>
              </div>
              <button
                onClick={() => handleCopy('meta', metadataSnippet)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 text-xs font-mono font-bold hover:bg-zinc-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {copied === 'meta' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied === 'meta' ? t('cache.copied') : t('tools.copy')}</span>
              </button>
            </div>

            <pre className="p-3 rounded-2xl bg-zinc-950 text-indigo-300 font-mono text-[10px] overflow-x-auto leading-relaxed border border-zinc-800 scrollbar-thin">
              <code>{metadataSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Live Visual Social Card & Platform Previews (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Visual Card Canvas (1200x630 Ratio) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image size={18} className="text-indigo-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  {t('og.liveCanvas')} (1200 × 630px)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                ImageResponse (Edge)
              </span>
            </div>

            {/* The 1200x630 Card Canvas */}
            <div
              className={`w-full aspect-[1200/630] rounded-2xl bg-gradient-to-br ${currentTheme.bg} p-6 sm:p-8 flex flex-col justify-between border ${currentTheme.border} shadow-lg relative overflow-hidden select-none`}
            >
              {/* Decorative Glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center font-mono font-bold text-xs">
                    N16
                  </div>
                  <span className="font-mono font-bold text-xs text-white tracking-wider">
                    Next.js 16.3
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${currentTheme.badge}`}
                >
                  {tag}
                </span>
              </div>

              {/* Card Body */}
              <div className="space-y-2 relative z-10 my-auto">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  {title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 relative z-10 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{author}</span>
                </div>
                <span className="text-zinc-500 font-semibold">arena.nextjs.org</span>
              </div>
            </div>
          </div>

          {/* Social Platform Simulator Selector & Preview */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-neutral-800 pb-3">
              <span className="text-xs font-mono font-bold text-zinc-400 mr-2">
                {t('og.platformSim')}:
              </span>
              <button
                onClick={() => setSelectedPlatform('twitter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedPlatform === 'twitter'
                    ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Twitter size={13} />
                <span>Twitter / X</span>
              </button>
              <button
                onClick={() => setSelectedPlatform('google')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedPlatform === 'google'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Search size={13} />
                <span>Google Search</span>
              </button>
              <button
                onClick={() => setSelectedPlatform('discord')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedPlatform === 'discord'
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-neutral-800'
                }`}
              >
                <MessageSquare size={13} />
                <span>Discord Embed</span>
              </button>
            </div>

            {/* Platform Preview Outputs */}
            {selectedPlatform === 'twitter' && (
              <div className="p-3.5 rounded-2xl bg-zinc-950 text-white space-y-2 border border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <span className="font-bold text-white">Next.js</span>
                  <span>@nextjs • Just now</span>
                </div>
                <div className="rounded-xl border border-zinc-800 overflow-hidden bg-neutral-900">
                  <div className={`p-4 bg-gradient-to-br ${currentTheme.bg}`}>
                    <h4 className="text-sm font-bold text-white">{title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-1">{description}</p>
                  </div>
                  <div className="p-2.5 bg-black text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                    <span>arena.nextjs.org</span>
                    <span className="text-zinc-500">Summary Card</span>
                  </div>
                </div>
              </div>
            )}

            {selectedPlatform === 'google' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 space-y-1 font-sans">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-neutral-400">
                  <span>https://arena.nextjs.org</span>
                  <span>›</span>
                  <span>architecture</span>
                </div>
                <h4 className="text-base text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium leading-snug">
                  {title}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {selectedPlatform === 'discord' && (
              <div className="p-4 rounded-2xl bg-[#2b2d31] text-white space-y-2 border-l-4 border-emerald-500 font-sans">
                <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                  Next.js 16 Arena
                </div>
                <h4 className="text-sm font-bold text-[#00a8fc] hover:underline cursor-pointer">
                  {title}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">{description}</p>
                <div className="text-[10px] text-zinc-400 font-mono pt-1">
                  Author: {author} • 1200x630 Image Response
                </div>
              </div>
            )}

            {/* JSON-LD Structured Data */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-zinc-500 dark:text-neutral-400">
                  Schema.org JSON-LD Structured Data
                </span>
                <button
                  onClick={() => handleCopy('jsonld', jsonLdSnippet)}
                  className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  {copied === 'jsonld' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copied === 'jsonld' ? t('cache.copied') : t('tools.copy')}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-zinc-950 text-amber-300 font-mono text-[10px] overflow-x-auto leading-relaxed border border-zinc-800 scrollbar-thin max-h-32">
                <code>{jsonLdSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

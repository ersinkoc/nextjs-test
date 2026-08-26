import React, { useState } from 'react';
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
  Hash
} from 'lucide-react';
import { useI18n } from '../i18n';

export const DeveloperTools: React.FC = () => {
  const { t, language } = useI18n();

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
    // Persistent build caching for ultra-fast builds
    persistentCaching: true,
  },
  experimental: {
    // Next.js 16.3 Rust React Compiler & Instant Navigations
    reactCompiler: true,
    instantNavigations: true,
    ppr: true,
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
};

export default nextConfig;`;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-neutral-800 shadow-sm">
        <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <Terminal className="w-3.5 h-3.5 text-emerald-500" />
          {t('tools.badge')}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
          {t('tools.title')}
        </h2>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. UUID Generator */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-500" />
                {t('tools.uuidTitle')}
              </span>
              <button
                onClick={generateUuid}
                className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> {t('tools.generateNew')}
              </button>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-neutral-950 rounded-2xl border border-zinc-200 dark:border-neutral-800 flex items-center justify-between gap-2 font-mono text-xs text-zinc-900 dark:text-white">
              <span className="truncate">{uuid}</span>
              <button
                onClick={() => copyToClipboard(uuid, 'uuid')}
                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-neutral-800 rounded-lg text-zinc-500 transition-colors cursor-pointer"
              >
                {copiedId === 'uuid' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <p className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500 mt-4">
            {t('tools.uuidSub')}
          </p>
        </div>

        {/* 2. Base64 Converter */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-500" />
                {t('tools.base64Title')}
              </span>
              <div className="flex bg-zinc-100 dark:bg-neutral-800 rounded-lg p-0.5 text-[10px] font-mono">
                <button
                  onClick={() => setBase64Mode('encode')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer ${
                    base64Mode === 'encode'
                      ? 'bg-white dark:bg-neutral-700 font-bold text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 dark:text-neutral-400'
                  }`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setBase64Mode('decode')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer ${
                    base64Mode === 'decode'
                      ? 'bg-white dark:bg-neutral-700 font-bold text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 dark:text-neutral-400'
                  }`}
                >
                  Decode
                </button>
              </div>
            </div>

            <input
              type="text"
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              placeholder={t('tools.base64Placeholder')}
              className="w-full mb-2 px-3 py-2 text-xs bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-neutral-500 focus:outline-none"
            />

            <div className="p-2.5 bg-zinc-50 dark:bg-neutral-950 rounded-xl border border-zinc-200 dark:border-neutral-800 flex items-center justify-between gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400 truncate">
              <span className="truncate">{getBase64Output()}</span>
              <button
                onClick={() => copyToClipboard(getBase64Output(), 'base64')}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-neutral-800 rounded text-zinc-500 cursor-pointer"
              >
                {copiedId === 'base64' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <p className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500 mt-4">
            {t('tools.base64Sub')}
          </p>
        </div>

        {/* 3. Text Case Formatter */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Hash className="w-3.5 h-3.5 text-purple-500" />
              {t('tools.caseTitle')}
            </span>

            <input
              type="text"
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
              placeholder={t('tools.casePlaceholder')}
              className="w-full mb-2 px-3 py-2 text-xs bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-neutral-500 focus:outline-none"
            />

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-neutral-950 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-neutral-800">
                <span className="text-zinc-400">camelCase:</span>
                <span className="text-emerald-500 font-bold">{toCamelCase(caseInput)}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-neutral-950 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-neutral-800">
                <span className="text-zinc-400">kebab-case:</span>
                <span className="text-cyan-400 font-bold">{toKebabCase(caseInput)}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-neutral-950 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-neutral-800">
                <span className="text-zinc-400">snake_case:</span>
                <span className="text-amber-400 font-bold">{toSnakeCase(caseInput)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Large JSON Formatter Bento (2 cols) */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-zinc-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Braces className="w-3.5 h-3.5 text-emerald-500" />
              {t('tools.jsonTitle')}
            </span>
            <button
              onClick={handleFormatJson}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-full font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              <Sparkles className="w-3 h-3" />
              <span>{t('tools.jsonFormat')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <textarea
              rows={5}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 rounded-2xl text-zinc-900 dark:text-white focus:outline-none resize-none"
            />
            <div className="relative p-3 font-mono text-xs bg-neutral-950 border border-neutral-800 rounded-2xl text-emerald-400 overflow-y-auto max-h-[140px]">
              {jsonError ? (
                <span className="text-rose-400">{jsonError}</span>
              ) : formattedJson ? (
                <pre>{formattedJson}</pre>
              ) : (
                <span className="text-neutral-600">{t('tools.jsonSub')}</span>
              )}
            </div>
          </div>
        </div>

        {/* 5. Next.js 16.3 Config Generator */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-zinc-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                {t('tools.nextConfigTitle')}
              </span>
              <button
                onClick={() => copyToClipboard(next16ConfigSnippet, 'config')}
                className="text-[11px] font-mono text-zinc-500 dark:text-neutral-400 hover:text-emerald-500 flex items-center gap-1 cursor-pointer"
              >
                {copiedId === 'config' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{t('tools.copy')}</span>
              </button>
            </div>

            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
              <pre>{next16ConfigSnippet}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

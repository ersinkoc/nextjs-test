import React, { useState } from 'react';
import { Wrench, Copy, Check, Sparkles, Hash, Code, RefreshCw } from 'lucide-react';

export const DeveloperTools: React.FC = () => {
  // UUID generator
  const [uuid, setUuid] = useState<string>('c9bf9e57-1685-4c89-bafb-ff5af830be8a');
  const [copiedUuid, setCopiedUuid] = useState(false);

  // Text Case Converter
  const [inputText, setInputText] = useState('deneme projesi ornegi');

  // JSON Formatter
  const [rawJson, setRawJson] = useState('{"status":"success","framework":"NextJS","version":15,"experimental":{"turbopack":true,"bentoGrid":true}}');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [formattedJson, setFormattedJson] = useState('');

  // Generate UUID
  const handleGenerateUuid = () => {
    const newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    setUuid(newId);
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert cases
  const toCamel = (str: string) =>
    str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  const toKebab = (str: string) =>
    str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  const toSnake = (str: string) =>
    str.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const toPascal = (str: string) => {
    const camel = toCamel(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  };

  // Format JSON
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setFormattedJson(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || 'Geçersiz JSON');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-neutral-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Wrench className="w-3.5 h-3.5 text-emerald-500" />
            Developer Utilities Bento
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
            Geliştirici Araçları & Sandbox Testleri
          </h3>
        </div>

        <span className="text-[10px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
          Bento Kit
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. UUID & Token Generator Bento Card */}
        <div className="bg-zinc-50 dark:bg-neutral-950 p-5 rounded-3xl border border-zinc-200 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-emerald-500" />
                UUID / Token Üretici
              </span>
              <button
                onClick={handleGenerateUuid}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <RefreshCw className="w-3 h-3" /> Yeni Üret
              </button>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-neutral-800 flex items-center justify-between gap-2 mt-3 font-mono text-xs text-zinc-900 dark:text-white select-all">
              <span className="truncate">{uuid}</span>
              <button
                onClick={() => copyToClipboard(uuid, setCopiedUuid)}
                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-neutral-800 flex-shrink-0"
                title="Kopyala"
              >
                {copiedUuid ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <p className="text-[10px] font-mono text-zinc-400 dark:text-neutral-500 mt-3">
            RFC 4122 standardında v4 rastgele benzersiz ID
          </p>
        </div>

        {/* 2. Text Case Converter Bento Card */}
        <div className="bg-zinc-50 dark:bg-neutral-950 p-5 rounded-3xl border border-zinc-200 dark:border-neutral-800">
          <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Metin Dönüştürücü
          </span>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Bir metin girin..."
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 mb-3"
          />

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-zinc-200 dark:border-neutral-800">
              <span className="text-[10px] text-zinc-400 dark:text-neutral-500 block mb-0.5 font-bold">camelCase:</span>
              <span className="text-zinc-800 dark:text-neutral-200 font-bold truncate block">
                {toCamel(inputText) || '-'}
              </span>
            </div>
            <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-zinc-200 dark:border-neutral-800">
              <span className="text-[10px] text-zinc-400 dark:text-neutral-500 block mb-0.5 font-bold">kebab-case:</span>
              <span className="text-zinc-800 dark:text-neutral-200 font-bold truncate block">
                {toKebab(inputText) || '-'}
              </span>
            </div>
            <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-zinc-200 dark:border-neutral-800">
              <span className="text-[10px] text-zinc-400 dark:text-neutral-500 block mb-0.5 font-bold">PascalCase:</span>
              <span className="text-zinc-800 dark:text-neutral-200 font-bold truncate block">
                {toPascal(inputText) || '-'}
              </span>
            </div>
            <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-zinc-200 dark:border-neutral-800">
              <span className="text-[10px] text-zinc-400 dark:text-neutral-500 block mb-0.5 font-bold">snake_case:</span>
              <span className="text-zinc-800 dark:text-neutral-200 font-bold truncate block">
                {toSnake(inputText) || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. JSON Formatter Bento Card */}
        <div className="md:col-span-2 bg-zinc-50 dark:bg-neutral-950 p-5 rounded-3xl border border-zinc-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-emerald-500" />
              JSON Biçimlendirici & Doğrulayıcı
            </span>
            <button
              onClick={handleFormatJson}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold rounded-full transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              Doğrula & Formatla
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <textarea
              rows={4}
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              placeholder="JSON metni yapıştırın..."
              className="w-full p-3 text-xs font-mono bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
            />

            <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-xs font-mono text-emerald-400 overflow-y-auto max-h-[120px] shadow-inner">
              {jsonError ? (
                <span className="text-rose-400">{jsonError}</span>
              ) : formattedJson ? (
                <pre>{formattedJson}</pre>
              ) : (
                <span className="text-neutral-500">// Formatlanmış JSON burada görüntülenecektir</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

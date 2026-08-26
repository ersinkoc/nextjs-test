import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  Eye,
  Check,
  Copy,
  RotateCcw,
  Sun,
  Moon,
  Sliders,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Code2,
  Terminal,
  Zap,
  Activity,
  Flame,
  Waves,
  Trees,
  Cpu,
  Compass,
  Heart,
  Shield,
  Shuffle
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

export interface ThemePalette {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  primary: string;
  secondary: string;
  accent: string;
  surfaceLight: string;
  surfaceDark: string;
  description: string;
  swatches: string[];
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'ocean',
    name: 'Ocean Azure',
    category: 'Cool & Coastal',
    icon: Waves,
    primary: '#0284c7',
    secondary: '#06b6d4',
    accent: '#38bdf8',
    surfaceLight: '#f0f9ff',
    surfaceDark: '#082f49',
    description: 'Deep cobalt and coastal azure inspired by sea waters and clean sky.',
    swatches: ['#0284c7', '#0ea5e9', '#06b6d4', '#38bdf8', '#7dd3fc'],
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    category: 'Warm & Vibrant',
    icon: Flame,
    primary: '#f97316',
    secondary: '#e11d48',
    accent: '#f59e0b',
    surfaceLight: '#fff7ed',
    surfaceDark: '#431407',
    description: 'Energetic coral, tangerine flame, and golden amber sunset tones.',
    swatches: ['#f97316', '#ea580c', '#e11d48', '#f59e0b', '#fbbf24'],
  },
  {
    id: 'forest',
    name: 'Evergreen Forest',
    category: 'Nature & Organic',
    icon: Trees,
    primary: '#10b981',
    secondary: '#059669',
    accent: '#84cc16',
    surfaceLight: '#f0fdf4',
    surfaceDark: '#022c22',
    description: 'Lush emerald, mint pine, and natural foliage accents (Default Arena Theme).',
    swatches: ['#10b981', '#059669', '#0d9488', '#84cc16', '#a3e635'],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'Electric & Futuristic',
    icon: Zap,
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#a855f7',
    surfaceLight: '#faf5ff',
    surfaceDark: '#2e1065',
    description: 'High-voltage electric violet, ultraviolet, and luminous neon pink.',
    swatches: ['#8b5cf6', '#7c3aed', '#ec4899', '#db2777', '#c084fc'],
  },
  {
    id: 'aurora',
    name: 'Nordic Aurora',
    category: 'Arctic & Fresh',
    icon: Compass,
    primary: '#0d9488',
    secondary: '#0284c7',
    accent: '#10b981',
    surfaceLight: '#f0fdfa',
    surfaceDark: '#042f2e',
    description: 'Polar teal, fjord blue, and emerald aurora borealis waves.',
    swatches: ['#0d9488', '#14b8a6', '#0284c7', '#10b981', '#2dd4bf'],
  },
  {
    id: 'ruby',
    name: 'Ruby Crimson',
    category: 'Bold & Premium',
    icon: Heart,
    primary: '#e11d48',
    secondary: '#9f1239',
    accent: '#fb7185',
    surfaceLight: '#fff1f2',
    surfaceDark: '#4c0519',
    description: 'Passionate velvet crimson, rosewood, and glowing ruby highlights.',
    swatches: ['#e11d48', '#be123c', '#9f1239', '#fb7185', '#fda4af'],
  },
  {
    id: 'midnight',
    name: 'Midnight Slate',
    category: 'Minimal & Monochrome',
    icon: Shield,
    primary: '#475569',
    secondary: '#334155',
    accent: '#64748b',
    surfaceLight: '#f8fafc',
    surfaceDark: '#0f172a',
    description: 'Understated titanium, graphite slate, and monochrome precision.',
    swatches: ['#475569', '#334155', '#64748b', '#94a3b8', '#cbd5e1'],
  },
  {
    id: 'solar',
    name: 'Solar Flare',
    category: 'Radiant & Golden',
    icon: Activity,
    primary: '#d97706',
    secondary: '#b45309',
    accent: '#f59e0b',
    surfaceLight: '#fffbeb',
    surfaceDark: '#451a03',
    description: 'Warm gold, amber honey, and bright sunburst radiant highlights.',
    swatches: ['#d97706', '#b45309', '#f59e0b', '#fbbf24', '#fde047'],
  },
];

interface ThemePreviewProps {
  onPaletteChange?: (palette: ThemePalette) => void;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ onPaletteChange }) => {
  const { t } = useI18n();

  // Active Selected Palette
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(() => {
    return localStorage.getItem('nextjs_arena_active_palette') || 'forest';
  });

  // Color values (allowing live customization/tuning)
  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    return localStorage.getItem('nextjs_arena_brand_color') || '#10b981';
  });
  const [secondaryColor, setSecondaryColor] = useState<string>(() => {
    return localStorage.getItem('nextjs_arena_brand_secondary') || '#059669';
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('nextjs_arena_brand_accent') || '#84cc16';
  });

  // Showcase simulation mode (local preview light/dark toggle)
  const [simulatedDarkMode, setSimulatedDarkMode] = useState<boolean>(true);
  const [interactiveSwitch, setInteractiveSwitch] = useState<boolean>(true);
  const [interactiveTab, setInteractiveTab] = useState<'analytics' | 'servers' | 'logs'>('analytics');
  const [interactiveInput, setInteractiveInput] = useState<string>('Next.js 16.3 Turbopack');
  const [exportFormat, setExportFormat] = useState<'tailwind' | 'css' | 'json'>('tailwind');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(true);

  // Apply colors to document root
  const applyColors = (p: string, s: string, a: string, paletteId?: string) => {
    setPrimaryColor(p);
    setSecondaryColor(s);
    setAccentColor(a);

    document.documentElement.style.setProperty('--brand-primary', p);
    document.documentElement.style.setProperty('--brand-secondary', s);
    document.documentElement.style.setProperty('--brand-accent', a);

    localStorage.setItem('nextjs_arena_brand_color', p);
    localStorage.setItem('nextjs_arena_brand_secondary', s);
    localStorage.setItem('nextjs_arena_brand_accent', a);

    if (paletteId) {
      setSelectedPaletteId(paletteId);
      localStorage.setItem('nextjs_arena_active_palette', paletteId);
      const found = THEME_PALETTES.find((pal) => pal.id === paletteId);
      if (found && onPaletteChange) {
        onPaletteChange(found);
      }
    }
  };

  // Select a preset palette
  const handleSelectPalette = (palette: ThemePalette) => {
    applyColors(palette.primary, palette.secondary, palette.accent, palette.id);
  };

  // Reset to default Forest theme
  const handleResetDefault = () => {
    const forest = THEME_PALETTES.find((p) => p.id === 'forest') || THEME_PALETTES[2];
    handleSelectPalette(forest);
  };

  // Random Palette Picker
  const handlePickRandom = () => {
    const remaining = THEME_PALETTES.filter((p) => p.id !== selectedPaletteId);
    const randomPal = remaining[Math.floor(Math.random() * remaining.length)] || THEME_PALETTES[0];
    handleSelectPalette(randomPal);
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Export Code Snippets
  const getTailwindSnippet = () => {
    return `/* Tailwind CSS v4 Theme Configuration */
@theme {
  --color-brand: var(--brand-primary);
  --color-brand-secondary: var(--brand-secondary);
  --color-brand-accent: var(--brand-accent);
}

:root {
  --brand-primary: ${primaryColor};
  --brand-secondary: ${secondaryColor};
  --brand-accent: ${accentColor};
}`;
  };

  const getCssVariablesSnippet = () => {
    return `:root {
  --brand-primary: ${primaryColor};
  --brand-secondary: ${secondaryColor};
  --brand-accent: ${accentColor};
  --brand-rgb: ${hexToRgb(primaryColor)};
}

[data-theme='dark'] {
  --brand-primary: ${primaryColor};
  --brand-secondary: ${secondaryColor};
  --brand-accent: ${accentColor};
}`;
  };

  const getJsonSnippet = () => {
    const current = THEME_PALETTES.find((p) => p.id === selectedPaletteId);
    return JSON.stringify(
      {
        name: current ? current.name : 'Custom Palette',
        id: selectedPaletteId,
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor,
        },
        mode: simulatedDarkMode ? 'dark' : 'light',
      },
      null,
      2
    );
  };

  function hexToRgb(hex: string) {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return isNaN(r) ? '16, 185, 129' : `${r}, ${g}, ${b}`;
  }

  const activePalette = THEME_PALETTES.find((p) => p.id === selectedPaletteId) || THEME_PALETTES[0];

  return (
    <div className="space-y-6" id="theme-preview-studio">
      {/* Header Bento */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <Palette size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {t('themePreview.title')}
              </h3>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border transition-colors"
                style={{
                  backgroundColor: `${primaryColor}18`,
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                }}
              >
                {activePalette.name}
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
              {t('themePreview.desc')}
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="theme-pick-random-btn"
              onClick={handlePickRandom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 text-xs font-mono font-semibold transition-all cursor-pointer"
              title="Pick a random curated theme palette"
            >
              <Shuffle size={13} />
              <span>{t('themePreview.randomTheme')}</span>
            </button>

            <button
              id="theme-reset-default-btn"
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 text-xs font-mono font-semibold transition-all cursor-pointer"
              title="Reset to default Evergreen Forest theme"
            >
              <RotateCcw size={13} />
              <span>{t('themePreview.resetDefault')}</span>
            </button>
          </div>
        </div>

        {/* Curated Color Palettes Carousel Grid */}
        <div className="pt-3 border-t border-zinc-100 dark:border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Sparkles size={14} style={{ color: primaryColor }} />
              <span>{t('themePreview.palettesTitle')} ({THEME_PALETTES.length})</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              Click any card to toggle live palette
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {THEME_PALETTES.map((palette) => {
              const isSelected = selectedPaletteId === palette.id;
              const IconComponent = palette.icon;

              return (
                <motion.button
                  key={palette.id}
                  id={`theme-palette-${palette.id}`}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleSelectPalette(palette)}
                  className={`p-3.5 rounded-2xl text-left transition-all border relative flex flex-col justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-neutral-900 shadow-md ring-2'
                      : 'bg-zinc-50/70 dark:bg-neutral-950/70 hover:bg-white dark:hover:bg-neutral-900 border-zinc-200/80 dark:border-neutral-800/80'
                  }`}
                  style={{
                    borderColor: isSelected ? palette.primary : undefined,
                    outlineColor: isSelected ? palette.primary : undefined,
                  }}
                >
                  {/* Selected Active Check Badge */}
                  {isSelected && (
                    <div
                      className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: palette.primary }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}

                  {/* Top: Icon + Name */}
                  <div className="flex items-start gap-2.5 pr-6">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: palette.primary }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                        {palette.name}
                      </h4>
                      <p className="text-[10px] font-mono text-zinc-500 dark:text-neutral-400 truncate">
                        {palette.category}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Swatches Bar */}
                  <div className="flex items-center gap-1.5">
                    {palette.swatches.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex-1 h-3.5 rounded-md shadow-2xs transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  {/* Bottom: Hex label */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>{palette.primary}</span>
                    <span className="font-semibold" style={{ color: palette.primary }}>
                      {isSelected ? 'Active' : 'Preview ➔'}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Custom Fine-Tuning (Left) & Interactive Showcase + Export (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Color Tuning Controls (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Custom Color Tuning Bento */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-300 flex items-center gap-1.5">
                <SlidersHorizontal size={14} style={{ color: primaryColor }} />
                <span>{t('themePreview.customTuning')}</span>
              </span>
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                Live Sync
              </span>
            </div>

            {/* Primary Color Picker */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-zinc-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span>{t('themePreview.primary')}</span>
                </span>
                <span className="text-[11px] text-zinc-400">--brand-primary</span>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => applyColors(e.target.value, secondaryColor, accentColor)}
                  className="w-9 h-9 rounded-xl cursor-pointer border border-zinc-300 dark:border-neutral-700 p-0 bg-transparent overflow-hidden"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => applyColors(e.target.value, secondaryColor, accentColor)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 text-xs font-mono font-bold text-zinc-900 dark:text-white uppercase focus:outline-none focus:ring-1"
                  style={{ outlineColor: primaryColor }}
                />
              </div>
            </div>

            {/* Secondary Color Picker */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-zinc-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
                  <span>{t('themePreview.secondary')}</span>
                </span>
                <span className="text-[11px] text-zinc-400">--brand-secondary</span>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => applyColors(primaryColor, e.target.value, accentColor)}
                  className="w-9 h-9 rounded-xl cursor-pointer border border-zinc-300 dark:border-neutral-700 p-0 bg-transparent overflow-hidden"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => applyColors(primaryColor, e.target.value, accentColor)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 text-xs font-mono font-bold text-zinc-900 dark:text-white uppercase focus:outline-none focus:ring-1"
                  style={{ outlineColor: secondaryColor }}
                />
              </div>
            </div>

            {/* Accent Color Picker */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-zinc-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span>{t('themePreview.accent')}</span>
                </span>
                <span className="text-[11px] text-zinc-400">--brand-accent</span>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => applyColors(primaryColor, secondaryColor, e.target.value)}
                  className="w-9 h-9 rounded-xl cursor-pointer border border-zinc-300 dark:border-neutral-700 p-0 bg-transparent overflow-hidden"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => applyColors(primaryColor, secondaryColor, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 text-xs font-mono font-bold text-zinc-900 dark:text-white uppercase focus:outline-none focus:ring-1"
                  style={{ outlineColor: accentColor }}
                />
              </div>
            </div>
          </div>

          {/* Export Design Tokens Bento */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-neutral-300 flex items-center gap-1.5">
                <Code2 size={14} style={{ color: primaryColor }} />
                <span>{t('themePreview.exportTokens')}</span>
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    exportFormat === 'tailwind'
                      ? getTailwindSnippet()
                      : exportFormat === 'css'
                      ? getCssVariablesSnippet()
                      : getJsonSnippet(),
                    'export-tokens'
                  )
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 text-xs font-mono font-semibold transition-all cursor-pointer border border-zinc-200 dark:border-neutral-700"
              >
                {copiedKey === 'export-tokens' ? (
                  <Check size={12} className="text-emerald-500" />
                ) : (
                  <Copy size={12} />
                )}
                <span>{copiedKey === 'export-tokens' ? 'Copied' : t('tools.copy')}</span>
              </button>
            </div>

            {/* Export Format Selector Tabs */}
            <div className="flex items-center bg-zinc-100 dark:bg-neutral-800 p-0.5 rounded-xl text-xs font-mono font-semibold">
              <button
                onClick={() => setExportFormat('tailwind')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  exportFormat === 'tailwind'
                    ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-2xs'
                    : 'text-zinc-500 dark:text-neutral-400'
                }`}
              >
                Tailwind v4
              </button>
              <button
                onClick={() => setExportFormat('css')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  exportFormat === 'css'
                    ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-2xs'
                    : 'text-zinc-500 dark:text-neutral-400'
                }`}
              >
                CSS :root
              </button>
              <button
                onClick={() => setExportFormat('json')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  exportFormat === 'json'
                    ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-2xs'
                    : 'text-zinc-500 dark:text-neutral-400'
                }`}
              >
                JSON Tokens
              </button>
            </div>

            {/* Snippet Code Box */}
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono max-h-40 overflow-y-auto leading-relaxed">
              <pre style={{ color: primaryColor }} className="whitespace-pre-wrap">
                <code>
                  {exportFormat === 'tailwind'
                    ? getTailwindSnippet()
                    : exportFormat === 'css'
                    ? getCssVariablesSnippet()
                    : getJsonSnippet()}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive UI Showcase Sandbox (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-5">
            {/* Top Toolbar: Title & Simulation Dark/Light Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-2">
                <Eye size={16} style={{ color: primaryColor }} />
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                  {t('themePreview.liveShowcase')}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
                  {t('themePreview.previewMode')}:
                </span>
                <div className="flex items-center bg-zinc-100 dark:bg-neutral-800 p-0.5 rounded-xl text-xs font-mono font-semibold">
                  <button
                    onClick={() => setSimulatedDarkMode(false)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      !simulatedDarkMode
                        ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-2xs'
                        : 'text-zinc-500 dark:text-neutral-400'
                    }`}
                  >
                    <Sun size={12} className="text-amber-500" />
                    <span>{t('themePreview.simLight')}</span>
                  </button>
                  <button
                    onClick={() => setSimulatedDarkMode(true)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      simulatedDarkMode
                        ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-2xs'
                        : 'text-zinc-500 dark:text-neutral-400'
                    }`}
                  >
                    <Moon size={12} className="text-indigo-400" />
                    <span>{t('themePreview.simDark')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Miniature Simulated App Canvas */}
            <div
              className={`rounded-2xl border transition-colors overflow-hidden p-5 space-y-5 shadow-inner ${
                simulatedDarkMode
                  ? 'bg-neutral-950 text-neutral-100 border-neutral-800'
                  : 'bg-zinc-50 text-zinc-900 border-zinc-200'
              }`}
            >
              {/* Simulated App Header */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  simulatedDarkMode
                    ? 'bg-neutral-900/90 border-neutral-800'
                    : 'bg-white border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ▲
                  </div>
                  <div>
                    <span className="font-bold text-xs font-mono tracking-tight block">
                      Next.js 16.3 Arena
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Turbopack Engine v16.3
                    </span>
                  </div>
                </div>

                {/* Simulated Tab Pill Controls */}
                <div className="flex items-center gap-1 bg-zinc-200/50 dark:bg-neutral-800/60 p-1 rounded-xl text-xs font-mono">
                  <button
                    onClick={() => setInteractiveTab('analytics')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      interactiveTab === 'analytics'
                        ? 'text-white shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                    style={{
                      backgroundColor: interactiveTab === 'analytics' ? primaryColor : 'transparent',
                    }}
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => setInteractiveTab('servers')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      interactiveTab === 'servers'
                        ? 'text-white shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                    style={{
                      backgroundColor: interactiveTab === 'servers' ? primaryColor : 'transparent',
                    }}
                  >
                    Edge Nodes
                  </button>
                  <button
                    onClick={() => setInteractiveTab('logs')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      interactiveTab === 'logs'
                        ? 'text-white shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                    style={{
                      backgroundColor: interactiveTab === 'logs' ? primaryColor : 'transparent',
                    }}
                  >
                    Telemetry
                  </button>
                </div>
              </div>

              {/* Simulated Notification Toast */}
              {showNotification && (
                <div
                  className="p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all"
                  style={{
                    backgroundColor: `${primaryColor}12`,
                    borderColor: `${primaryColor}40`,
                    color: primaryColor,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
                    <span className="font-bold">Next.js 16.3 Instant Navigations</span>
                    <span className="opacity-80">— 0ms client-side cache hit</span>
                  </div>
                  <button
                    onClick={() => setShowNotification(false)}
                    className="hover:opacity-70 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Grid of Interactive UI Elements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: Buttons, Badges, & Chips */}
                <div
                  className={`p-4 rounded-xl border space-y-3.5 ${
                    simulatedDarkMode
                      ? 'bg-neutral-900/60 border-neutral-800'
                      : 'bg-white border-zinc-200'
                  }`}
                >
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                    Buttons & Badges
                  </span>

                  {/* Primary & Secondary Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="px-3.5 py-1.5 rounded-xl text-white font-mono text-xs font-bold shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Zap size={13} />
                      <span>{t('themePreview.sampleBtn')}</span>
                    </button>

                    <button
                      className="px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer"
                      style={{
                        borderColor: secondaryColor,
                        color: secondaryColor,
                        backgroundColor: `${secondaryColor}15`,
                      }}
                    >
                      <Sparkles size={13} />
                      <span>{t('themePreview.sampleOutlineBtn')}</span>
                    </button>
                  </div>

                  {/* Badges & Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1"
                      style={{
                        backgroundColor: `${primaryColor}18`,
                        borderColor: `${primaryColor}40`,
                        color: primaryColor,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                      <span>Active Node</span>
                    </span>

                    <span
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold"
                      style={{
                        backgroundColor: `${secondaryColor}25`,
                        color: secondaryColor,
                      }}
                    >
                      Partial Prerender
                    </span>

                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border"
                      style={{
                        borderColor: accentColor,
                        color: accentColor,
                        backgroundColor: `${accentColor}15`,
                      }}
                    >
                      Node 24 LTS
                    </span>
                  </div>
                </div>

                {/* Card 2: Interactive Form Controls & Progress */}
                <div
                  className={`p-4 rounded-xl border space-y-3.5 ${
                    simulatedDarkMode
                      ? 'bg-neutral-900/60 border-neutral-800'
                      : 'bg-white border-zinc-200'
                  }`}
                >
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                    Form Controls & Metrics
                  </span>

                  {/* Input with brand focus ring */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400">Turbopack Target</label>
                    <input
                      type="text"
                      value={interactiveInput}
                      onChange={(e) => setInteractiveInput(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold focus:outline-none ${
                        simulatedDarkMode
                          ? 'bg-neutral-950 border-neutral-800 text-white'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                      style={{ borderColor: primaryColor }}
                    />
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono text-zinc-400">Streaming PPR</span>
                    <button
                      onClick={() => setInteractiveSwitch(!interactiveSwitch)}
                      className="w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer"
                      style={{
                        backgroundColor: interactiveSwitch ? primaryColor : simulatedDarkMode ? '#333' : '#ccc',
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          interactiveSwitch ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-zinc-400">Cache Saturation</span>
                      <span className="font-bold" style={{ color: primaryColor }}>
                        94.8%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden bg-zinc-200 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: '94.8%', backgroundColor: primaryColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Micro Metrics Bar */}
              <div
                className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
                  simulatedDarkMode
                    ? 'bg-neutral-900/40 border-neutral-800'
                    : 'bg-white border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span className="text-zinc-400">Active Palette ID:</span>
                  <span className="font-bold" style={{ color: primaryColor }}>
                    {selectedPaletteId}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400">HEX:</span>
                    <span className="font-bold" style={{ color: primaryColor }}>{primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400">SEC:</span>
                    <span className="font-bold" style={{ color: secondaryColor }}>{secondaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400">ACC:</span>
                    <span className="font-bold" style={{ color: accentColor }}>{accentColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

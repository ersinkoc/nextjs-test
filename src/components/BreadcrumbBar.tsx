import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Home,
  LayoutDashboard,
  Flame,
  Activity,
  Boxes,
  Cpu,
  Terminal,
  FileCode2,
  Wrench,
  Database,
  Share2,
  HardDrive,
  Copy,
  Check,
  Zap,
  Layers,
  Sparkles,
  Compass,
  Command,
  Container,
  Send,
  Shuffle,
  Gauge,
  Radio,
  Globe
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';
import { audioFx } from '../utils/audioFx';

interface BreadcrumbBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCommandPalette?: () => void;
}

interface NavItemMeta {
  id: ActiveTab;
  labelKey: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  badgeColor?: string;
  routeSlug: string;
}

interface NavGroupMeta {
  groupKey: string;
  groupNameEn: string;
  groupNameTr: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  items: NavItemMeta[];
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
}) => {
  const { t, language } = useI18n();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

  // Define comprehensive navigation hierarchy
  const navHierarchy: NavGroupMeta[] = [
    {
      groupKey: 'nav.group.main',
      groupNameEn: 'Core Dashboards',
      groupNameTr: 'Ana Paneller',
      icon: LayoutDashboard,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      items: [
        {
          id: 'overview',
          labelKey: 'nav.overview',
          icon: LayoutDashboard,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          routeSlug: 'overview',
        },
        {
          id: 'edge-scraper',
          labelKey: 'nav.edgeScraper',
          icon: Globe,
          badge: 'Crawler & RSC',
          badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
          routeSlug: 'edge-scraper',
        },
        {
          id: 'docker-cockpit',
          labelKey: 'nav.dockerCockpit',
          icon: Container,
          badge: 'Docker',
          badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
          routeSlug: 'docker-cockpit',
        },
        {
          id: 'api-simulator',
          labelKey: 'nav.apiSimulator',
          icon: Terminal,
          badge: 'RSC',
          badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          routeSlug: 'api-simulator',
        },
      ],
    },
    {
      groupKey: 'nav.group.stress',
      groupNameEn: 'Stress & Extreme Suites',
      groupNameTr: 'Stres & Zorlama Testleri',
      icon: Flame,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      items: [
        {
          id: 'test-arena',
          labelKey: 'nav.testArena',
          icon: Flame,
          badge: '12 Tests',
          badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          routeSlug: 'test-arena',
        },
        {
          id: 'ws-monitor',
          labelKey: 'nav.wsMonitor',
          icon: Radio,
          badge: 'Live WS',
          badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
          routeSlug: 'ws-monitor',
        },
        {
          id: 'stress-lab',
          labelKey: 'nav.stressLab',
          icon: Gauge,
          badge: 'Charts',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          routeSlug: 'stress-lab',
        },
        {
          id: 'performance-lab',
          labelKey: 'nav.performanceLab',
          icon: Activity,
          badge: '50k RPS',
          badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          routeSlug: 'performance-lab',
        },
      ],
    },
    {
      groupKey: 'nav.group.runtime',
      groupNameEn: 'Next.js 16.3 Runtime',
      groupNameTr: 'Next.js 16.3 Runtime',
      icon: Zap,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      items: [
        {
          id: 'server-actions-lab',
          labelKey: 'nav.serverActionsLab',
          icon: Send,
          badge: 'use server',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          routeSlug: 'server-actions-lab',
        },
        {
          id: 'middleware-inspector',
          labelKey: 'nav.middlewareInspector',
          icon: Shuffle,
          badge: 'Edge',
          badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          routeSlug: 'middleware-inspector',
        },
        {
          id: 'edge-sandbox',
          labelKey: 'nav.edgeSandbox',
          icon: Boxes,
          badge: 'PPR',
          badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          routeSlug: 'edge-sandbox',
        },
        {
          id: 'cache-lab',
          labelKey: 'nav.cacheLab',
          icon: Database,
          badge: 'use cache',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          routeSlug: 'cache-lab',
        },
        {
          id: 'compiler-inspector',
          labelKey: 'nav.compilerInspector',
          icon: Cpu,
          badge: 'Rust AST',
          badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
          routeSlug: 'compiler-inspector',
        },
        {
          id: 'og-metadata',
          labelKey: 'nav.ogMetadata',
          icon: Share2,
          badge: 'OG Image',
          badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          routeSlug: 'og-metadata',
        },
      ],
    },
    {
      groupKey: 'nav.group.tools',
      groupNameEn: 'Developer & Production',
      groupNameTr: 'Geliştirici & Üretim',
      icon: Wrench,
      color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
      items: [
        {
          id: 'sqlite-studio',
          labelKey: 'nav.sqliteStudio',
          icon: HardDrive,
          badge: 'SQLite',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          routeSlug: 'sqlite-studio',
        },
        {
          id: 'scratchpad',
          labelKey: 'nav.scratchpad',
          icon: FileCode2,
          badge: 'Playground',
          badgeColor: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
          routeSlug: 'scratchpad',
        },
        {
          id: 'tools',
          labelKey: 'nav.tools',
          icon: Wrench,
          badge: 'v16.3',
          badgeColor: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
          routeSlug: 'tools',
        },
      ],
    },
  ];

  // Find active group and active item
  const activeGroup = navHierarchy.find((group) =>
    group.items.some((item) => item.id === activeTab)
  ) || navHierarchy[0];

  const activeItem = activeGroup.items.find((item) => item.id === activeTab) || activeGroup.items[0];

  const ActiveIcon = activeItem.icon;
  const GroupIcon = activeGroup.icon;

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Copy simulated route URI
  const handleCopyRoute = () => {
    const pseudoUrl = `next16://arena/${activeItem.routeSlug}`;
    navigator.clipboard.writeText(pseudoUrl).catch(() => {});
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <nav
      id="main-breadcrumb-bar"
      aria-label="Breadcrumb"
      className="w-full mb-6 p-3 sm:px-4 sm:py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200/80 dark:border-neutral-800 shadow-2xs transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0">
        {/* Left: Breadcrumb Trail */}
        <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs font-mono min-w-0">
          {/* Level 1: Root / Home */}
          <li className="flex items-center">
            <button
              id="breadcrumb-home-btn"
              onClick={() => {
                audioFx.playClick();
                setActiveTab('overview');
              }}
              title={language === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Overview'}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Home size={13} className="text-zinc-400 dark:text-neutral-500" />
              <span className="font-semibold tracking-tight">Next.js 16.3</span>
            </button>
          </li>

          {/* Divider */}
          <li className="text-zinc-300 dark:text-neutral-700" aria-hidden="true">
            <ChevronRight size={13} />
          </li>

          {/* Level 2: Group Category (With Interactive Sibling Dropdown) */}
          <li className="relative" ref={dropdownRef}>
            <button
              id="breadcrumb-category-menu-btn"
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-neutral-950/80 border border-zinc-200/70 dark:border-neutral-800 text-zinc-600 dark:text-neutral-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
              aria-expanded={isCategoryMenuOpen}
              title={t('breadcrumb.switchView')}
            >
              <GroupIcon size={13} className={activeGroup.color.split(' ')[0]} />
              <span className="font-medium text-[11px] sm:text-xs">
                {t(activeGroup.groupKey)}
              </span>
              <ChevronDown
                size={12}
                className={`text-zinc-400 transition-transform duration-200 ${
                  isCategoryMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Sibling Category Dropdown Menu */}
            <AnimatePresence>
              {isCategoryMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-2 w-64 p-2 rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xl z-50 space-y-1 font-sans"
                >
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-neutral-500 border-b border-zinc-100 dark:border-neutral-800/80 mb-1">
                    {t('breadcrumb.switchView')}
                  </div>
                  {activeGroup.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isCurrent = item.id === activeTab;
                    return (
                      <button
                        key={item.id}
                        id={`breadcrumb-switch-${item.id}`}
                        onClick={() => {
                          audioFx.playTabSwitch();
                          setActiveTab(item.id);
                          setIsCategoryMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'text-zinc-700 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-neutral-800 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ItemIcon size={14} />
                          <span>{t(item.labelKey)}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              item.badgeColor || 'bg-zinc-100 text-zinc-600 border-zinc-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          {/* Divider */}
          <li className="text-zinc-300 dark:text-neutral-700" aria-hidden="true">
            <ChevronRight size={13} />
          </li>

          {/* Level 3: Active Tab Leaf Node */}
          <li className="flex items-center">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold shadow-2xs"
            >
              <ActiveIcon size={13} className="text-emerald-400 dark:text-emerald-600" />
              <span className="truncate max-w-[150px] sm:max-w-[220px]">
                {t(activeItem.labelKey)}
              </span>
              {activeItem.badge && (
                <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-white/20 dark:bg-black/10 text-white dark:text-zinc-900">
                  {activeItem.badge}
                </span>
              )}
            </motion.div>
          </li>
        </ol>

        {/* Right Controls: Pseudo-URL, Copy Route, & Quick Palette Hint */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          {/* Route path badge with Copy button */}
          <div className="flex items-center bg-zinc-100 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 rounded-xl overflow-hidden text-xs font-mono">
            <span className="px-2.5 py-1 text-zinc-400 dark:text-neutral-500 text-[10px] hidden sm:inline">
              route:
            </span>
            <span className="px-2 py-1 text-zinc-700 dark:text-neutral-300 font-semibold text-[11px]">
              /{activeItem.routeSlug}
            </span>
            <button
              id="breadcrumb-copy-route-btn"
              onClick={handleCopyRoute}
              title={t('breadcrumb.copyRoute')}
              className="px-2 py-1 text-zinc-500 hover:text-zinc-900 dark:text-neutral-400 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-neutral-800 transition-colors border-l border-zinc-200/60 dark:border-neutral-800 cursor-pointer"
            >
              {isCopied ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px]">
                  <Check size={12} />
                  <span className="hidden sm:inline">{t('breadcrumb.copied')}</span>
                </span>
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>

          {/* Quick Command Palette Button */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              title="Command Palette (⌘K)"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-600 dark:text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
            >
              <Command size={12} className="text-zinc-400" />
              <span className="text-[10px] hidden lg:inline">⌘K</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

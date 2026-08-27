import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Search,
  RefreshCw,
  Zap,
  Package,
  FileCode2,
  HardDrive,
  Cpu,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  Info,
  Maximize2,
  List,
  Grid,
  Boxes,
  PieChart,
  ShieldCheck,
  ArrowUpDown,
  Flame,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Sliders,
  Thermometer
} from 'lucide-react';
import { useI18n } from '../i18n';
import { BundleStatsResponse, BundlePackageItem, BundleGroupNode } from '../types';

const getCategoryColor = (category?: string): string => {
  switch (category) {
    case 'framework':
      return '#3b82f6'; // Blue
    case 'data-engine':
      return '#ec4899'; // Pink
    case 'charts':
    case 'visualization':
      return '#10b981'; // Emerald
    case 'wasm':
      return '#f59e0b'; // Amber
    case 'app':
      return '#8b5cf6'; // Purple
    case 'ui':
      return '#3b82f6'; // Indigo/Blue
    case 'sdk':
      return '#f43f5e'; // Rose
    case 'styling':
      return '#14b8a6'; // Teal
    case 'utility':
      return '#64748b'; // Slate
    default:
      return '#8b5cf6';
  }
};

export const getHeatmapThermalClass = (growthPercentage?: number, deltaKb?: number) => {
  const pct = growthPercentage ?? 0;
  const delta = deltaKb ?? 0;

  if (pct < 0 || delta < 0) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      border: 'border-emerald-500/40 dark:border-emerald-500/50',
      text: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      barColor: '#10b981',
      severity: 'reduced' as const,
      label: 'Reduced',
    };
  }
  if (pct >= 20 || delta >= 15) {
    return {
      bg: 'bg-rose-500/15 dark:bg-rose-950/50',
      border: 'border-rose-500/50 dark:border-rose-500/60',
      text: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40',
      barColor: '#f43f5e',
      severity: 'critical' as const,
      label: 'Critical Growth',
    };
  }
  if (pct >= 10 || delta >= 6) {
    return {
      bg: 'bg-orange-500/15 dark:bg-orange-950/40',
      border: 'border-orange-500/40 dark:border-orange-500/50',
      text: 'text-orange-600 dark:text-orange-400',
      badgeBg: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
      barColor: '#f97316',
      severity: 'high' as const,
      label: 'High Growth',
    };
  }
  if (pct > 0 || delta > 0) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-950/30',
      border: 'border-amber-500/30 dark:border-amber-500/40',
      text: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      barColor: '#f59e0b',
      severity: 'moderate' as const,
      label: 'Moderate Growth',
    };
  }
  return {
    bg: 'bg-zinc-50 dark:bg-neutral-800/40',
    border: 'border-zinc-200 dark:border-neutral-800',
    text: 'text-zinc-500 dark:text-neutral-400',
    badgeBg: 'bg-zinc-200/60 dark:bg-neutral-700/60 text-zinc-600 dark:text-neutral-300 border-zinc-300 dark:border-neutral-700',
    barColor: '#71717a',
    severity: 'stable' as const,
    label: 'Stable',
  };
};

interface BundleVisualizerProps {
  onSelectPackage?: (pkg: BundlePackageItem) => void;
}

export const BundleVisualizer: React.FC<BundleVisualizerProps> = () => {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // States
  const [statsData, setStatsData] = useState<BundleStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction States
  const [metricMode, setMetricMode] = useState<'sizeKb' | 'gzipKb' | 'brotliKb'>('sizeKb');
  const [viewMode, setViewMode] = useState<'treemap' | 'table' | 'chunks'>('treemap');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [zoomPath, setZoomPath] = useState<string[]>(['root']);
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedPackageDetail, setSelectedPackageDetail] = useState<BundlePackageItem | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [sortField, setSortField] = useState<'sizeKb' | 'gzipKb' | 'percentage' | 'treeShakingEfficiencyPct'>('sizeKb');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Heatmap Specific States inside Summary Widget
  const [heatmapFilter, setHeatmapFilter] = useState<'all' | 'critical' | 'significant' | 'reduced'>('all');
  const [heatmapSort, setHeatmapSort] = useState<'deltaKb' | 'growthPct' | 'currSize'>('deltaKb');
  const [heatmapMode, setHeatmapMode] = useState<'grid' | 'bars'>('grid');
  const [hoveredHeatmapPkg, setHoveredHeatmapPkg] = useState<BundlePackageItem | null>(null);

  // Derived Highlights calculated from TreeMap data, Chunks & Growth deltas
  const bundleHighlights = useMemo(() => {
    if (!statsData) return null;

    // 1. Total Bundle Size (Calculated from all packages / leaves)
    const totalRawKb = statsData.packages.reduce((acc, p) => acc + p.sizeKb, 0);
    const totalGzipKb = statsData.packages.reduce((acc, p) => acc + p.gzipKb, 0);
    const totalBrotliKb = statsData.packages.reduce((acc, p) => acc + (p.brotliKb || p.gzipKb * 0.86), 0);

    // Initial vs Async breakdown
    const initialKb = statsData.packages.filter((p) => p.isInitial).reduce((acc, p) => acc + p.sizeKb, 0);
    const asyncKb = statsData.packages.filter((p) => !p.isInitial).reduce((acc, p) => acc + p.sizeKb, 0);
    const initialPct = totalRawKb > 0 ? ((initialKb / totalRawKb) * 100).toFixed(1) : '0';
    const asyncPct = totalRawKb > 0 ? ((asyncKb / totalRawKb) * 100).toFixed(1) : '0';

    // 2. Largest Chunk
    const sortedChunks = [...statsData.chunks].sort((a, b) => b.sizeKb - a.sizeKb);
    const largestChunk = sortedChunks[0] || null;
    const largestChunkShare =
      largestChunk && totalRawKb > 0 ? ((largestChunk.sizeKb / totalRawKb) * 100).toFixed(1) : '0';

    // 3. Top 5 Heaviest Dependencies calculated directly from TreeMap data
    const top5Heaviest = [...statsData.packages]
      .sort((a, b) => b.sizeKb - a.sizeKb)
      .slice(0, 5);

    const top5TotalWeight = top5Heaviest.reduce((acc, p) => acc + p.sizeKb, 0);
    const top5ShareOfTotal = totalRawKb > 0 ? ((top5TotalWeight / totalRawKb) * 100).toFixed(1) : '0';

    // 4. Growth & Heatmap Calculations
    const previousBuildTotalSizeKb = statsData.previousBuildTotalSizeKb ||
      parseFloat(statsData.packages.reduce((acc, p) => acc + (p.previousSizeKb ?? p.sizeKb), 0).toFixed(1));
    const totalGrowthKb = statsData.totalGrowthKb !== undefined
      ? statsData.totalGrowthKb
      : parseFloat((totalRawKb - previousBuildTotalSizeKb).toFixed(1));
    const totalGrowthPercentage = statsData.totalGrowthPercentage !== undefined
      ? statsData.totalGrowthPercentage
      : parseFloat(((totalGrowthKb / (previousBuildTotalSizeKb || 1)) * 100).toFixed(1));

    const previousBuildTag = statsData.previousBuildTag || 'Build #412 (Next.js 16.2.8)';
    const currentBuildTag = statsData.currentBuildTag || 'Build #413 (Next.js 16.3.0)';

    // Enriched packages with fallback deltas if not present
    const packagesWithGrowth = statsData.packages.map((pkg) => {
      const prev = pkg.previousSizeKb ?? pkg.sizeKb;
      const delta = pkg.deltaKb !== undefined ? pkg.deltaKb : parseFloat((pkg.sizeKb - prev).toFixed(1));
      const pct = pkg.growthPercentage !== undefined
        ? pkg.growthPercentage
        : prev > 0 ? parseFloat(((delta / prev) * 100).toFixed(1)) : 0;
      let severity = pkg.growthSeverity;
      if (!severity) {
        if (pct < 0 || delta < 0) severity = 'reduced';
        else if (pct >= 20 || delta >= 15) severity = 'critical';
        else if (pct >= 10 || delta >= 6) severity = 'high';
        else if (pct > 0) severity = 'moderate';
        else severity = 'stable';
      }
      return {
        ...pkg,
        previousSizeKb: prev,
        deltaKb: delta,
        growthPercentage: pct,
        growthSeverity: severity,
      };
    });

    const criticalCount = packagesWithGrowth.filter((p) => (p.growthPercentage ?? 0) >= 20 || (p.deltaKb ?? 0) >= 15).length;
    const highCount = packagesWithGrowth.filter((p) => (p.growthPercentage ?? 0) >= 10 && (p.growthPercentage ?? 0) < 20).length;
    const stableCount = packagesWithGrowth.filter((p) => (p.growthPercentage ?? 0) >= 0 && (p.growthPercentage ?? 0) < 10).length;
    const reducedCount = packagesWithGrowth.filter((p) => (p.growthPercentage ?? 0) < 0 || (p.deltaKb ?? 0) < 0).length;

    return {
      totalRawKb: parseFloat(totalRawKb.toFixed(1)),
      totalGzipKb: parseFloat(totalGzipKb.toFixed(1)),
      totalBrotliKb: parseFloat(totalBrotliKb.toFixed(1)),
      initialKb: parseFloat(initialKb.toFixed(1)),
      asyncKb: parseFloat(asyncKb.toFixed(1)),
      initialPct,
      asyncPct,
      largestChunk,
      largestChunkShare,
      top5Heaviest,
      top5TotalWeight: parseFloat(top5TotalWeight.toFixed(1)),
      top5ShareOfTotal,
      previousBuildTotalSizeKb,
      totalGrowthKb,
      totalGrowthPercentage,
      previousBuildTag,
      currentBuildTag,
      packagesWithGrowth,
      criticalCount,
      highCount,
      stableCount,
      reducedCount,
    };
  }, [statsData]);

  // Filtered & Sorted Heatmap Packages
  const filteredGrowthPackages = useMemo(() => {
    if (!bundleHighlights) return [];
    let list = [...bundleHighlights.packagesWithGrowth];

    if (heatmapFilter === 'critical') {
      list = list.filter((p) => (p.growthPercentage ?? 0) >= 20 || (p.deltaKb ?? 0) >= 15);
    } else if (heatmapFilter === 'significant') {
      list = list.filter((p) => (p.growthPercentage ?? 0) >= 10 || (p.deltaKb ?? 0) >= 6);
    } else if (heatmapFilter === 'reduced') {
      list = list.filter((p) => (p.growthPercentage ?? 0) < 0 || (p.deltaKb ?? 0) < 0);
    }

    if (heatmapSort === 'deltaKb') {
      list.sort((a, b) => (b.deltaKb ?? 0) - (a.deltaKb ?? 0));
    } else if (heatmapSort === 'growthPct') {
      list.sort((a, b) => (b.growthPercentage ?? 0) - (a.growthPercentage ?? 0));
    } else if (heatmapSort === 'currSize') {
      list.sort((a, b) => b.sizeKb - a.sizeKb);
    }

    return list;
  }, [bundleHighlights, heatmapFilter, heatmapSort]);

  // Container dimensions
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 900, height: 540 });

  // Fetch bundle stats from server API
  const fetchBundleStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/compiler/bundle-stats');
      if (!resp.ok) {
        throw new Error(`Failed to load bundle stats: HTTP ${resp.status}`);
      }
      const data: BundleStatsResponse = await resp.json();
      setStatsData(data);
    } catch (err: any) {
      console.error('Error fetching bundle stats:', err);
      setError(err.message || 'Failed to parse production build stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBundleStats();
  }, []);

  // ResizeObserver for responsive D3 TreeMap rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 200) {
          const calculatedHeight = Math.max(480, Math.min(680, Math.round(width * 0.58)));
          setDimensions({ width, height: calculatedHeight });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filtered & Zoomed Data Processing
  const currentHierarchyData = useMemo(() => {
    if (!statsData?.treeData) return null;

    let baseTree: any = JSON.parse(JSON.stringify(statsData.treeData));

    // Handle Category Filter
    if (selectedCategory !== 'all') {
      baseTree.children = (baseTree.children || []).filter(
        (cat: any) => cat.category === selectedCategory || cat.name.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Handle Zoom into Category
    if (zoomPath.length > 1) {
      const targetCat = zoomPath[1];
      const matched = (baseTree.children || []).find(
        (c: any) => c.category === targetCat || c.name === targetCat
      );
      if (matched) {
        baseTree = matched;
      }
    }

    return baseTree;
  }, [statsData, selectedCategory, zoomPath]);

  // Render D3 TreeMap
  useEffect(() => {
    if (!svgRef.current || !currentHierarchyData || viewMode !== 'treemap') return;

    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Construct D3 Hierarchy
    const root = d3
      .hierarchy(currentHierarchyData)
      .sum((d: any) => {
        if (d.children && d.children.length > 0) return 0;
        return d[metricMode] || d.sizeKb || 1;
      })
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create Treemap Layout
    const treemapLayout = d3
      .treemap()
      .size([width, height])
      .paddingOuter(6)
      .paddingTop(26)
      .paddingInner(3)
      .round(true)
      .tile(d3.treemapSquarify.ratio(1.2));

    treemapLayout(root as any);

    const leaves = root.leaves();
    const categories = root.children || [];

    // Main Group
    const g = svg.append('g').attr('class', 'treemap-root');

    // 1. Draw Category Backgrounds and Headers (if root view)
    if (root.depth === 0 && categories.length > 0) {
      const catGroups = g
        .selectAll('g.category-group')
        .data(categories)
        .enter()
        .append('g')
        .attr('class', 'category-group')
        .attr('cursor', 'pointer')
        .on('click', (event, d: any) => {
          if (d.data?.category || d.data?.name) {
            setZoomPath(['root', d.data.category || d.data.name]);
          }
        });

      // Category boundary rect
      catGroups
        .append('rect')
        .attr('x', (d: any) => d.x0)
        .attr('y', (d: any) => d.y0)
        .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
        .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
        .attr('fill', (d: any) => d.data.color || '#3b82f6')
        .attr('fill-opacity', 0.08)
        .attr('stroke', (d: any) => d.data.color || '#3b82f6')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.35)
        .attr('rx', 8)
        .attr('ry', 8);

      // Category Header Label
      catGroups
        .append('text')
        .attr('x', (d: any) => d.x0 + 8)
        .attr('y', (d: any) => d.y0 + 16)
        .attr('font-size', '11px')
        .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
        .attr('font-weight', '700')
        .attr('fill', (d: any) => d.data.color || '#38bdf8')
        .text((d: any) => {
          const w = d.x1 - d.x0;
          if (w < 90) return '';
          const totalCatWeight = d.value ? `${d.value.toFixed(1)} KB` : '';
          const name = d.data.name || d.data.category;
          return `${name.toUpperCase()} (${totalCatWeight})`;
        });
    }

    // 2. Draw Leaf Nodes (Packages & Modules)
    const nodeGroups = g
      .selectAll('g.node')
      .data(leaves)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
      .attr('cursor', 'pointer');

    // Node Box Rectangle
    nodeGroups
      .append('rect')
      .attr('id', (d: any) => `tile-${d.data.id || d.data.name}`)
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d: any) => {
        const isMatched =
          !searchQuery ||
          d.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.data.category && d.data.category.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!isMatched) return '#1e293b';
        return d.data.color || d.parent?.data?.color || '#3b82f6';
      })
      .attr('fill-opacity', (d: any) => {
        if (!searchQuery) return 0.22;
        const isMatched =
          d.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.data.category && d.data.category.toLowerCase().includes(searchQuery.toLowerCase()));
        return isMatched ? 0.45 : 0.06;
      })
      .attr('stroke', (d: any) => {
        if (searchQuery && d.data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return '#38bdf8';
        }
        return d.data.color || d.parent?.data?.color || '#3b82f6';
      })
      .attr('stroke-width', (d: any) => {
        if (searchQuery && d.data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return 2.5;
        }
        return 1;
      })
      .attr('stroke-opacity', (d: any) => {
        if (!searchQuery) return 0.5;
        return d.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0.15;
      })
      .attr('rx', 6)
      .attr('ry', 6)
      .on('mouseenter', function (event, d: any) {
        d3.select(this)
          .attr('fill-opacity', 0.5)
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 1);

        const [mX, mY] = d3.pointer(event, containerRef.current);
        setTooltipPos({ x: mX, y: mY });
        setHoveredNode(d.data);
      })
      .on('mousemove', function (event, d: any) {
        const [mX, mY] = d3.pointer(event, containerRef.current);
        setTooltipPos({ x: mX, y: mY });
      })
      .on('mouseleave', function (event, d: any) {
        d3.select(this)
          .attr('fill-opacity', (d: any) => {
            if (!searchQuery) return 0.22;
            return d.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 0.45 : 0.06;
          })
          .attr('stroke-width', (d: any) => {
            if (searchQuery && d.data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
              return 2.5;
            }
            return 1;
          })
          .attr('stroke-opacity', (d: any) => {
            if (!searchQuery) return 0.5;
            return d.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0.15;
          });
        setHoveredNode(null);
      })
      .on('click', (event, d: any) => {
        if (d.data) {
          setSelectedPackageDetail(d.data);
        }
      });

    // Node Text: Package Name
    nodeGroups
      .append('text')
      .attr('x', 6)
      .attr('y', 16)
      .attr('font-size', (d: any) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 60 || h < 32) return '9px';
        if (w < 110 || h < 48) return '11px';
        return '12px';
      })
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
      .attr('font-weight', '700')
      .attr('fill', '#ffffff')
      .attr('pointer-events', 'none')
      .text((d: any) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 40 || h < 24) return '';
        const name = d.data.name || '';
        if (w < 85 && name.length > 8) return `${name.substring(0, 7)}…`;
        if (w < 130 && name.length > 14) return `${name.substring(0, 12)}…`;
        return name;
      });

    // Node Text: Metric Value (KB & Percentage)
    nodeGroups
      .append('text')
      .attr('x', 6)
      .attr('y', 31)
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
      .attr('fill', '#cbd5e1')
      .attr('opacity', 0.9)
      .attr('pointer-events', 'none')
      .text((d: any) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 65 || h < 38) return '';
        const val = d.data[metricMode] || d.value || 0;
        const pct = d.data.percentage ? `(${d.data.percentage}%)` : '';
        return `${val.toFixed(1)} KB ${w > 110 ? pct : ''}`;
      });

    // Node Badge: Initial/Async or Tree-shaked indicator
    nodeGroups
      .append('text')
      .attr('x', 6)
      .attr('y', (d: any) => Math.max(0, d.y1 - d.y0) - 6)
      .attr('font-size', '8.5px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
      .attr('font-weight', '600')
      .attr('fill', (d: any) => (d.data.isInitial ? '#38bdf8' : '#a78bfa'))
      .attr('pointer-events', 'none')
      .text((d: any) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 80 || h < 55) return '';
        return d.data.isInitial ? '⚡ INITIAL' : '⏳ ASYNC';
      });

  }, [currentHierarchyData, dimensions, metricMode, searchQuery, viewMode]);

  // Copy bundle summary to clipboard
  const handleCopySummary = () => {
    if (!statsData) return;
    const summaryText = `Next.js 16.3 Production Bundle Analysis (${statsData.bundler})
Total Client Bundle: ${statsData.totalSizeKb} KB (Parsed) / ${statsData.totalGzipKb} KB (Gzip) / ${statsData.totalBrotliKb} KB (Brotli)
Total Packages: ${statsData.totalPackages} | Total Modules: ${statsData.totalModules}
Build Target: ${statsData.buildTarget}

Top 5 Packages by Weight:
${statsData.packages
  .slice(0, 5)
  .map((p, i) => `${i + 1}. ${p.name} — ${p.sizeKb} KB (${p.percentage}%) [Gzip: ${p.gzipKb} KB]`)
  .join('\n')}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Table Sort logic
  const sortedPackages = useMemo(() => {
    if (!statsData?.packages) return [];
    let list = [...statsData.packages];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.path.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    list.sort((a, b) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [statsData, selectedCategory, searchQuery, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6" id="bundle-visualizer-root">
      {/* Header Bento Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Boxes size={13} />
                D3 Production Visualizer
              </span>
              <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
                {statsData?.bundler || 'Turbopack 16.3 + Vite'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1.5 flex items-center gap-2">
              <span>{t('compiler.bundleTitle')}</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1 max-w-2xl">
              {t('compiler.bundleDesc')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-2xl text-xs font-mono font-bold bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-1.5"
            >
              {copiedSummary ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copiedSummary ? 'Copied Stats' : 'Export Summary'}</span>
            </button>
            <button
              onClick={fetchBundleStats}
              disabled={isLoading}
              className="px-4 py-2 rounded-2xl text-xs font-mono font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? t('compiler.analyzing') : t('compiler.reanalyze')}</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Strip */}
        {statsData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-zinc-100 dark:border-neutral-800">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200/70 dark:border-neutral-800">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-neutral-400 font-mono">
                <span>{t('compiler.totalBundle')}</span>
                <HardDrive size={13} className="text-purple-500" />
              </div>
              <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">
                {statsData.totalSizeKb.toFixed(1)} <span className="text-xs font-normal text-zinc-400">KB</span>
              </div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                {(statsData.totalSizeKb / 1024).toFixed(2)} MB uncompressed
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200/70 dark:border-neutral-800">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-neutral-400 font-mono">
                <span>{t('compiler.gzipEstimate')}</span>
                <Zap size={13} className="text-amber-500" />
              </div>
              <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">
                {statsData.totalGzipKb.toFixed(1)} <span className="text-xs font-normal text-zinc-400">KB</span>
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                {((statsData.totalGzipKb / statsData.totalSizeKb) * 100).toFixed(1)}% compression ratio
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200/70 dark:border-neutral-800">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-neutral-400 font-mono">
                <span>{t('compiler.treeShakingScore')}</span>
                <Sparkles size={13} className="text-emerald-500" />
              </div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                93.8%
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-neutral-400 font-mono mt-0.5">
                Dead code eliminated
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200/70 dark:border-neutral-800">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-neutral-400 font-mono">
                <span>{t('compiler.activeChunks')}</span>
                <Layers size={13} className="text-blue-500" />
              </div>
              <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">
                {statsData.chunks.length} <span className="text-xs font-normal text-zinc-400">Chunks</span>
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                {statsData.chunks.filter((c) => c.type === 'initial').length} Initial • {statsData.chunks.filter((c) => c.type === 'async').length} Async
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200/70 dark:border-neutral-800 col-span-2 sm:col-span-4 lg:col-span-1">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-neutral-400 font-mono">
                <span>Packages & Modules</span>
                <Package size={13} className="text-rose-500" />
              </div>
              <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">
                {statsData.totalPackages} <span className="text-xs font-normal text-zinc-400">pkg</span>
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-neutral-400 font-mono mt-0.5">
                {statsData.totalModules} modules resolved
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Highlights Widget */}
      {bundleHighlights && (
        <div
          id="bundle-summary-widget"
          className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>{t('compiler.summaryWidgetTitle')}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {t('compiler.summaryTreeSource')}
                  </span>
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 dark:text-neutral-400">
                  {t('compiler.summaryTop5Desc')}
                </p>
              </div>
            </div>

            <div className="text-xs font-mono text-zinc-400 dark:text-neutral-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Turbopack 16.3 Production Output</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Highlight 1: Total Bundle Size */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200/70 dark:border-neutral-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HardDrive size={14} className="text-purple-500" />
                    {t('compiler.summaryTotalBundle')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    {(bundleHighlights.totalRawKb / 1024).toFixed(2)} MB
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white tracking-tight">
                    {bundleHighlights.totalRawKb.toLocaleString()} <span className="text-sm font-normal text-zinc-400">KB</span>
                  </div>
                  <div className="text-xs font-mono text-zinc-500 dark:text-neutral-400 mt-1.5 flex items-center gap-2">
                    <span>
                      Gzip: <strong className="text-amber-600 dark:text-amber-400">{bundleHighlights.totalGzipKb} KB</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Brotli: <strong className="text-emerald-600 dark:text-emerald-400">{bundleHighlights.totalBrotliKb} KB</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Initial vs Lazy Async Distribution Bar */}
              <div className="pt-3 border-t border-zinc-200/60 dark:border-neutral-700/60 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-zinc-600 dark:text-neutral-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Initial: {bundleHighlights.initialKb} KB ({bundleHighlights.initialPct}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Async: {bundleHighlights.asyncKb} KB ({bundleHighlights.asyncPct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-neutral-700 overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: `${bundleHighlights.initialPct}%` }} />
                  <div className="h-full bg-purple-500" style={{ width: `${bundleHighlights.asyncPct}%` }} />
                </div>
              </div>
            </div>

            {/* Highlight 2: Largest Chunk */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200/70 dark:border-neutral-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-amber-500" />
                    {t('compiler.summaryLargestChunk')}
                  </span>
                  {bundleHighlights.largestChunk && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase">
                      {bundleHighlights.largestChunk.type}
                    </span>
                  )}
                </div>

                {bundleHighlights.largestChunk ? (
                  <div className="mt-3">
                    <div className="text-sm font-bold font-mono text-zinc-900 dark:text-white truncate">
                      {bundleHighlights.largestChunk.name}
                    </div>
                    <div className="text-2xl font-bold font-mono text-amber-500 mt-1">
                      {bundleHighlights.largestChunk.sizeKb} <span className="text-sm font-normal text-zinc-400">KB</span>
                    </div>
                    <div className="text-xs font-mono text-zinc-500 dark:text-neutral-400 mt-1">
                      {bundleHighlights.largestChunkShare}% {t('compiler.summaryChunkShare')} (Gzip: {bundleHighlights.largestChunk.gzipKb} KB)
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-zinc-400 mt-3">No chunk data</div>
                )}
              </div>

              {bundleHighlights.largestChunk && (
                <div className="pt-3 border-t border-zinc-200/60 dark:border-neutral-700/60 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-zinc-500 dark:text-neutral-400">
                    {bundleHighlights.largestChunk.modulesCount} resolved modules
                  </span>
                  <button
                    onClick={() => setViewMode('chunks')}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>View Chunks</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Highlight 3: Top 5 Heaviest Dependencies (Calculated from TreeMap) */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200/70 dark:border-neutral-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Package size={14} className="text-rose-500" />
                    {t('compiler.summaryTop5Heaviest')}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-rose-500">
                    {bundleHighlights.top5ShareOfTotal}% Total
                  </span>
                </div>

                <div className="mt-2.5 space-y-2 font-mono">
                  {bundleHighlights.top5Heaviest.map((pkg, idx) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageDetail(pkg)}
                      className="group p-1.5 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-neutral-700/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold text-zinc-400 w-3 text-center">
                            #{idx + 1}
                          </span>
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: getCategoryColor(pkg.category) }}
                          />
                          <span className="font-bold text-zinc-900 dark:text-white truncate text-[11px] group-hover:text-purple-500 transition-colors">
                            {pkg.name}
                          </span>
                        </div>
                        <div className="text-right shrink-0 pl-2">
                          <span className="font-bold text-zinc-900 dark:text-white text-[11px]">
                            {pkg.sizeKb} KB
                          </span>
                          <span className="text-[10px] text-zinc-400 ml-1">
                            ({pkg.percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="w-full h-1 rounded-full bg-zinc-200 dark:bg-neutral-700 mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(pkg.percentage * 2.6, 100)}%`,
                            backgroundColor: getCategoryColor(pkg.category),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Growth Heatmap Visualization Module */}
          <div
            id="dependency-growth-heatmap"
            className="pt-5 border-t border-zinc-100 dark:border-neutral-800 space-y-4"
          >
            {/* Heatmap Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20 shrink-0 mt-0.5">
                  <Thermometer size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold font-mono text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>{t('compiler.heatmapTitle')}</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {bundleHighlights.previousBuildTag} → {bundleHighlights.currentBuildTag}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-500 dark:text-neutral-400 mt-0.5">
                    {t('compiler.heatmapSubtitle')}
                  </p>
                </div>
              </div>

              {/* View Mode & Sort Controls */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                {/* Heatmap View Mode Switcher */}
                <div className="p-0.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 flex items-center gap-0.5">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setHeatmapMode('grid')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      heatmapMode === 'grid'
                        ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-xs'
                        : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Grid size={12} />
                    <span>{t('compiler.heatmapModeGrid')}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setHeatmapMode('bars')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      heatmapMode === 'bars'
                        ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-xs'
                        : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <List size={12} />
                    <span>{t('compiler.heatmapModeBars')}</span>
                  </motion.button>
                </div>

                {/* Heatmap Sort Selector */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-neutral-800 p-0.5 rounded-xl">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setHeatmapSort('deltaKb')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      heatmapSort === 'deltaKb'
                        ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {t('compiler.heatmapSortDeltaKb')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setHeatmapSort('growthPct')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      heatmapSort === 'growthPct'
                        ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {t('compiler.heatmapSortGrowthPct')}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Metrics & Filter Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-800/40 border border-zinc-200/60 dark:border-neutral-800 font-mono text-xs">
              {/* Build Comparison Summary Stats */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 text-[11px]">{t('compiler.heatmapTotalDelta')}:</span>
                  <span className={`font-bold ${bundleHighlights.totalGrowthKb >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {bundleHighlights.totalGrowthKb >= 0 ? `+${bundleHighlights.totalGrowthKb}` : bundleHighlights.totalGrowthKb} KB
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    bundleHighlights.totalGrowthPercentage >= 10
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {bundleHighlights.totalGrowthPercentage >= 0 ? `+${bundleHighlights.totalGrowthPercentage}%` : `${bundleHighlights.totalGrowthPercentage}%`}
                  </span>
                </div>

                <span className="text-zinc-300 dark:text-neutral-700 hidden sm:inline">•</span>

                <div className="text-zinc-500 dark:text-neutral-400 text-[11px]">
                  Prev: <strong className="text-zinc-700 dark:text-neutral-300">{bundleHighlights.previousBuildTotalSizeKb} KB</strong> → Curr: <strong className="text-zinc-900 dark:text-white">{bundleHighlights.totalRawKb} KB</strong>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setHeatmapFilter('all')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                    heatmapFilter === 'all'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                      : 'bg-white dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 border border-zinc-200 dark:border-neutral-700 hover:border-zinc-300'
                  }`}
                >
                  <span>{t('compiler.heatmapFilterAll')}</span>
                  <span className="opacity-70 text-[10px]">({bundleHighlights.packagesWithGrowth.length})</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setHeatmapFilter('critical')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                    heatmapFilter === 'critical'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                  }`}
                >
                  <Flame size={11} />
                  <span>{t('compiler.heatmapFilterCritical')}</span>
                  <span className="text-[10px] font-bold">({bundleHighlights.criticalCount})</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setHeatmapFilter('significant')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                    heatmapFilter === 'significant'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-500/20'
                  }`}
                >
                  <TrendingUp size={11} />
                  <span>{t('compiler.heatmapFilterSignificant')}</span>
                  <span className="text-[10px] font-bold">({bundleHighlights.highCount + bundleHighlights.criticalCount})</span>
                </motion.button>
                {bundleHighlights.reducedCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setHeatmapFilter('reduced')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                      heatmapFilter === 'reduced'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    <TrendingDown size={11} />
                    <span>{t('compiler.heatmapFilterReduced')}</span>
                    <span className="text-[10px] font-bold">({bundleHighlights.reducedCount})</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Heatmap Content Body */}
            {heatmapMode === 'grid' ? (
              /* Thermal Grid Matrix View with Framer Motion hover & spring physics */
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 font-mono"
              >
                <AnimatePresence mode="popLayout">
                  {filteredGrowthPackages.map((pkg) => {
                    const thermal = getHeatmapThermalClass(pkg.growthPercentage, pkg.deltaKb);
                    const isHovered = hoveredHeatmapPkg?.id === pkg.id;
                    const deltaKbVal = pkg.deltaKb ?? 0;
                    const growthPctVal = pkg.growthPercentage ?? 0;

                    return (
                      <motion.div
                        key={pkg.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.93, y: -4 }}
                        whileHover={{
                          y: -5,
                          scale: 1.025,
                          transition: { type: 'spring', stiffness: 450, damping: 25 },
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPackageDetail(pkg)}
                        onMouseEnter={() => setHoveredHeatmapPkg(pkg)}
                        onMouseLeave={() => setHoveredHeatmapPkg(null)}
                        className={`relative p-3.5 rounded-2xl border transition-colors duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                          thermal.bg
                        } ${thermal.border} ${
                          isHovered
                            ? 'ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/10'
                            : 'hover:border-orange-500/40 shadow-xs'
                        }`}
                      >
                        {/* Top Row: Category Dot, Name & Growth Indicator Icon */}
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: getCategoryColor(pkg.category) }}
                              />
                              <span className="font-bold text-zinc-900 dark:text-white text-xs truncate" title={pkg.name}>
                                {pkg.name}
                              </span>
                            </div>

                            <motion.div
                              className="shrink-0 flex items-center gap-1"
                              whileHover={{ scale: 1.2, rotate: [-5, 5, 0] }}
                              transition={{ duration: 0.2 }}
                            >
                              {growthPctVal >= 20 ? (
                                <span className="p-1 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-400" title="Critical Growth (>+20%)">
                                  <Flame size={12} className="animate-pulse" />
                                </span>
                              ) : growthPctVal >= 10 ? (
                                <span className="p-1 rounded-md bg-orange-500/20 text-orange-600 dark:text-orange-400" title="High Growth (+10-20%)">
                                  <TrendingUp size={12} />
                                </span>
                              ) : growthPctVal < 0 ? (
                                <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" title="Reduced Size (-KB)">
                                  <TrendingDown size={12} />
                                </span>
                              ) : (
                                <span className="p-1 rounded-md bg-zinc-200/50 dark:bg-neutral-700/50 text-zinc-400" title="Stable (±0%)">
                                  <ShieldCheck size={12} />
                                </span>
                              )}
                            </motion.div>
                          </div>

                          {/* Version and Path Subtext */}
                          <div className="text-[10px] text-zinc-400 dark:text-neutral-500 mt-0.5 truncate">
                            {pkg.version || 'v16.3'} • {pkg.category}
                          </div>
                        </div>

                        {/* Middle: Delta Value & Size Comparison */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="text-[10px] text-zinc-400 block">{t('compiler.heatmapCurrSize')}</span>
                              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                {pkg.sizeKb} <span className="text-[10px] font-normal text-zinc-400">KB</span>
                              </span>
                            </div>

                            <div className="text-right">
                              <motion.span
                                whileHover={{ scale: 1.06 }}
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold border inline-block ${thermal.badgeBg}`}
                              >
                                {deltaKbVal >= 0 ? `+${deltaKbVal.toFixed(1)} KB` : `${deltaKbVal.toFixed(1)} KB`}
                                <span className="ml-1 text-[10px] opacity-90">
                                  ({growthPctVal >= 0 ? `+${growthPctVal.toFixed(1)}%` : `${growthPctVal.toFixed(1)}%`})
                                </span>
                              </motion.span>
                            </div>
                          </div>

                          {/* Thermal Intensity Meter with animated smooth width */}
                          <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-neutral-700 overflow-hidden relative">
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(Math.max(Math.abs(growthPctVal) * 1.5, 8), 100)}%`,
                              }}
                              transition={{ duration: 0.4, ease: 'easeOut' }}
                              style={{
                                backgroundColor: thermal.barColor,
                              }}
                            />
                          </div>
                        </div>

                        {/* Bottom: Reason snippet with subtle interactive arrow */}
                        <div className="pt-2 border-t border-zinc-200/40 dark:border-neutral-800/60 flex items-center justify-between text-[10px] text-zinc-500 dark:text-neutral-400">
                          <span className="truncate pr-2" title={pkg.growthReason || pkg.description}>
                            {pkg.growthReason || pkg.description || 'Payload delta tracked'}
                          </span>
                          <motion.div
                            animate={{ x: isHovered ? 2 : 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          >
                            <ChevronRight size={11} className="text-zinc-400 shrink-0" />
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Thermal Delta Bars View with Framer Motion hover & spring physics */
              <motion.div
                layout
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-800/40 border border-zinc-200/60 dark:border-neutral-800 space-y-3 font-mono"
              >
                <AnimatePresence mode="popLayout">
                  {filteredGrowthPackages.map((pkg, idx) => {
                    const thermal = getHeatmapThermalClass(pkg.growthPercentage, pkg.deltaKb);
                    const deltaKbVal = pkg.deltaKb ?? 0;
                    const growthPctVal = pkg.growthPercentage ?? 0;
                    const prevKb = pkg.previousSizeKb ?? pkg.sizeKb;

                    return (
                      <motion.div
                        key={pkg.id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        whileHover={{
                          x: 6,
                          scale: 1.008,
                          transition: { type: 'spring', stiffness: 450, damping: 28 },
                        }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedPackageDetail(pkg)}
                        className="group p-2.5 rounded-xl hover:bg-white dark:hover:bg-neutral-900 border border-transparent hover:border-zinc-200 dark:hover:border-neutral-700 cursor-pointer transition-colors space-y-1.5 shadow-2xs hover:shadow-xs"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-bold text-zinc-400 w-4 text-center">
                              #{idx + 1}
                            </span>
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: getCategoryColor(pkg.category) }}
                            />
                            <span className="font-bold text-zinc-900 dark:text-white truncate text-xs group-hover:text-orange-500 transition-colors">
                              {pkg.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 hidden sm:inline">
                              ({pkg.version || 'v16.3'})
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right text-[11px] text-zinc-400 hidden md:block">
                              <span>{prevKb} KB</span>
                              <span className="mx-1 text-zinc-300 dark:text-neutral-600">→</span>
                              <strong className="text-zinc-900 dark:text-white">{pkg.sizeKb} KB</strong>
                            </div>

                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${thermal.badgeBg}`}
                            >
                              {deltaKbVal >= 0 ? `+${deltaKbVal.toFixed(1)} KB` : `${deltaKbVal.toFixed(1)} KB`}
                              <span className="ml-1 text-[10px]">
                                ({growthPctVal >= 0 ? `+${growthPctVal.toFixed(1)}%` : `${growthPctVal.toFixed(1)}%`})
                              </span>
                            </motion.span>
                          </div>
                        </div>

                        {/* Comparative Dual Fill Bar */}
                        <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-neutral-700 overflow-hidden flex">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(Math.max((prevKb / (pkg.sizeKb || 1)) * 100, 10), 100)}%`,
                            }}
                            transition={{ duration: 0.35 }}
                            style={{
                              backgroundColor: '#94a3b8',
                              opacity: 0.5,
                            }}
                            title={`Previous Size: ${prevKb} KB`}
                          />
                          <motion.div
                            className="h-full rounded-r-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(Math.max(Math.abs(growthPctVal) * 1.5, 4), 50)}%`,
                            }}
                            transition={{ duration: 0.35, delay: 0.05 }}
                            style={{
                              backgroundColor: thermal.barColor,
                            }}
                            title={`Growth: ${deltaKbVal >= 0 ? '+' : ''}${deltaKbVal} KB (${growthPctVal}%)`}
                          />
                        </div>

                        {/* Driver text */}
                        {pkg.growthReason && (
                          <div className="text-[10px] text-zinc-500 dark:text-neutral-400 pl-6 truncate">
                            {pkg.growthReason}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Thermal Legend & Help Footer */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-zinc-500 dark:text-neutral-400">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-zinc-400 font-bold uppercase text-[10px]">Thermal Scale:</span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  <TrendingDown size={10} /> {t('compiler.heatmapLegendCold')}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-neutral-800 text-zinc-500 dark:text-neutral-400 text-[10px] font-bold border border-zinc-200 dark:border-neutral-700">
                  {t('compiler.heatmapLegendNeutral')}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                  {t('compiler.heatmapLegendWarm')}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold border border-orange-500/20">
                  <TrendingUp size={10} /> {t('compiler.heatmapLegendHot')}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/30">
                  <Flame size={10} /> {t('compiler.heatmapLegendCritical')}
                </span>
              </div>

              <div className="text-[10px] text-zinc-400 dark:text-neutral-500">
                {t('compiler.heatmapInspectTooltip')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar & Filter Bento */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: View Switcher & Metric Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="p-1 rounded-2xl bg-zinc-100 dark:bg-neutral-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('treemap')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'treemap'
                  ? 'bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Grid size={13} />
              <span>{t('compiler.viewTreemap')}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <List size={13} />
              <span>{t('compiler.viewTable')}</span>
            </button>
            <button
              onClick={() => setViewMode('chunks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'chunks'
                  ? 'bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>{t('compiler.viewChunks')}</span>
            </button>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-zinc-400 dark:text-neutral-500 mr-1">Metric:</span>
            <button
              onClick={() => setMetricMode('sizeKb')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                metricMode === 'sizeKb'
                  ? 'bg-zinc-900 text-white dark:bg-neutral-800 dark:text-white'
                  : 'bg-zinc-100 dark:bg-neutral-800/60 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200'
              }`}
            >
              {t('compiler.metricRaw')}
            </button>
            <button
              onClick={() => setMetricMode('gzipKb')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                metricMode === 'gzipKb'
                  ? 'bg-zinc-900 text-white dark:bg-neutral-800 dark:text-white'
                  : 'bg-zinc-100 dark:bg-neutral-800/60 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200'
              }`}
            >
              {t('compiler.metricGzip')}
            </button>
            <button
              onClick={() => setMetricMode('brotliKb')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                metricMode === 'brotliKb'
                  ? 'bg-zinc-900 text-white dark:bg-neutral-800 dark:text-white'
                  : 'bg-zinc-100 dark:bg-neutral-800/60 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200'
              }`}
            >
              {t('compiler.metricBrotli')}
            </button>
          </div>
        </div>

        {/* Right: Search Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('compiler.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-1.5 rounded-2xl bg-zinc-100 dark:bg-neutral-800 border-none text-xs font-mono text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-600"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Zoom Trail */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-neutral-400">
          <button
            onClick={() => setZoomPath(['root'])}
            className={`font-bold hover:text-purple-500 transition-colors ${
              zoomPath.length === 1 ? 'text-purple-600 dark:text-purple-400' : ''
            }`}
          >
            Root Bundle
          </button>
          {zoomPath.length > 1 && (
            <>
              <ChevronRight size={13} className="text-zinc-400" />
              <span className="font-bold text-zinc-900 dark:text-white uppercase">
                {zoomPath[1]}
              </span>
              <button
                onClick={() => setZoomPath(['root'])}
                className="ml-2 px-2 py-0.5 rounded-lg bg-zinc-200 dark:bg-neutral-800 text-[10px] text-zinc-700 dark:text-neutral-300 hover:bg-zinc-300 flex items-center gap-1"
              >
                <RotateCcw size={10} />
                <span>{t('compiler.resetZoom')}</span>
              </button>
            </>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl font-bold transition-all text-xs shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-zinc-900 text-white dark:bg-neutral-800 dark:text-white'
                : 'bg-zinc-100 dark:bg-neutral-800/60 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200'
            }`}
          >
            {t('compiler.allCategories')}
          </button>
          {statsData?.categorySummary.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all text-xs shrink-0 flex items-center gap-1.5 ${
                selectedCategory === cat.category
                  ? 'bg-zinc-900 text-white dark:bg-neutral-800 dark:text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-neutral-800/60 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-75 font-normal">({cat.totalSizeKb} KB)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'treemap' && (
        <div
          ref={containerRef}
          className="relative p-3 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-lg overflow-hidden min-h-[500px]"
        >
          {/* Hint Overlay */}
          <div className="absolute top-4 right-4 z-10 pointer-events-none text-[11px] font-mono text-zinc-400 bg-zinc-900/80 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-zinc-800">
            {t('compiler.drillHint')}
          </div>

          {/* D3 SVG Canvas */}
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-auto block select-none"
          />

          {/* Dynamic Tooltip */}
          {hoveredNode && (
            <div
              className="absolute z-30 pointer-events-none p-3 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-700 shadow-2xl text-xs font-mono text-white min-w-[240px] max-w-[320px] transition-transform duration-75"
              style={{
                left: Math.min(tooltipPos.x + 16, dimensions.width - 260),
                top: Math.min(tooltipPos.y + 16, dimensions.height - 180),
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                <span className="font-bold text-white text-sm truncate">{hoveredNode.name}</span>
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                  style={{
                    backgroundColor: `${hoveredNode.color || '#3b82f6'}20`,
                    color: hoveredNode.color || '#38bdf8',
                  }}
                >
                  {hoveredNode.category || 'Package'}
                </span>
              </div>

              <div className="space-y-1.5 mt-2.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Parsed Raw Size:</span>
                  <span className="font-bold text-zinc-100">{hoveredNode.sizeKb} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Gzip Compressed:</span>
                  <span className="font-bold text-amber-400">{hoveredNode.gzipKb} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Brotli Compressed:</span>
                  <span className="font-bold text-emerald-400">{hoveredNode.brotliKb || (hoveredNode.gzipKb * 0.88).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Bundle Share:</span>
                  <span className="font-bold text-purple-400">{hoveredNode.percentage}%</span>
                </div>
                {hoveredNode.treeShakingEfficiencyPct && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Tree-Shaking:</span>
                    <span className="font-bold text-teal-400">{hoveredNode.treeShakingEfficiencyPct}% efficient</span>
                  </div>
                )}
                {hoveredNode.path && (
                  <div className="pt-1.5 border-t border-zinc-800/80 text-[10px] text-zinc-400 truncate">
                    {hoveredNode.path}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-neutral-800 text-zinc-400">
                <th className="pb-3 font-bold">Package / Module Name</th>
                <th className="pb-3 font-bold">Category</th>
                <th
                  onClick={() => toggleSort('sizeKb')}
                  className="pb-3 font-bold cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Parsed (KB)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('gzipKb')}
                  className="pb-3 font-bold cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Gzip (KB)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('percentage')}
                  className="pb-3 font-bold cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Share %</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('treeShakingEfficiencyPct')}
                  className="pb-3 font-bold cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Tree-Shaking</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="pb-3 font-bold">Chunk Priority</th>
                <th className="pb-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-neutral-800/60">
              {sortedPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-zinc-50 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 pr-3 font-bold text-zinc-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-purple-500" />
                      <span>{pkg.name}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-normal truncate max-w-xs">{pkg.path}</div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 uppercase">
                      {pkg.category}
                    </span>
                  </td>
                  <td className="py-3 pr-3 font-bold text-zinc-900 dark:text-white">{pkg.sizeKb} KB</td>
                  <td className="py-3 pr-3 font-bold text-amber-600 dark:text-amber-400">{pkg.gzipKb} KB</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-zinc-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.min(pkg.percentage * 2.5, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{pkg.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {pkg.treeShakingEfficiencyPct || 90}%
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        pkg.isInitial
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {pkg.isInitial ? 'Initial' : 'Lazy Chunk'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedPackageDetail(pkg)}
                      className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 hover:bg-purple-500 hover:text-white transition-all text-xs font-bold"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Code Splitting Chunks View */}
      {viewMode === 'chunks' && statsData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.chunks.map((chunk, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        chunk.type === 'initial'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : chunk.type === 'wasm'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : chunk.type === 'css'
                          ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {chunk.type} Chunk
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {chunk.modulesCount} modules
                    </span>
                  </div>

                  <h3 className="font-bold font-mono text-sm text-zinc-900 dark:text-white mt-3 truncate">
                    {chunk.name}
                  </h3>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-neutral-800 flex items-center justify-between font-mono text-xs">
                  <div>
                    <div className="text-zinc-400 text-[10px]">Uncompressed</div>
                    <div className="font-bold text-zinc-900 dark:text-white">{chunk.sizeKb} KB</div>
                  </div>
                  <div className="text-right">
                    <div className="text-zinc-400 text-[10px]">Gzip Transfer</div>
                    <div className="font-bold text-amber-500">{chunk.gzipKb} KB</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Package Detail Modal / Inspection Drawer */}
      <AnimatePresence>
        {selectedPackageDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedPackageDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="text-purple-500" size={20} />
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                    {selectedPackageDetail.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPackageDetail(null)}
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-neutral-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold transition-transform hover:scale-105 active:scale-95"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-600 dark:text-neutral-300 font-mono">
                {selectedPackageDetail.description || 'Module package bundle component'}
              </p>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200 dark:border-neutral-800">
                  <span className="text-zinc-400 text-[10px]">Raw Parsed Size</span>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                    {selectedPackageDetail.sizeKb} KB
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200 dark:border-neutral-800">
                  <span className="text-zinc-400 text-[10px]">Gzip Compressed</span>
                  <div className="text-sm font-bold text-amber-500 mt-0.5">
                    {selectedPackageDetail.gzipKb} KB
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200 dark:border-neutral-800">
                  <span className="text-zinc-400 text-[10px]">Bundle Share</span>
                  <div className="text-sm font-bold text-purple-500 mt-0.5">
                    {selectedPackageDetail.percentage}% of total
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200 dark:border-neutral-800">
                  <span className="text-zinc-400 text-[10px]">Tree-Shaking Score</span>
                  <div className="text-sm font-bold text-emerald-500 mt-0.5">
                    {selectedPackageDetail.treeShakingEfficiencyPct || 92}%
                  </div>
                </div>
              </div>

              {/* Build Growth Comparison Diagnosis */}
              {selectedPackageDetail.previousSizeKb !== undefined && (
                <div className="p-3.5 rounded-2xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 text-xs">
                      <Thermometer size={14} />
                      <span>Build-to-Build Delta Inspection</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      (selectedPackageDetail.growthPercentage ?? 0) >= 20
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : (selectedPackageDetail.growthPercentage ?? 0) >= 10
                        ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                        : (selectedPackageDetail.growthPercentage ?? 0) < 0
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-200/60 dark:bg-neutral-700 text-zinc-600 dark:text-neutral-300'
                    }`}>
                      {(selectedPackageDetail.deltaKb ?? 0) >= 0 ? `+${selectedPackageDetail.deltaKb} KB` : `${selectedPackageDetail.deltaKb} KB`} (
                      {(selectedPackageDetail.growthPercentage ?? 0) >= 0 ? `+${selectedPackageDetail.growthPercentage}%` : `${selectedPackageDetail.growthPercentage}%`}
                      )
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-neutral-300">
                    <span>Previous: <strong>{selectedPackageDetail.previousSizeKb} KB</strong></span>
                    <span>→</span>
                    <span>Current: <strong>{selectedPackageDetail.sizeKb} KB</strong></span>
                  </div>

                  {selectedPackageDetail.growthReason && (
                    <div className="pt-1.5 border-t border-orange-500/15 text-[11px] text-zinc-700 dark:text-neutral-200">
                      <span className="text-zinc-400">Driver: </span>
                      {selectedPackageDetail.growthReason}
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 rounded-2xl bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-800 space-y-1">
                <div className="text-zinc-500 text-[10px]">FILE PATH</div>
                <div className="text-emerald-400 truncate">{selectedPackageDetail.path}</div>
                {selectedPackageDetail.version && (
                  <div className="text-zinc-400 text-[11px]">Version: {selectedPackageDetail.version}</div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedPackageDetail(null)}
                  className="px-5 py-2 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-mono text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

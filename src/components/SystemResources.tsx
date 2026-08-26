import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  Cpu,
  Database,
  Flame,
  Gauge,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Server,
  Clock,
  HardDrive
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion } from 'motion/react';

interface ResourceDataPoint {
  time: Date;
  cpuTotal: number;
  cpuUser: number;
  cpuSystem: number;
  heapUsed: number; // in MB
  heapTotal: number; // in MB
  rss: number; // in MB
  eventLoopDelay: number; // in ms
}

interface CoreLoad {
  id: number;
  load: number;
}

export const SystemResources: React.FC = () => {
  const { t, language } = useI18n();

  // State
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isStressMode, setIsStressMode] = useState<boolean>(false);
  const [samplingInterval, setSamplingInterval] = useState<number>(1000);
  const [gcCount, setGcCount] = useState<number>(3);
  const [lastGcReclaimed, setLastGcReclaimed] = useState<number>(142);
  const [showGcFlash, setShowGcFlash] = useState<boolean>(false);

  // Simulation buffer (Last 30 data points)
  const [history, setHistory] = useState<ResourceDataPoint[]>(() => {
    const now = Date.now();
    const initial: ResourceDataPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const tPoint = new Date(now - i * 1000);
      const baseCpu = 15 + Math.sin(i * 0.4) * 8 + Math.random() * 5;
      initial.push({
        time: tPoint,
        cpuTotal: Math.round(baseCpu),
        cpuUser: Math.round(baseCpu * 0.7),
        cpuSystem: Math.round(baseCpu * 0.3),
        heapUsed: Math.round(180 + Math.sin(i * 0.2) * 25 + Math.random() * 10),
        heapTotal: 512,
        rss: Math.round(340 + Math.sin(i * 0.2) * 15 + Math.random() * 8),
        eventLoopDelay: +(1.2 + Math.random() * 0.6).toFixed(2),
      });
    }
    return initial;
  });

  // Virtual Core states (4 cores)
  const [cores, setCores] = useState<CoreLoad[]>([
    { id: 0, load: 22 },
    { id: 1, load: 18 },
    { id: 2, load: 29 },
    { id: 3, load: 14 },
  ]);

  // SVG Chart Container Refs
  const cpuChartRef = useRef<SVGSVGElement | null>(null);
  const memoryChartRef = useRef<SVGSVGElement | null>(null);
  const donutChartRef = useRef<SVGSVGElement | null>(null);

  // Current latest values
  const latest = history[history.length - 1] || {
    cpuTotal: 22,
    cpuUser: 15,
    cpuSystem: 7,
    heapUsed: 195,
    heapTotal: 512,
    rss: 350,
    eventLoopDelay: 1.4,
  };

  // Peak statistics
  const peakCpu = Math.max(...history.map((d) => d.cpuTotal), 0);
  const avgCpu = Math.round(
    history.reduce((acc, curr) => acc + curr.cpuTotal, 0) / (history.length || 1)
  );
  const peakHeap = Math.max(...history.map((d) => d.heapUsed), 0);

  // Status computation
  const systemHealth = latest.cpuTotal > 80 || latest.heapUsed > 420
    ? 'critical'
    : latest.cpuTotal > 50 || latest.heapUsed > 300
    ? 'warning'
    : 'healthy';

  // Live simulation tick timer
  useEffect(() => {
    if (!isStreaming) return;

    const timer = setInterval(() => {
      setHistory((prev) => {
        const last = prev[prev.length - 1];
        const now = new Date();

        let newCpu: number;
        let newHeap: number;
        let newRss: number;
        let newDelay: number;

        if (isStressMode) {
          // High stress simulation (simulating 10,000 req/sec SSR load)
          newCpu = Math.min(98, Math.round(75 + Math.random() * 22));
          newHeap = Math.min(480, Math.round(last.heapUsed + Math.random() * 18));
          newRss = Math.min(780, Math.round(last.rss + Math.random() * 12));
          newDelay = +(4.5 + Math.random() * 6.2).toFixed(2);
        } else {
          // Normal Next.js 16.3 + Turbopack idle/active load
          const delta = (Math.random() - 0.48) * 8;
          newCpu = Math.max(8, Math.min(65, Math.round(last.cpuTotal + delta)));
          
          // Organic gradual heap allocation before GC
          const heapGrowth = Math.random() > 0.85 ? -15 : Math.random() * 6;
          newHeap = Math.max(120, Math.min(380, Math.round(last.heapUsed + heapGrowth)));
          newRss = Math.max(280, Math.min(520, Math.round(last.rss + heapGrowth * 0.4)));
          newDelay = +(1.1 + Math.random() * 0.8).toFixed(2);
        }

        const point: ResourceDataPoint = {
          time: now,
          cpuTotal: newCpu,
          cpuUser: Math.round(newCpu * 0.72),
          cpuSystem: Math.round(newCpu * 0.28),
          heapUsed: newHeap,
          heapTotal: 512,
          rss: newRss,
          eventLoopDelay: newDelay,
        };

        const updated = [...prev.slice(1), point];
        return updated;
      });

      // Update virtual multi-cores
      setCores((prev) =>
        prev.map((c) => {
          const multiplier = isStressMode ? 2.5 : 1;
          const variance = (Math.random() - 0.5) * 16;
          const target = Math.max(5, Math.min(99, Math.round((20 + variance) * multiplier)));
          return { id: c.id, load: target };
        })
      );
    }, samplingInterval);

    return () => clearInterval(timer);
  }, [isStreaming, isStressMode, samplingInterval]);

  // Garbage Collection trigger simulation
  const handleTriggerGc = () => {
    setShowGcFlash(true);
    setTimeout(() => setShowGcFlash(false), 800);

    const reclaimed = Math.round(60 + Math.random() * 110);
    setLastGcReclaimed(reclaimed);
    setGcCount((c) => c + 1);

    setHistory((prev) => {
      return prev.map((p, idx) => {
        if (idx >= prev.length - 3) {
          const reducedHeap = Math.max(110, p.heapUsed - reclaimed);
          const reducedRss = Math.max(250, p.rss - reclaimed * 0.5);
          return {
            ...p,
            heapUsed: Math.round(reducedHeap),
            rss: Math.round(reducedRss),
          };
        }
        return p;
      });
    });
  };

  // Reset telemetry
  const handleResetMetrics = () => {
    const now = Date.now();
    const resetData: ResourceDataPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      resetData.push({
        time: new Date(now - i * 1000),
        cpuTotal: 18,
        cpuUser: 13,
        cpuSystem: 5,
        heapUsed: 165,
        heapTotal: 512,
        rss: 320,
        eventLoopDelay: 1.2,
      });
    }
    setHistory(resetData);
  };

  // Render D3 CPU Chart
  useEffect(() => {
    if (!cpuChartRef.current || history.length === 0) return;

    const svg = d3.select(cpuChartRef.current);
    svg.selectAll('*').remove();

    const width = 520;
    const height = 180;
    const margin = { top: 15, right: 20, bottom: 25, left: 35 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradient definitions
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'cpu-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', isStressMode ? '#f43f5e' : '#10b981')
      .attr('stop-opacity', 0.45);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', isStressMode ? '#f43f5e' : '#10b981')
      .attr('stop-opacity', 0.0);

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(history, (d) => d.time) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Grid lines
    const yGrid = d3.axisLeft(yScale).ticks(4).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08);
    g.selectAll('.domain').remove();

    // D3 Area
    const area = d3
      .area<ResourceDataPoint>()
      .x((d) => xScale(d.time))
      .y0(innerHeight)
      .y1((d) => yScale(d.cpuTotal))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(history)
      .attr('fill', 'url(#cpu-area-gradient)')
      .attr('d', area);

    // D3 Line
    const line = d3
      .line<ResourceDataPoint>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.cpuTotal))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', isStressMode ? '#f43f5e' : '#10b981')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // D3 X-Axis & Y-Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(4)
      .tickFormat((d) => d3.timeFormat('%H:%M:%S')(d as Date));

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d) => `${d}%`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6)
      .attr('font-size', '9px')
      .attr('font-family', 'monospace');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6)
      .attr('font-size', '9px')
      .attr('font-family', 'monospace');

    g.selectAll('.domain').remove();
    g.selectAll('.tick line').attr('stroke', 'currentColor').attr('stroke-opacity', 0.15);

    // Live Pulse Dot on latest point
    const latestPoint = history[history.length - 1];
    if (latestPoint) {
      const cx = xScale(latestPoint.time);
      const cy = yScale(latestPoint.cpuTotal);

      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 6)
        .attr('fill', isStressMode ? '#f43f5e' : '#10b981')
        .attr('opacity', 0.3)
        .attr('class', 'animate-ping');

      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 4)
        .attr('fill', isStressMode ? '#f43f5e' : '#10b981')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5);
    }
  }, [history, isStressMode]);

  // Render D3 Memory Chart
  useEffect(() => {
    if (!memoryChartRef.current || history.length === 0) return;

    const svg = d3.select(memoryChartRef.current);
    svg.selectAll('*').remove();

    const width = 520;
    const height = 180;
    const margin = { top: 15, right: 20, bottom: 25, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradient definitions
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'memory-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#38bdf8')
      .attr('stop-opacity', 0.45);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#38bdf8')
      .attr('stop-opacity', 0.0);

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(history, (d) => d.time) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 512]) // 512 MB Max Heap
      .range([innerHeight, 0]);

    // Grid lines
    const yGrid = d3.axisLeft(yScale).ticks(4).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08);
    g.selectAll('.domain').remove();

    // Area Heap Used
    const area = d3
      .area<ResourceDataPoint>()
      .x((d) => xScale(d.time))
      .y0(innerHeight)
      .y1((d) => yScale(d.heapUsed))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(history)
      .attr('fill', 'url(#memory-area-gradient)')
      .attr('d', area);

    // Line RSS (dashed sky)
    const rssLine = d3
      .line<ResourceDataPoint>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(Math.min(510, d.rss * 0.7)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', '#a855f7')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .attr('d', rssLine);

    // Line Heap Used (solid cyan)
    const heapLine = d3
      .line<ResourceDataPoint>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.heapUsed))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', '#0284c7')
      .attr('stroke-width', 2.5)
      .attr('d', heapLine);

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(4)
      .tickFormat((d) => d3.timeFormat('%H:%M:%S')(d as Date));

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d) => `${d}M`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6)
      .attr('font-size', '9px')
      .attr('font-family', 'monospace');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6)
      .attr('font-size', '9px')
      .attr('font-family', 'monospace');

    g.selectAll('.domain').remove();
    g.selectAll('.tick line').attr('stroke', 'currentColor').attr('stroke-opacity', 0.15);

    // Marker on latest
    const latestPoint = history[history.length - 1];
    if (latestPoint) {
      const cx = xScale(latestPoint.time);
      const cy = yScale(latestPoint.heapUsed);

      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 4)
        .attr('fill', '#0284c7')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5);
    }
  }, [history]);

  // Render D3 Donut Gauge (V8 Heap Usage Breakdown)
  useEffect(() => {
    if (!donutChartRef.current) return;

    const svg = d3.select(donutChartRef.current);
    svg.selectAll('*').remove();

    const width = 160;
    const height = 160;
    const radius = Math.min(width, height) / 2 - 10;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const heapUsed = latest.heapUsed;
    const heapFree = Math.max(0, 512 - heapUsed);

    const pieData = [
      { name: 'Used', value: heapUsed, color: '#38bdf8' },
      { name: 'Free', value: heapFree, color: 'rgba(150, 150, 150, 0.15)' },
    ];

    const pie = d3.pie<any>().value((d) => d.value).sort(null);
    const arc = d3.arc<any>().innerRadius(radius - 14).outerRadius(radius).cornerRadius(4);

    g.selectAll('path')
      .data(pie(pieData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', 'transparent');

    // Inner Percentage text
    const percentage = Math.round((heapUsed / 512) * 100);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .attr('fill', 'currentColor')
      .text(`${percentage}%`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.4em')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6)
      .text('HEAP ALLOC');
  }, [latest.heapUsed]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-2xs space-y-6">
      {/* Top Header Row with Status & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 dark:border-neutral-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Activity size={17} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {t('resources.title')}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              {t('resources.badge')}
            </span>

            {/* Health Badge */}
            <span
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border transition-colors ${
                systemHealth === 'critical'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : systemHealth === 'warning'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              {systemHealth === 'critical' ? (
                <>
                  <AlertTriangle size={12} />
                  <span>{t('resources.critical')}</span>
                </>
              ) : systemHealth === 'warning' ? (
                <>
                  <Activity size={12} />
                  <span>{t('resources.warning')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} />
                  <span>{t('resources.healthy')}</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-neutral-400">
            {t('resources.desc')}
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stress mode button */}
          <button
            id="resources-stress-btn"
            onClick={() => setIsStressMode(!isStressMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-xs ${
              isStressMode
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700'
            }`}
          >
            <Flame size={13} className={isStressMode ? 'animate-bounce' : ''} />
            <span>{t('resources.stressToggle')}</span>
          </button>

          {/* Trigger GC button */}
          <button
            id="resources-trigger-gc-btn"
            onClick={handleTriggerGc}
            title={t('resources.triggerGc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-mono font-bold border border-sky-500/20 transition-all cursor-pointer ${
              showGcFlash ? 'scale-105 bg-sky-500 text-white dark:text-white' : ''
            }`}
          >
            <Sparkles size={13} />
            <span>{t('resources.triggerGc')}</span>
          </button>

          {/* Sampling Rate select */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-neutral-800 text-xs font-mono text-zinc-600 dark:text-neutral-300">
            <span className="text-[11px] text-zinc-400">{t('resources.samplingRate')}</span>
            <select
              value={samplingInterval}
              onChange={(e) => setSamplingInterval(Number(e.target.value))}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              <option value={500}>500ms</option>
              <option value={1000}>1.0s</option>
              <option value={2000}>2.0s</option>
            </select>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            title={isStreaming ? t('resources.pauseStream') : t('resources.resumeStream')}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            {isStreaming ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Reset Metrics */}
          <button
            onClick={handleResetMetrics}
            title="Reset telemetry"
            className="p-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 hover:bg-zinc-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Key Metric Highlights Bento Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        {/* CPU Total */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span>CPU TOTAL</span>
            <Cpu size={12} className="text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-white flex items-baseline gap-1">
            <span>{latest.cpuTotal}%</span>
            <span className="text-[10px] text-zinc-400 font-normal">({avgCpu}% avg)</span>
          </div>
          <div className="text-[10px] text-zinc-500 dark:text-neutral-400 truncate">
            User: {latest.cpuUser}% • Sys: {latest.cpuSystem}%
          </div>
        </div>

        {/* V8 Heap Used */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span>V8 HEAP USED</span>
            <Database size={12} className="text-sky-500" />
          </div>
          <div className="text-lg font-bold text-sky-600 dark:text-sky-400">
            {latest.heapUsed} <span className="text-xs font-normal">MB</span>
          </div>
          <div className="text-[10px] text-zinc-500 dark:text-neutral-400">
            Limit: 512 MB ({Math.round((latest.heapUsed / 512) * 100)}%)
          </div>
        </div>

        {/* Node.js RSS */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span>NODE.JS RSS</span>
            <Layers size={12} className="text-purple-500" />
          </div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {latest.rss} <span className="text-xs font-normal">MB</span>
          </div>
          <div className="text-[10px] text-zinc-500 dark:text-neutral-400">
            Resident Set Size
          </div>
        </div>

        {/* Event Loop Delay */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span>EVENT LOOP</span>
            <Clock size={12} className="text-amber-500" />
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-white">
            {latest.eventLoopDelay} <span className="text-xs font-normal">ms</span>
          </div>
          <div className="text-[10px] text-emerald-500 dark:text-emerald-400">
            &lt; 5ms Target (Optimal)
          </div>
        </div>

        {/* Turbopack Workers */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span>TURBOPACK</span>
            <Zap size={12} className="text-teal-500" />
          </div>
          <div className="text-lg font-bold text-teal-600 dark:text-teal-400">
            6 <span className="text-xs font-normal">Workers</span>
          </div>
          <div className="text-[10px] text-zinc-500 dark:text-neutral-400">
            Persistent Cache: 94%
          </div>
        </div>

        {/* GC Sweeps */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span>GC SWEEPS</span>
            <Sparkles size={12} className="text-indigo-500" />
          </div>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {gcCount} <span className="text-xs font-normal">runs</span>
          </div>
          <div className="text-[10px] text-zinc-500 dark:text-neutral-400">
            -{lastGcReclaimed}MB last sweep
          </div>
        </div>
      </div>

      {/* 2-Column D3 Visualization Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Column: CPU Real-time D3 Area Chart & Cores (7 cols) */}
        <div className="xl:col-span-7 p-5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={15} className={isStressMode ? 'text-rose-500' : 'text-emerald-500'} />
              <h4 className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                {t('resources.cpuTitle')}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live Rolling 30s
              </span>
              <span>Peak: {peakCpu}%</span>
            </div>
          </div>

          {/* D3 CPU SVG Chart */}
          <div className="w-full overflow-hidden flex items-center justify-center text-zinc-600 dark:text-zinc-400">
            <svg
              ref={cpuChartRef}
              viewBox="0 0 520 180"
              className="w-full h-auto max-h-48 select-none"
            />
          </div>

          {/* Multi-core Load distribution bar */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-neutral-800/80 font-mono text-[11px]">
            <div className="flex items-center justify-between text-zinc-500 dark:text-neutral-400 text-[10px]">
              <span>{t('resources.cores')} (Virtual 4-Core Worker Allocation)</span>
              <span>{isStressMode ? 'Heavy Parallelism' : 'Balanced Threading'}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cores.map((c) => (
                <div
                  key={c.id}
                  className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 space-y-1"
                >
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Core #{c.id + 1}</span>
                    <strong className="text-zinc-800 dark:text-neutral-200">{c.load}%</strong>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        c.load > 80
                          ? 'bg-rose-500'
                          : c.load > 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${c.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Memory & V8 Heap D3 Chart + Donut (5 cols) */}
        <div className="xl:col-span-5 p-5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={15} className="text-sky-500" />
              <h4 className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                {t('resources.memoryTitle')}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Heap
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                RSS
              </span>
            </div>
          </div>

          {/* D3 Memory SVG Chart */}
          <div className="w-full overflow-hidden flex items-center justify-center text-zinc-600 dark:text-zinc-400">
            <svg
              ref={memoryChartRef}
              viewBox="0 0 520 180"
              className="w-full h-auto max-h-48 select-none"
            />
          </div>

          {/* D3 Donut Gauge & Allocation Stats */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-200/60 dark:border-neutral-800/80 font-mono text-xs">
            {/* D3 Donut */}
            <div className="flex-shrink-0 text-zinc-800 dark:text-neutral-200">
              <svg
                ref={donutChartRef}
                viewBox="0 0 160 160"
                className="w-24 h-24 select-none"
              />
            </div>

            {/* Heap detailed stats */}
            <div className="flex-1 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-zinc-500 dark:text-neutral-400">
                <span>{t('resources.heapUsed')}:</span>
                <strong className="text-sky-600 dark:text-sky-400">{latest.heapUsed} MB</strong>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-neutral-400">
                <span>{t('resources.heapTotal')}:</span>
                <strong className="text-zinc-800 dark:text-neutral-200">512 MB</strong>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-neutral-400">
                <span>{t('resources.rss')}:</span>
                <strong className="text-purple-500">{latest.rss} MB</strong>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-neutral-400">
                <span>{t('resources.peakHeap')}:</span>
                <strong className="text-zinc-800 dark:text-neutral-200">{peakHeap} MB</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

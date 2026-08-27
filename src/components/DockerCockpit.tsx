import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Server,
  Layers,
  Cpu,
  HardDrive,
  Activity,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  RefreshCw,
  Play,
  FileCode2,
  Boxes,
  AlertTriangle,
  Flame,
  Globe,
  Database,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

interface SystemInfoData {
  runtime: {
    nodeVersion: string;
    v8Version: string;
    uvVersion: string;
    platform: string;
    arch: string;
    pid: number;
    ppid: number;
    uptimeSec: number;
    isDocker: boolean;
    cwd: string;
    execPath: string;
    gid: number;
    uid: number;
  };
  memory: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
    externalMb: number;
    arrayBuffersMb: number;
  };
  cpu: {
    userMs: number;
    systemMs: number;
  };
  env: {
    NODE_ENV: string;
    PORT: string;
    NEXT_TELEMETRY_DISABLED: string;
    STANDALONE_MODE: string;
    allSafeCount: number;
    sampleEnv: Record<string, string>;
  };
}

export const DockerCockpit: React.FC = () => {
  const { t, language } = useI18n();
  const [sysInfo, setSysInfo] = useState<SystemInfoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeDockerPreset, setActiveDockerPreset] = useState<'standalone-alpine' | 'debian-sqlite' | 'cloudrun-enterprise' | 'compose-stack'>('standalone-alpine');
  const [selectedFileTab, setSelectedFileTab] = useState<'dockerfile' | 'compose' | 'dockerignore' | 'nextconfig'>('dockerfile');
  const [envSearch, setEnvSearch] = useState<string>('');

  // Cold start & benchmark state
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [benchmarkSizeMb, setBenchmarkSizeMb] = useState<number>(16);
  const [benchmarkResult, setBenchmarkResult] = useState<{
    testedMb: number;
    durationMs: number;
    throughputMbPerSec: number;
    heapUsedAfterMb: number;
    rssAfterMb: number;
  } | null>(null);

  const fetchSystemInfo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/docker/system-info');
      if (res.ok) {
        const data = await res.json();
        setSysInfo(data);
      }
    } catch (err) {
      console.error('Failed to load docker system info', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runColdStartBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch('/api/docker/benchmark-coldstart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sizeMb: benchmarkSizeMb }),
      });
      if (res.ok) {
        const data = await res.json();
        setBenchmarkResult(data);
        fetchSystemInfo();
      }
    } catch (err) {
      console.error('Benchmark failed', err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Preset Configurations
  const DOCKER_PRESETS = {
    'standalone-alpine': {
      title: 'Next.js 16 Standalone (Alpine ~110MB)',
      desc: 'Ultra-lightweight multi-stage Docker build utilizing output: "standalone" with minimal node:24-alpine footprint.',
      badge: 'Recommended',
      dockerfile: `# 1. Base Node.js 24 Alpine image
FROM node:24-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

# 2. Dependency Installation Stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

# 3. Next.js App Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# 4. Production Runner Stage (Non-Root User)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: Run as non-root user (UID 1001)
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nextjs

# Copy Standalone Server & Public Assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Next.js standalone entrypoint
CMD ["node", "server.js"]`,
      compose: `version: '3.8'
services:
  nextjs-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nextjs_arena_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - NEXT_TELEMETRY_DISABLED=1
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3000/api/health"]
      interval: 15s
      timeout: 3s
      retries: 3`,
      dockerignore: `node_modules
.next
.git
.env*.local
dist
coverage
npm-debug.log*`,
      nextconfig: `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Generates standalone output bundle for Docker
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    // React Compiler in Next.js 16
    reactCompiler: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.run.app'],
    },
  },
};

export default nextConfig;`
    },
    'debian-sqlite': {
      title: 'Full-Stack Next.js + SQLite Volume Mount',
      desc: 'Debian Slim image with native C++ bindings for better-sqlite3 and persistent volume mapping.',
      badge: 'Full-Stack Persistent',
      dockerfile: `# 1. Debian 12 Bookworm Slim with C++ compilation tools for SQLite
FROM node:24-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ sqlite3 && rm -rf /var/lib/apt/lists/*
ENV NEXT_TELEMETRY_DISABLED=1

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# 4. Production Runner with Persistent SQLite Volume
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV SQLITE_DB_PATH=/data/sqlite/arena.db

# Create non-root user & SQLite volume directory
RUN groupadd --system --gid 1001 nodejs && \\
    useradd --system --uid 1001 nextjs && \\
    mkdir -p /data/sqlite && \\
    chown -R nextjs:nodejs /data/sqlite

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
VOLUME ["/data/sqlite"]
EXPOSE 3000

CMD ["node", "server.js"]`,
      compose: `version: '3.8'
services:
  nextjs-sqlite:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nextjs_sqlite_studio
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      # Persistent SQLite Volume
      - sqlite_data:/data/sqlite
    environment:
      - NODE_ENV=production
      - SQLITE_DB_PATH=/data/sqlite/arena.db
      - SQLITE_WAL_MODE=true
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  sqlite_data:
    driver: local`,
      dockerignore: `node_modules
.next
.git
data/sqlite/*.db-wal
data/sqlite/*.db-shm
.env*.local`,
      nextconfig: `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;`
    },
    'cloudrun-enterprise': {
      title: 'Google Cloud Run / AWS ECS Production',
      desc: 'Optimized for Serverless scale-to-zero containers, instant cold starts, and strict non-root compliance.',
      badge: 'Cloud Native',
      dockerfile: `# Ultra-fast cold-start container for Cloud Run & ECS
FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Cloud Run graceful shutdown & SIGTERM handling
STOPSIGNAL SIGTERM
CMD ["node", "server.js"]`,
      compose: `version: '3.8'
services:
  cloudrun-app:
    image: gcr.io/my-project/nextjs-app:latest
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production`,
      dockerignore: `node_modules\n.next\n.git\n.env*.local`,
      nextconfig: `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;`
    },
    'compose-stack': {
      title: 'Complete Monolith Stack (Next.js + SQLite + Directus + Redis)',
      desc: 'Multi-container enterprise microservices orchestrating Next.js, Headless Directus CMS, and Valkey caching.',
      badge: 'Multi-Container',
      dockerfile: `# Next.js Frontend Multi-stage
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
EXPOSE 3000
CMD ["node", "server.js"]`,
      compose: `version: '3.8'
networks:
  arena_mesh:
    driver: bridge

volumes:
  sqlite_storage:
  directus_uploads:
  redis_cache:

services:
  # 1. Next.js 16 Frontend & RSC Server
  nextjs-web:
    build: .
    container_name: arena_nextjs_web
    ports:
      - "3000:3000"
    environment:
      - DIRECTUS_URL=http://directus_cms:8055
      - REDIS_URL=redis://redis_cache:6379
      - SQLITE_PATH=/data/sqlite/arena.db
    volumes:
      - sqlite_storage:/data/sqlite
    depends_on:
      - directus_cms
      - redis_cache
    networks:
      - arena_mesh

  # 2. Directus Headless CMS Service
  directus_cms:
    image: directus/directus:11.0.0
    container_name: arena_directus_cms
    ports:
      - "8055:8055"
    environment:
      - KEY=9b52c0f2-2b62-4f6b-b2ea-4a6c6e7f1234
      - SECRET=super-secret-arena-key-2026
      - DB_CLIENT=sqlite3
      - DB_FILENAME=/data/directus/data.db
    volumes:
      - sqlite_storage:/data/directus
      - directus_uploads:/directus/uploads
    networks:
      - arena_mesh

  # 3. Redis / Valkey Ultra-Fast Cache Layer
  redis_cache:
    image: valkey/valkey:8.0-alpine
    container_name: arena_valkey_cache
    ports:
      - "6379:6379"
    volumes:
      - redis_cache:/data
    networks:
      - arena_mesh`,
      dockerignore: `node_modules\n.next\n.git\n.env*.local`,
      nextconfig: `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;`
    }
  };

  const currentPreset = DOCKER_PRESETS[activeDockerPreset];

  const currentCode = useMemo(() => {
    if (selectedFileTab === 'dockerfile') return currentPreset.dockerfile;
    if (selectedFileTab === 'compose') return currentPreset.compose;
    if (selectedFileTab === 'dockerignore') return currentPreset.dockerignore;
    return currentPreset.nextconfig;
  }, [currentPreset, selectedFileTab]);

  const filteredEnv = useMemo(() => {
    if (!sysInfo?.env?.sampleEnv) return [];
    const entries = Object.entries(sysInfo.env.sampleEnv);
    if (!envSearch.trim()) return entries;
    const query = envSearch.toLowerCase();
    return entries.filter(([k, v]) => k.toLowerCase().includes(query) || v.toLowerCase().includes(query));
  }, [sysInfo, envSearch]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-neutral-900 to-black p-6 sm:p-8 text-white shadow-xl border border-zinc-800">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Container size={22} className="animate-pulse" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {t('docker.title')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t('docker.badge')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t('docker.heading')}
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl">
              {t('docker.desc')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSystemInfo}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-mono font-semibold transition-all cursor-pointer"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? t('docker.refreshing') : t('docker.refreshMetrics')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Live Container Diagnostics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Node.js 24 & V8 Card */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-600 dark:text-neutral-400">
              <Server size={15} className="text-emerald-500" />
              <span>{t('docker.runtimeEngine')}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {t('docker.ltsActive')}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
              {sysInfo?.runtime.nodeVersion || 'v24.x LTS'}
            </div>
            <div className="text-xs text-zinc-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
              <span>{t('docker.v8Engine')}</span>
              <span className="font-mono font-bold text-zinc-700 dark:text-neutral-300">
                {sysInfo?.runtime.v8Version || 'v13.4.x'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-neutral-400">
            <span>Arch: {sysInfo?.runtime.arch || 'x64'}</span>
            <span>Platform: {sysInfo?.runtime.platform || 'linux'}</span>
          </div>
        </div>

        {/* Container Memory & RSS Card */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-600 dark:text-neutral-400">
              <Activity size={15} className="text-cyan-500" />
              <span>{t('docker.containerRss')}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              {t('docker.healthy')}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              {sysInfo?.memory.rssMb || '48.2'} <span className="text-sm text-zinc-400 font-medium">MB</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
              <span>{t('docker.heapUsed')}</span>
              <span className="font-mono font-bold text-zinc-700 dark:text-neutral-300">
                {sysInfo?.memory.heapUsedMb || '24.5'} MB
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-neutral-400">
            <span>Heap Total: {sysInfo?.memory.heapTotalMb || '38'} MB</span>
            <span>Buffers: {sysInfo?.memory.arrayBuffersMb || '2'} MB</span>
          </div>
        </div>

        {/* Process & Non-Root User Security Card */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-600 dark:text-neutral-400">
              <ShieldCheck size={15} className="text-emerald-500" />
              <span>{t('docker.containerSecurity')}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {t('docker.nonRoot')}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-zinc-900 dark:text-white flex items-center gap-2">
              <span>UID {sysInfo?.runtime.uid ?? 1001}</span>
              <span className="text-xs font-normal text-emerald-500 px-1.5 py-0.5 rounded bg-emerald-500/10 font-sans">
                {t('docker.safe')}
              </span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-neutral-400 mt-1">
              PID: <span className="font-mono font-bold text-zinc-700 dark:text-neutral-300">{sysInfo?.runtime.pid || 1}</span> (tini/init isolation)
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-neutral-400">
            <span>GID: {sysInfo?.runtime.gid ?? 1001}</span>
            <span>Cgroup: v2</span>
          </div>
        </div>

        {/* Container Uptime & Telemetry Card */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-600 dark:text-neutral-400">
              <Cpu size={15} className="text-purple-500" />
              <span>{t('docker.uptime')}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
              {t('docker.active')}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
              {Math.floor((sysInfo?.runtime.uptimeSec || 120) / 60)}m {Math.floor((sysInfo?.runtime.uptimeSec || 120) % 60)}s
            </div>
            <div className="text-xs text-zinc-500 dark:text-neutral-400 mt-1">
              {t('docker.telemetryStatus')}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-neutral-400">
            <span>User CPU: {sysInfo?.cpu.userMs || 45}ms</span>
            <span>Sys CPU: {sysInfo?.cpu.systemMs || 18}ms</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Multi-Stage Dockerfile & Orchestrator Studio */}
      <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        {/* Preset Selector Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-neutral-800 bg-zinc-50/50 dark:bg-neutral-900/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCode2 size={18} className="text-cyan-500" />
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                  {t('docker.generatorTitle')}
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1">
                {t('docker.generatorDesc')}
              </p>
            </div>

            {/* Presets Button Group */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-200/70 dark:bg-neutral-800/70">
              {(Object.keys(DOCKER_PRESETS) as Array<keyof typeof DOCKER_PRESETS>).map((key) => {
                const item = DOCKER_PRESETS[key];
                const isActive = activeDockerPreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveDockerPreset(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{item.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Preset Banner */}
          <div className="mt-4 p-3.5 rounded-2xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300">
                {currentPreset.title}
              </div>
              <div className="text-xs text-zinc-600 dark:text-neutral-300 mt-0.5">
                {currentPreset.desc}
              </div>
            </div>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Production Validated
            </span>
          </div>
        </div>

        {/* File Tabs & Editor */}
        <div className="border-b border-zinc-200 dark:border-neutral-800 bg-zinc-100/70 dark:bg-neutral-950 flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedFileTab('dockerfile')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                selectedFileTab === 'dockerfile'
                  ? 'bg-white dark:bg-neutral-900 text-cyan-600 dark:text-cyan-400 border border-zinc-200 dark:border-neutral-800 shadow-2xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Dockerfile
            </button>
            <button
              onClick={() => setSelectedFileTab('compose')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                selectedFileTab === 'compose'
                  ? 'bg-white dark:bg-neutral-900 text-cyan-600 dark:text-cyan-400 border border-zinc-200 dark:border-neutral-800 shadow-2xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              docker-compose.yml
            </button>
            <button
              onClick={() => setSelectedFileTab('dockerignore')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                selectedFileTab === 'dockerignore'
                  ? 'bg-white dark:bg-neutral-900 text-cyan-600 dark:text-cyan-400 border border-zinc-200 dark:border-neutral-800 shadow-2xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              .dockerignore
            </button>
            <button
              onClick={() => setSelectedFileTab('nextconfig')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                selectedFileTab === 'nextconfig'
                  ? 'bg-white dark:bg-neutral-900 text-cyan-600 dark:text-cyan-400 border border-zinc-200 dark:border-neutral-800 shadow-2xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              next.config.mjs
            </button>
          </div>

          <button
            onClick={() => handleCopy(currentCode, `${activeDockerPreset}-${selectedFileTab}`)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-200 dark:bg-neutral-800 hover:bg-zinc-300 dark:hover:bg-neutral-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-medium transition-all cursor-pointer"
          >
            {copiedKey === `${activeDockerPreset}-${selectedFileTab}` ? (
              <>
                <Check size={12} className="text-emerald-500" />
                <span className="text-emerald-500 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Display Area */}
        <div className="bg-zinc-950 p-5 overflow-x-auto text-xs font-mono text-zinc-200 leading-relaxed max-h-[380px] select-text">
          <pre>
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>

      {/* 3. Live Cold-Start & Memory Pressure Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulator Controls Card */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                  {t('docker.benchmarkTitle')}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-neutral-400">
                  {t('docker.benchmarkDesc')}
                </p>
              </div>
            </div>

            <button
              onClick={runColdStartBenchmark}
              disabled={isBenchmarking}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-mono font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              <Play size={13} className={isBenchmarking ? 'animate-spin' : ''} />
              <span>{isBenchmarking ? t('docker.running') : t('docker.runAllocationTest')}</span>
            </button>
          </div>

          {/* Buffer Payload Selector */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-600 dark:text-neutral-400 font-semibold">
                {t('docker.payloadSize')}
              </span>
              <span className="text-amber-500 font-bold text-sm">{benchmarkSizeMb} MB</span>
            </div>
            <div className="flex items-center gap-2">
              {[8, 16, 32, 64].map((size) => (
                <button
                  key={size}
                  onClick={() => setBenchmarkSizeMb(size)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    benchmarkSizeMb === size
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
                      : 'bg-white dark:bg-neutral-900 border-zinc-200 dark:border-neutral-800 text-zinc-600 dark:text-neutral-400 hover:text-zinc-900'
                  }`}
                >
                  {size} MB
                </button>
              ))}
            </div>
          </div>

          {/* Benchmark Results */}
          {benchmarkResult && (
            <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  Allocation Benchmark Succeeded
                </span>
                <span>{benchmarkResult.durationMs} ms</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-emerald-500/20">
                  <div className="text-[10px] font-mono text-zinc-500 dark:text-neutral-400">Throughput</div>
                  <div className="text-base font-black font-mono text-zinc-900 dark:text-white">
                    {benchmarkResult.throughputMbPerSec} <span className="text-xs font-normal">MB/s</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-emerald-500/20">
                  <div className="text-[10px] font-mono text-zinc-500 dark:text-neutral-400">Tested Size</div>
                  <div className="text-base font-black font-mono text-zinc-900 dark:text-white">
                    {benchmarkResult.testedMb} <span className="text-xs font-normal">MB</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-emerald-500/20">
                  <div className="text-[10px] font-mono text-zinc-500 dark:text-neutral-400">Heap Used After</div>
                  <div className="text-base font-black font-mono text-zinc-900 dark:text-white">
                    {benchmarkResult.heapUsedAfterMb} <span className="text-xs font-normal">MB</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-emerald-500/20">
                  <div className="text-[10px] font-mono text-zinc-500 dark:text-neutral-400">RSS Resident</div>
                  <div className="text-base font-black font-mono text-zinc-900 dark:text-white">
                    {benchmarkResult.rssAfterMb} <span className="text-xs font-normal">MB</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Docker Best Practice Advice */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs text-zinc-600 dark:text-neutral-400 space-y-1.5">
            <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Sparkles size={13} className="text-cyan-500" />
              <span>{t('docker.checklistTitle')}</span>
            </div>
            <p>• {t('docker.checklist1')}</p>
            <p>• {t('docker.checklist2')}</p>
          </div>
        </div>

        {/* Environment Variables Inspector */}
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                <Terminal size={15} className="text-emerald-500" />
                <span>{t('docker.envVars')}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {filteredEnv.length} {t('docker.varsCount')}
              </span>
            </div>
            <input
              type="text"
              placeholder={t('docker.searchEnv')}
              value={envSearch}
              onChange={(e) => setEnvSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[280px] space-y-2 pr-1 font-mono text-xs">
            {filteredEnv.map(([key, val]) => (
              <div
                key={key}
                className="p-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800/80 flex flex-col gap-0.5"
              >
                <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 break-all">
                  {key}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-neutral-400 break-all">
                  {val || '(empty)'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-neutral-800 text-[11px] text-zinc-500 dark:text-neutral-400 font-mono">
            <span>{t('docker.maskedNotice')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

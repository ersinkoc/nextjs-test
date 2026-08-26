import React, { useState, useOptimistic, useTransition, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Send,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileCode2,
  Lock,
  Layers,
  ArrowRight,
  Database,
  Sliders
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

interface SimulatedActionLog {
  id: string;
  actionName: string;
  payload: any;
  status: 'pending' | 'success' | 'failed' | 'rolled_back';
  durationMs: number;
  revalidatedPaths: string[];
  rscPayloadChunk?: string;
  error?: string;
  timestamp: string;
}

interface OptimisticItem {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  isOptimistic?: boolean;
}

export const ServerActionsLab: React.FC = () => {
  const { t, language } = useI18n();

  // Action input states
  const [actionTitle, setActionTitle] = useState<string>('Deploy Next.js 16.3 on Docker Container');
  const [actionPriority, setActionPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [networkDelayMs, setNetworkDelayMs] = useState<number>(350);
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Optimistic list items
  const [items, setItems] = useState<OptimisticItem[]>([
    { id: 'item-1', title: 'Initialize Next.js 16.3 App Router', status: 'completed' },
    { id: 'item-2', title: 'Configure SQLite WAL Mode & Pragma', status: 'completed' },
    { id: 'item-3', title: 'Verify Rust React Compiler AST', status: 'in_progress' },
  ]);

  // React 19 / Next.js useOptimistic simulation
  const [optimisticItems, setOptimisticItems] = useState<OptimisticItem[]>(items);

  // Execution History Logs
  const [actionLogs, setActionLogs] = useState<SimulatedActionLog[]>([]);
  const [activeCodeTab, setActiveCodeTab] = useState<'actions' | 'optimistic' | 'formstate' | 'security'>('actions');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Trigger real server action simulation through backend API
  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim()) return;

    const tempId = 'temp_' + Math.random().toString(36).substring(2, 9);
    const newItem: OptimisticItem = {
      id: tempId,
      title: actionTitle,
      status: 'pending',
      isOptimistic: true,
    };

    // 1. Instantly apply optimistic update to client UI
    setOptimisticItems((prev) => [newItem, ...prev]);

    startTransition(async () => {
      try {
        const payload = {
          title: actionTitle,
          priority: actionPriority,
          createdAt: new Date().toISOString(),
        };

        const res = await fetch('/api/server-actions/simulate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Next-Action': 'sa_mut_create_item_hash_9f4e2b',
          },
          body: JSON.stringify({
            actionName: 'createTaskServerAction',
            payload,
            shouldFail: simulateFailure,
            delayMs: networkDelayMs,
          }),
        });

        const data = await res.json();

        if (data.success) {
          // 2. Commit real item state
          const finalizedItem: OptimisticItem = {
            id: 'real_' + data.actionId,
            title: actionTitle,
            status: 'completed',
            isOptimistic: false,
          };
          setItems((prev) => [finalizedItem, ...prev]);
          setOptimisticItems((prev) => [finalizedItem, ...prev.filter((i) => i.id !== tempId)]);

          // Add log
          setActionLogs((prev) => [
            {
              id: data.actionId,
              actionName: 'createTaskServerAction',
              payload,
              status: 'success',
              durationMs: data.executionMs,
              revalidatedPaths: data.revalidatedPaths,
              rscPayloadChunk: data.rscPayloadChunk,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev,
          ]);
        } else {
          // 3. Rollback optimistic state on server error
          setOptimisticItems(items);
          setActionLogs((prev) => [
            {
              id: data.actionId || 'err_' + Date.now(),
              actionName: 'createTaskServerAction',
              payload,
              status: 'rolled_back',
              durationMs: data.executionMs || networkDelayMs,
              revalidatedPaths: [],
              error: data.error || 'Server validation rejected the mutation',
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev,
          ]);
        }
      } catch (err: any) {
        // Rollback
        setOptimisticItems(items);
        setActionLogs((prev) => [
          {
            id: 'net_err_' + Date.now(),
            actionName: 'createTaskServerAction',
            payload: { title: actionTitle },
            status: 'failed',
            durationMs: networkDelayMs,
            revalidatedPaths: [],
            error: err.message,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      }
    });
  };

  const handleResetList = () => {
    const initial: OptimisticItem[] = [
      { id: 'item-1', title: 'Initialize Next.js 16.3 App Router', status: 'completed' },
      { id: 'item-2', title: 'Configure SQLite WAL Mode & Pragma', status: 'completed' },
      { id: 'item-3', title: 'Verify Rust React Compiler AST', status: 'in_progress' },
    ];
    setItems(initial);
    setOptimisticItems(initial);
  };

  const CODE_SNIPPETS = {
    actions: `// app/actions/tasks.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/server/sqlite';

export async function createTaskAction(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const priority = formData.get('priority') as string;

  // 1. Strict Server-Side Validation
  if (!title || title.trim().length < 3) {
    return { error: 'Task title must be at least 3 characters long.' };
  }

  // 2. Direct SQLite Mutation
  const insertStmt = db.prepare('INSERT INTO tasks (title, priority, status) VALUES (?, ?, ?)');
  const result = insertStmt.run(title, priority, 'completed');

  // 3. Selective Cache Purging & RSC Invalidation
  revalidatePath('/dashboard');
  revalidateTag('tasks');

  return { success: true, id: result.lastInsertRowid };
}`,
    optimistic: `// components/OptimisticTaskList.tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { createTaskAction } from '@/actions/tasks';

export function OptimisticTaskList({ initialTasks }) {
  const [tasks, setTasks] = useOptimistic(
    initialTasks,
    (currentTasks, newTask) => [
      { ...newTask, isOptimistic: true },
      ...currentTasks
    ]
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    const title = formData.get('title') as string;
    
    // Instant 0ms Client UI Feedback
    startTransition(async () => {
      setTasks({ id: 'temp', title, status: 'pending' });
      await createTaskAction(null, formData);
    });
  };

  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <button disabled={isPending}>Create Task</button>
    </form>
  );
}`,
    formstate: `// Progressive Enhancement with useActionState
'use client';

import { useActionState } from 'react';
import { createTaskAction } from '@/actions/tasks';

export function TaskForm() {
  // Works even if client JavaScript is disabled!
  const [state, formAction, isPending] = useActionState(createTaskAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input name="title" placeholder="Enter task..." required />
      {state?.error && <p className="text-rose-500">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Save with Zero JS'}
      </button>
    </form>
  );
}`,
    security: `// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // 1. Strict Host Origin Verification
      allowedOrigins: ['localhost:3000', 'app.production.domain'],
      // 2. Request Body Payload Limit
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;`
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-neutral-900 to-black p-6 sm:p-8 text-white shadow-xl border border-zinc-800">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Zap size={22} className="animate-pulse" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Server Actions & Mutex Lab
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                useOptimistic • React 19
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Next.js 16 Server Actions & Optimistic Mutations
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Execute `"use server"` mutations, inspect `Next-Action` cryptographic headers, test progressive enhancement without JavaScript, and trigger instant `useOptimistic` rollbacks.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Action Trigger & Optimistic List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Action Trigger Card */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Send size={16} />
                </div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Server Action Mutation Form
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                POST /api/server-actions/simulate
              </span>
            </div>

            <form onSubmit={handleExecuteAction} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-neutral-300 mb-1.5">
                  Task Title (formData.get('title'))
                </label>
                <input
                  type="text"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-neutral-300 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={actionPriority}
                    onChange={(e: any) => setActionPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="low">Low (Standard)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical (P0)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-neutral-300 mb-1.5">
                    Network Delay Simulator ({networkDelayMs}ms)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="1500"
                    step="50"
                    value={networkDelayMs}
                    onChange={(e) => setNetworkDelayMs(Number(e.target.value))}
                    className="w-full accent-emerald-500 mt-2 cursor-pointer"
                  />
                </div>
              </div>

              {/* Chaos & Failure Simulation Toggle */}
              <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className={simulateFailure ? 'text-rose-500' : 'text-zinc-400'} />
                  <span className="text-xs font-mono text-zinc-700 dark:text-neutral-300">
                    Simulate Server Validation Failure (Trigger Optimistic Rollback)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSimulateFailure(!simulateFailure)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    simulateFailure ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      simulateFailure ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-zinc-500">
                  {isPending ? 'Executing on Server...' : 'Ready for mutation'}
                </span>

                <button
                  type="submit"
                  disabled={isPending || !actionTitle.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-mono font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  <Play size={13} className={isPending ? 'animate-spin' : ''} />
                  <span>{isPending ? 'Mutating...' : 'Trigger Server Action'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live useOptimistic List View */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <Layers size={16} />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Live `useOptimistic` Item Stream
                </h3>
              </div>

              <button
                onClick={handleResetList}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 text-xs font-mono transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence>
                {optimisticItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      item.isOptimistic
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200 animate-pulse'
                        : 'bg-zinc-50 dark:bg-neutral-950 border-zinc-200 dark:border-neutral-800/80 text-zinc-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          item.isOptimistic
                            ? 'bg-amber-500 animate-ping'
                            : item.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-cyan-500'
                        }`}
                      />
                      <span className="text-xs font-mono font-medium">{item.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.isOptimistic ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                          Optimistic (Pending Wire)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Server Committed
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Code & Wire Protocol Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Code & Security Specification Tabs */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="border-b border-zinc-200 dark:border-neutral-800 bg-zinc-100/70 dark:bg-neutral-950 flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveCodeTab('actions')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeCodeTab === 'actions'
                      ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-zinc-600 dark:text-neutral-400'
                  }`}
                >
                  'use server'
                </button>
                <button
                  onClick={() => setActiveCodeTab('optimistic')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeCodeTab === 'optimistic'
                      ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-zinc-600 dark:text-neutral-400'
                  }`}
                >
                  useOptimistic
                </button>
                <button
                  onClick={() => setActiveCodeTab('formstate')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeCodeTab === 'formstate'
                      ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-zinc-600 dark:text-neutral-400'
                  }`}
                >
                  useActionState
                </button>
                <button
                  onClick={() => setActiveCodeTab('security')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeCodeTab === 'security'
                      ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-zinc-600 dark:text-neutral-400'
                  }`}
                >
                  CSRF Config
                </button>
              </div>

              <button
                onClick={() => handleCopy(CODE_SNIPPETS[activeCodeTab], activeCodeTab)}
                className="p-1.5 rounded-lg bg-zinc-200 dark:bg-neutral-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition-colors cursor-pointer"
                title="Copy code"
              >
                {copiedKey === activeCodeTab ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>

            <div className="bg-zinc-950 p-4 overflow-x-auto text-xs font-mono text-zinc-200 max-h-[300px] select-text">
              <pre>
                <code>{CODE_SNIPPETS[activeCodeTab]}</code>
              </pre>
            </div>
          </div>

          {/* Wire Protocol & Flight Stream Log */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  <FileCode2 size={16} />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Wire Protocol & Flight Stream Log
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {actionLogs.length} events
              </span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {actionLogs.length === 0 ? (
                <div className="text-center py-8 text-xs font-mono text-zinc-400">
                  Trigger a Server Action above to inspect live RSC wire frames.
                </div>
              ) : (
                actionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {log.actionName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : log.status === 'rolled_back'
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-zinc-500/10 text-zinc-400'
                        }`}
                      >
                        {log.status.toUpperCase()} ({log.durationMs}ms)
                      </span>
                    </div>

                    {log.error ? (
                      <div className="text-rose-500 text-[11px]">
                        Error: {log.error}
                      </div>
                    ) : (
                      <>
                        <div className="text-[11px] text-zinc-500">
                          Revalidated: {log.revalidatedPaths.join(', ')}
                        </div>
                        {log.rscPayloadChunk && (
                          <div className="p-1.5 rounded bg-zinc-900 text-cyan-400 text-[10px] truncate">
                            {log.rscPayloadChunk}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

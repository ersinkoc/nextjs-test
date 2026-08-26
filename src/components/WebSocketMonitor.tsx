import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Radio,
  Activity,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Send,
  Trash2,
  Download,
  Copy,
  Check,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
  Server,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Code2,
  Eye,
  RefreshCw,
  Gauge,
  Cpu,
  Terminal,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { WsConnectionStatus, WsEventRecord, WsClientMetrics } from '../types';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

interface WebSocketMonitorProps {
  embedded?: boolean;
  onEventIntercept?: (event: WsEventRecord) => void;
}

export const WebSocketMonitor: React.FC<WebSocketMonitorProps> = ({
  embedded = false,
  onEventIntercept,
}) => {
  const { t, language } = useI18n();

  // Socket Connection State
  const [socketStatus, setSocketStatus] = useState<WsConnectionStatus>('disconnected');
  const [clientId, setClientId] = useState<string>('');
  const [serverVersion, setServerVersion] = useState<string>('');
  const [serverConnectedClients, setServerConnectedClients] = useState<number>(0);
  const [lastPingLatency, setLastPingLatency] = useState<number | null>(null);
  const [autoReconnect, setAutoReconnect] = useState<boolean>(true);
  const [isStreamPaused, setIsStreamPaused] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Channel Subscriptions
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([
    '*',
    'arena:events',
    'system:telemetry',
    'cache:invalidation',
    'server-actions:stream',
  ]);
  const [newChannelInput, setNewChannelInput] = useState<string>('');

  // Event Log Buffer
  const [events, setEvents] = useState<WsEventRecord[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WsEventRecord | null>(null);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'incoming' | 'outgoing' | 'system'>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'warn' | 'error'>('all');

  // Dispatcher Form State
  const [dispatchChannel, setDispatchChannel] = useState<string>('arena:events');
  const [dispatchEventName, setDispatchEventName] = useState<string>('arena:test-trigger');
  const [dispatchPayload, setDispatchPayload] = useState<string>(
    JSON.stringify(
      {
        testId: 'test_server_actions_mutex',
        mode: 'extreme',
        timestamp: new Date().toISOString(),
        clientPayload: { user: 'lead-dev', action: 'stress_mutate' },
      },
      null,
      2
    )
  );
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Metrics
  const [metrics, setMetrics] = useState<WsClientMetrics>({
    messagesReceived: 0,
    messagesSent: 0,
    bytesReceived: 0,
    bytesSent: 0,
    connectionUptimeSec: 0,
    activeChannels: [],
    reconnectAttempts: 0,
    lastPingMs: 0,
    serverClientsCount: 0,
  });

  // Socket & Reference handles
  const socketRef = useRef<WebSocket | null>(null);
  const pingTimestampRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<any>(null);
  const uptimeTimerRef = useRef<any>(null);
  const connectTimestampRef = useRef<number>(0);
  const tableBottomRef = useRef<HTMLDivElement | null>(null);
  const isStreamPausedRef = useRef<boolean>(false);

  isStreamPausedRef.current = isStreamPaused;

  // Build WebSocket URL
  const getWsUrl = () => {
    if (typeof window === 'undefined') return 'ws://localhost:3000/ws';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  };

  // Connect to WebSocket Server
  const connectSocket = () => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setSocketStatus('connecting');
    const wsUrl = getWsUrl();

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setSocketStatus('connected');
        connectTimestampRef.current = Date.now();

        // Start uptime interval
        if (uptimeTimerRef.current) clearInterval(uptimeTimerRef.current);
        uptimeTimerRef.current = setInterval(() => {
          if (connectTimestampRef.current > 0) {
            setMetrics((prev) => ({
              ...prev,
              connectionUptimeSec: Math.floor((Date.now() - connectTimestampRef.current) / 1000),
            }));
          }
        }, 1000);

        // Send initial ping to check RTT
        sendPing();

        // Subscribe to configured channels
        subscribedChannels.forEach((ch) => {
          if (ch !== '*') {
            ws.send(JSON.stringify({ type: 'subscribe', channel: ch }));
          }
        });

        // Add System Event Log
        addEventRecord({
          id: `sys_conn_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          epochMs: Date.now(),
          direction: 'system',
          channel: 'system:lifecycle',
          eventName: 'connection:open',
          payload: { url: wsUrl, protocol: ws.protocol, binaryType: ws.binaryType },
          payloadSize: 0,
          status: 'ok',
        });
      };

      ws.onmessage = (event) => {
        const rawData = event.data.toString();
        const payloadSize = new Blob([rawData]).size;

        setMetrics((prev) => ({
          ...prev,
          messagesReceived: prev.messagesReceived + 1,
          bytesReceived: prev.bytesReceived + payloadSize,
        }));

        try {
          const parsed = JSON.parse(rawData);

          // Handle Pong for RTT
          if (parsed.type === 'pong') {
            const rtt = Date.now() - (parsed.clientTimestamp || pingTimestampRef.current);
            setLastPingLatency(Math.max(1, rtt));
            setMetrics((prev) => ({ ...prev, lastPingMs: rtt }));
          }

          // Handle System Init
          if (parsed.type === 'system:init') {
            if (parsed.clientId) setClientId(parsed.clientId);
            if (parsed.serverVersion) setServerVersion(parsed.serverVersion);
            if (parsed.activeClients) setServerConnectedClients(parsed.activeClients);
          }

          // Handle Telemetry Pulse
          if (parsed.eventName === 'telemetry:pulse' && parsed.payload?.activeConnections) {
            setServerConnectedClients(parsed.payload.activeConnections);
          }

          // Determine direction & channel
          const isSystem = parsed.type?.startsWith('system') || parsed.type === 'pong' || parsed.type === 'ack';
          const direction: 'incoming' | 'system' = isSystem ? 'system' : 'incoming';
          const eventChannel = parsed.channel || (isSystem ? 'system:internal' : 'broadcast');
          const eventName = parsed.eventName || parsed.type || 'message';

          const record: WsEventRecord = {
            id: `evt_in_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toLocaleTimeString(),
            epochMs: Date.now(),
            direction,
            channel: eventChannel,
            eventName,
            payload: parsed.payload !== undefined ? parsed.payload : parsed,
            payloadSize,
            latencyMs: lastPingLatency || undefined,
            status: parsed.type === 'error' ? 'error' : 'ok',
            rawString: rawData,
          };

          if (!isStreamPausedRef.current) {
            addEventRecord(record);
          }

          if (onEventIntercept) {
            onEventIntercept(record);
          }
        } catch (err: any) {
          const rawRecord: WsEventRecord = {
            id: `evt_raw_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            epochMs: Date.now(),
            direction: 'incoming',
            channel: 'raw:unparsed',
            eventName: 'raw:string',
            payload: { raw: rawData },
            payloadSize,
            status: 'warn',
            rawString: rawData,
          };
          if (!isStreamPausedRef.current) {
            addEventRecord(rawRecord);
          }
        }
      };

      ws.onclose = (event) => {
        setSocketStatus('disconnected');
        connectTimestampRef.current = 0;
        if (uptimeTimerRef.current) clearInterval(uptimeTimerRef.current);

        addEventRecord({
          id: `sys_close_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          epochMs: Date.now(),
          direction: 'system',
          channel: 'system:lifecycle',
          eventName: 'connection:close',
          payload: { code: event.code, reason: event.reason || 'Closed normally', wasClean: event.wasClean },
          payloadSize: 0,
          status: event.wasClean ? 'warn' : 'error',
        });

        // Trigger Auto Reconnect
        if (autoReconnect) {
          setSocketStatus('reconnecting');
          setMetrics((prev) => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSocket();
          }, 2500);
        }
      };

      ws.onerror = (err) => {
        setSocketStatus('error');
        addEventRecord({
          id: `sys_err_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          epochMs: Date.now(),
          direction: 'system',
          channel: 'system:lifecycle',
          eventName: 'connection:error',
          payload: { error: 'WebSocket connection failed or interrupted' },
          payloadSize: 0,
          status: 'error',
        });
      };
    } catch (e: any) {
      setSocketStatus('error');
    }
  };

  // Disconnect Socket
  const disconnectSocket = () => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (socketRef.current) {
      socketRef.current.close(1000, 'User initiated disconnect');
      socketRef.current = null;
    }
    setSocketStatus('disconnected');
    connectTimestampRef.current = 0;
    if (uptimeTimerRef.current) clearInterval(uptimeTimerRef.current);
  };

  // Add record helper (keeps last 250 records)
  const addEventRecord = (record: WsEventRecord) => {
    setEvents((prev) => [record, ...prev.slice(0, 249)]);
  };

  // Send Heartbeat Ping
  const sendPing = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    const now = Date.now();
    pingTimestampRef.current = now;
    const pingMsg = JSON.stringify({ type: 'ping', timestamp: now });
    socketRef.current.send(pingMsg);

    setMetrics((prev) => ({
      ...prev,
      messagesSent: prev.messagesSent + 1,
      bytesSent: prev.bytesSent + pingMsg.length,
    }));
  };

  // Send Custom Event
  const handleDispatchEvent = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      alert(language === 'tr' ? 'WebSocket bağlı değil. Lütfen önce bağlanın.' : 'WebSocket is not connected. Please connect first.');
      return;
    }

    let parsedPayload = {};
    try {
      if (dispatchPayload.trim()) {
        parsedPayload = JSON.parse(dispatchPayload);
      }
      setPayloadError(null);
    } catch (e: any) {
      setPayloadError(`Invalid JSON: ${e.message}`);
      return;
    }

    const eventObj = {
      type: 'event',
      id: `evt_out_${Date.now()}`,
      channel: dispatchChannel,
      eventName: dispatchEventName,
      payload: parsedPayload,
      timestamp: new Date().toISOString(),
    };

    const str = JSON.stringify(eventObj);
    socketRef.current.send(str);
    const size = new Blob([str]).size;

    setMetrics((prev) => ({
      ...prev,
      messagesSent: prev.messagesSent + 1,
      bytesSent: prev.bytesSent + size,
    }));

    addEventRecord({
      id: eventObj.id,
      timestamp: new Date().toLocaleTimeString(),
      epochMs: Date.now(),
      direction: 'outgoing',
      channel: dispatchChannel,
      eventName: dispatchEventName,
      payload: parsedPayload,
      payloadSize: size,
      status: 'ok',
      rawString: str,
    });
  };

  // Channel Subscription Toggle
  const toggleChannel = (channel: string) => {
    let updated: string[];
    const isSubscribed = subscribedChannels.includes(channel);

    if (isSubscribed) {
      updated = subscribedChannels.filter((c) => c !== channel);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'unsubscribe', channel }));
      }
    } else {
      updated = [...subscribedChannels, channel];
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
      }
    }
    setSubscribedChannels(updated);
  };

  // Add custom channel
  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelInput.trim()) return;
    const clean = newChannelInput.trim().toLowerCase();
    if (!subscribedChannels.includes(clean)) {
      toggleChannel(clean);
    }
    setNewChannelInput('');
  };

  // Server Traffic Simulation
  const handleSimulateTraffic = async (count: number) => {
    setIsSimulating(true);
    try {
      await fetch('/api/ws/simulate-traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, intervalMs: 150, channel: dispatchChannel }),
      });
    } catch (e) {
      console.error('Failed to trigger simulation:', e);
    } finally {
      setTimeout(() => setIsSimulating(false), count * 150 + 500);
    }
  };

  // Clear Event Table
  const handleClearLogs = () => {
    setEvents([]);
    setSelectedEvent(null);
  };

  // Export Events as JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `websocket-events-${new Date().toISOString().slice(0, 19)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Connect on Mount & Cleanup on Unmount
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Direction
      if (directionFilter !== 'all' && ev.direction !== directionFilter) return false;
      // Channel
      if (channelFilter !== 'all' && ev.channel !== channelFilter) return false;
      // Status
      if (statusFilter !== 'all' && ev.status !== statusFilter) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesEvent = ev.eventName.toLowerCase().includes(q);
        const matchesChannel = ev.channel.toLowerCase().includes(q);
        const matchesPayload = JSON.stringify(ev.payload).toLowerCase().includes(q);
        if (!matchesEvent && !matchesChannel && !matchesPayload) return false;
      }
      return true;
    });
  }, [events, directionFilter, channelFilter, statusFilter, searchQuery]);

  // Unique channel list from events
  const availableChannels = useMemo(() => {
    const set = new Set<string>(['arena:events', 'system:telemetry', 'cache:invalidation', 'server-actions:stream', 'chat:general']);
    events.forEach((e) => set.add(e.channel));
    return Array.from(set);
  }, [events]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      {!embedded && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-neutral-900 to-zinc-900 p-6 sm:p-8 text-white shadow-xl border border-zinc-800">
          <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Radio size={22} className={socketStatus === 'connected' ? 'animate-pulse' : ''} />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  WebSocket Event Monitor
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ws://0.0.0.0:3000/ws
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Real-Time Socket Stream & Event Table Inspector
              </h1>
              <p className="text-sm text-zinc-400 max-w-2xl">
                Monitor bidirectional WebSocket frames, channel broadcasts, connection state transitions, and server-side Next.js 16.3 telemetry payloads in real-time.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-700/60 p-3 rounded-2xl">
              <div className="flex items-center gap-2 px-2 border-r border-zinc-800">
                <span
                  className={`w-3 h-3 rounded-full ${
                    socketStatus === 'connected'
                      ? 'bg-emerald-500 animate-ping'
                      : socketStatus === 'connecting' || socketStatus === 'reconnecting'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  {socketStatus}
                </span>
              </div>
              <div className="text-center px-2">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Ping RTT</div>
                <div className="text-sm font-black font-mono text-cyan-400">
                  {lastPingLatency !== null ? `${lastPingLatency}ms` : '--'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Connection State */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>State</span>
            {socketStatus === 'connected' ? <Wifi size={14} className="text-emerald-500" /> : <WifiOff size={14} className="text-rose-500" />}
          </div>
          <div className="text-sm font-bold font-mono text-zinc-900 dark:text-white capitalize mt-1">
            {socketStatus}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5 truncate">
            {clientId || 'Awaiting init...'}
          </div>
        </div>

        {/* Inbound Messages */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>Inbound (↓)</span>
            <ArrowDownLeft size={14} className="text-cyan-500" />
          </div>
          <div className="text-base font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">
            {metrics.messagesReceived}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
            {(metrics.bytesReceived / 1024).toFixed(1)} KB received
          </div>
        </div>

        {/* Outbound Messages */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>Outbound (↑)</span>
            <ArrowUpRight size={14} className="text-emerald-500" />
          </div>
          <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.messagesSent}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
            {(metrics.bytesSent / 1024).toFixed(1)} KB sent
          </div>
        </div>

        {/* Ping / Latency */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>RTT Latency</span>
            <Gauge size={14} className="text-amber-500" />
          </div>
          <div className="text-base font-black font-mono text-amber-500 mt-1">
            {lastPingLatency !== null ? `${lastPingLatency} ms` : '--'}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
            Round-trip heartbeat
          </div>
        </div>

        {/* Connected Sockets */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>Hub Clients</span>
            <Server size={14} className="text-purple-500" />
          </div>
          <div className="text-base font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
            {serverConnectedClients}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
            Active server peers
          </div>
        </div>

        {/* Session Uptime */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>Uptime</span>
            <Clock size={14} className="text-zinc-500" />
          </div>
          <div className="text-base font-black font-mono text-zinc-900 dark:text-white mt-1">
            {metrics.connectionUptimeSec}s
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
            {metrics.reconnectAttempts > 0 ? `${metrics.reconnectAttempts} reconnects` : 'Stable stream'}
          </div>
        </div>
      </div>

      {/* Control Bar & Channel Subscriptions */}
      <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Connection Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {socketStatus === 'connected' ? (
              <button
                onClick={disconnectSocket}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <WifiOff size={14} />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={connectSocket}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Wifi size={14} />
                <span>Connect to /ws</span>
              </button>
            )}

            <button
              onClick={sendPing}
              disabled={socketStatus !== 'connected'}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Zap size={13} className="text-amber-500" />
              <span>Ping (Heartbeat)</span>
            </button>

            <button
              onClick={() => handleSimulateTraffic(5)}
              disabled={isSimulating}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={13} className={isSimulating ? 'animate-spin' : ''} />
              <span>Simulate Burst (5x)</span>
            </button>

            <button
              onClick={() => handleSimulateTraffic(20)}
              disabled={isSimulating}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 hidden sm:flex"
            >
              <Activity size={13} />
              <span>Stress Burst (20x)</span>
            </button>
          </div>

          {/* Table Utilities */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
            <button
              onClick={() => setIsStreamPaused((p) => !p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isStreamPaused
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 hover:bg-zinc-200'
              }`}
            >
              {isStreamPaused ? <Play size={13} /> : <Pause size={13} />}
              <span>{isStreamPaused ? 'Resume Stream' : 'Freeze Stream'}</span>
            </button>

            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Clear Event Log"
            >
              <Trash2 size={14} />
            </button>

            <button
              onClick={handleExportJson}
              className="p-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Export Events (JSON)"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Channel Subscriptions Bar */}
        <div className="pt-3 border-t border-zinc-100 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Layers size={13} className="text-cyan-500" />
              <span>Channel Subscriptions (Click to toggle):</span>
            </span>
            <form onSubmit={handleAddChannel} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newChannelInput}
                onChange={(e) => setNewChannelInput(e.target.value)}
                placeholder="+ Add channel..."
                className="px-2 py-0.5 text-[11px] font-mono rounded-lg bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 w-32"
              />
            </form>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {['*', 'arena:events', 'system:telemetry', 'cache:invalidation', 'server-actions:stream', 'chat:general'].map(
              (ch) => {
                const active = subscribedChannels.includes(ch);
                return (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                      active
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 font-bold'
                        : 'bg-zinc-50 dark:bg-neutral-950 text-zinc-400 dark:text-neutral-500 border-zinc-200 dark:border-neutral-800'
                    }`}
                  >
                    <span>{ch === '*' ? '* (Wildcard All)' : ch}</span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Main Work Area: Event Table + Dispatcher / Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Event Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Table Filters Strip */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-3.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event name, channel, or payload JSON..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Direction Filter */}
              <select
                value={directionFilter}
                onChange={(e: any) => setDirectionFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-800 dark:text-neutral-200 cursor-pointer focus:outline-none"
              >
                <option value="all">Direction: All</option>
                <option value="incoming">↓ Incoming Only</option>
                <option value="outgoing">↑ Outgoing Only</option>
                <option value="system">⚡ System Only</option>
              </select>

              {/* Channel Filter */}
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-800 dark:text-neutral-200 cursor-pointer focus:outline-none max-w-[130px] truncate"
              >
                <option value="all">Channel: All</option>
                {availableChannels.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* WebSocket Event Stream Table */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-xs sm:text-sm font-mono">
                <Terminal size={15} className="text-cyan-500" />
                <span>WebSocket Frame Stream ({filteredEvents.length} frames)</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Click any row to inspect deep payload
              </span>
            </div>

            <div className="overflow-x-auto max-h-[540px] overflow-y-auto divide-y divide-zinc-100 dark:divide-neutral-800/60 font-mono text-xs">
              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center text-zinc-400 space-y-2">
                  <Radio size={28} className="mx-auto text-zinc-500 opacity-40 animate-pulse" />
                  <p className="text-xs">No WebSocket frames match your filter or received yet.</p>
                  <p className="text-[11px] text-zinc-500">
                    Click "Simulate Burst" or "Ping (Heartbeat)" to generate live WebSocket events.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-zinc-50 dark:bg-neutral-950/90 backdrop-blur-xs text-[10px] uppercase text-zinc-500 font-bold border-b border-zinc-200 dark:border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-3">Dir</th>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Channel</th>
                      <th className="py-2.5 px-3">Event Name</th>
                      <th className="py-2.5 px-3 hidden sm:table-cell">Size</th>
                      <th className="py-2.5 px-3">Payload Preview</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-neutral-800/50">
                    {filteredEvents.map((ev) => {
                      const isSelected = selectedEvent?.id === ev.id;
                      return (
                        <tr
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`group cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-cyan-500/10 dark:bg-cyan-500/15'
                              : 'hover:bg-zinc-50 dark:hover:bg-neutral-800/50'
                          }`}
                        >
                          {/* Direction Badge */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {ev.direction === 'incoming' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                <ArrowDownLeft size={10} /> IN
                              </span>
                            )}
                            {ev.direction === 'outgoing' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <ArrowUpRight size={10} /> OUT
                              </span>
                            )}
                            {ev.direction === 'system' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                <Zap size={10} /> SYS
                              </span>
                            )}
                          </td>

                          {/* Timestamp */}
                          <td className="py-2.5 px-3 text-zinc-500 whitespace-nowrap text-[11px]">
                            {ev.timestamp}
                          </td>

                          {/* Channel */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 text-[10px]">
                              {ev.channel}
                            </span>
                          </td>

                          {/* Event Name */}
                          <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white whitespace-nowrap text-[11px]">
                            {ev.eventName}
                          </td>

                          {/* Size */}
                          <td className="py-2.5 px-3 text-zinc-400 text-[10px] whitespace-nowrap hidden sm:table-cell">
                            {ev.payloadSize > 1024
                              ? `${(ev.payloadSize / 1024).toFixed(1)} KB`
                              : `${ev.payloadSize} B`}
                          </td>

                          {/* Payload Preview */}
                          <td className="py-2.5 px-3 max-w-[200px] sm:max-w-[280px] truncate text-[11px] text-zinc-600 dark:text-neutral-400">
                            {JSON.stringify(ev.payload)}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(JSON.stringify(ev.payload, null, 2), ev.id);
                              }}
                              className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-neutral-800"
                              title="Copy JSON Payload"
                            >
                              {copiedId === ev.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              <div ref={tableBottomRef} />
            </div>
          </div>
        </div>

        {/* Right Column: Dispatcher & Deep Payload Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Selected Event Payload Inspector */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-xs font-mono">
                <Code2 size={15} className="text-cyan-500" />
                <span>Payload Inspector</span>
              </div>
              {selectedEvent && (
                <button
                  onClick={() => handleCopy(JSON.stringify(selectedEvent.payload, null, 2), 'inspector')}
                  className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'inspector' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>Copy</span>
                </button>
              )}
            </div>

            {selectedEvent ? (
              <div className="space-y-3 font-mono">
                {/* Event Summary Strip */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Event Name:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{selectedEvent.eventName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Channel:</span>
                    <span className="text-cyan-600 dark:text-cyan-400">{selectedEvent.channel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Direction:</span>
                    <span className="capitalize font-semibold text-zinc-700 dark:text-neutral-300">{selectedEvent.direction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Time:</span>
                    <span>{selectedEvent.timestamp}</span>
                  </div>
                </div>

                {/* JSON Tree View */}
                <div>
                  <div className="text-[10px] font-mono text-zinc-400 mb-1 uppercase font-semibold">
                    Parsed JSON Payload:
                  </div>
                  <pre className="p-3.5 rounded-2xl bg-zinc-950 text-emerald-400 text-[11px] font-mono overflow-x-auto max-h-64 border border-zinc-800 leading-relaxed scrollbar-none">
                    {JSON.stringify(selectedEvent.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-400 text-xs font-mono border border-dashed border-zinc-200 dark:border-neutral-800 rounded-2xl">
                <Eye size={20} className="mx-auto mb-2 text-zinc-500 opacity-40" />
                <span>Select an event from the table on the left to inspect full schema & payload details.</span>
              </div>
            )}
          </div>

          {/* WebSocket Event Dispatcher */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-xs font-mono">
                <Send size={15} className="text-emerald-500" />
                <span>Emit Custom WebSocket Frame</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Client Dispatcher</span>
            </div>

            {/* Target Channel */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-zinc-700 dark:text-neutral-300 mb-1">
                Target Channel
              </label>
              <select
                value={dispatchChannel}
                onChange={(e) => setDispatchChannel(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                <option value="arena:events">arena:events (Test Arena Interceptor)</option>
                <option value="server-actions:stream">server-actions:stream (RSC Flight Mutex)</option>
                <option value="cache:invalidation">cache:invalidation (Tag Invalidator)</option>
                <option value="chat:general">chat:general (Multi-Client Room)</option>
              </select>
            </div>

            {/* Event Name */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-zinc-700 dark:text-neutral-300 mb-1">
                Event Name
              </label>
              <input
                type="text"
                value={dispatchEventName}
                onChange={(e) => setDispatchEventName(e.target.value)}
                placeholder="e.g. test:execute"
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* JSON Payload Textarea */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="font-semibold text-zinc-700 dark:text-neutral-300">JSON Payload</span>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      setDispatchPayload(JSON.stringify(JSON.parse(dispatchPayload), null, 2));
                      setPayloadError(null);
                    } catch (e: any) {
                      setPayloadError('Invalid JSON format');
                    }
                  }}
                  className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Prettify
                </button>
              </div>
              <textarea
                value={dispatchPayload}
                onChange={(e) => {
                  setDispatchPayload(e.target.value);
                  setPayloadError(null);
                }}
                rows={5}
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              {payloadError && (
                <div className="text-[10px] font-mono text-rose-500 mt-1 flex items-center gap-1">
                  <AlertTriangle size={11} /> {payloadError}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleDispatchEvent}
              disabled={socketStatus !== 'connected'}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send size={13} />
              <span>Emit Frame to {dispatchChannel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

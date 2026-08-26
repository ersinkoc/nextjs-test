import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import {
  getDbStatus,
  executeQuery,
  checkpointWal,
  seedSampleData,
  testDiskDurability,
  getDirectusSettings,
  saveDirectusSettings,
  getFullDbSchema,
  seedRelationalSchema,
} from './src/server/sqlite';

const PORT = 3000;

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS headers for development/preview
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ==========================================
  // Health API
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      engine: 'Next.js 16.3 + Node 24 LTS + SQLite Full-Stack',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // SQLite Database API Routes
  // ==========================================

  // Get database status, storage path, file size & WAL mode
  app.get('/api/sqlite/status', async (req, res) => {
    try {
      const status = await getDbStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Execute arbitrary SQL query
  app.post('/api/sqlite/query', async (req, res) => {
    try {
      const { sql, params = [] } = req.body;
      if (!sql || typeof sql !== 'string') {
        return res.status(400).json({ error: 'SQL query string is required' });
      }

      const result = await executeQuery(sql, params);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Seed sample records
  app.post('/api/sqlite/seed', async (req, res) => {
    try {
      const result = await seedSampleData();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Force WAL checkpoint to persistent disk
  app.post('/api/sqlite/checkpoint', async (req, res) => {
    try {
      const result = await checkpointWal();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Test disk write durability & latency
  app.post('/api/sqlite/durability-test', async (req, res) => {
    try {
      const { payloadSizeKb = 16 } = req.body;
      const result = await testDiskDurability(Number(payloadSizeKb) || 16);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get full database schema with tables, columns, indexes, PKs and Foreign Keys
  app.get('/api/sqlite/schema', async (req, res) => {
    try {
      const schema = await getFullDbSchema();
      res.json(schema);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Seed relational schema with explicit FK relationships
  app.post('/api/sqlite/seed-relational', async (req, res) => {
    try {
      const result = await seedRelationalSchema();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // Directus Headless CMS Integration Routes
  // ==========================================

  // Get Directus configuration and stored settings
  app.get('/api/directus/config', async (req, res) => {
    try {
      const settings = await getDirectusSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Save Directus configuration
  app.post('/api/directus/config', async (req, res) => {
    try {
      const { url, token } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'Directus URL is required' });
      }
      await saveDirectusSettings(url, token || '');
      res.json({ success: true, message: 'Directus configuration saved in SQLite' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Test connectivity to Directus instance
  app.post('/api/directus/test', async (req, res) => {
    const { url, token } = req.body;
    const targetUrl = url || (await getDirectusSettings()).url;
    const authToken = token !== undefined ? token : (await getDirectusSettings()).token;

    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Attempt to ping Directus /server/health or /server/info
      const cleanUrl = targetUrl.replace(/\/+$/, '');
      const healthUrl = `${cleanUrl}/server/health`;

      const headers: Record<string, string> = {
        'User-Agent': 'NextJs-16-TestArena/1.0',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(healthUrl, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const latencyMs = parseFloat((performance.now() - start).toFixed(2));
      let responseBody: any = null;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }

      res.json({
        connected: response.ok,
        status: response.status,
        statusText: response.statusText,
        latencyMs,
        endpoint: healthUrl,
        response: responseBody,
        message: response.ok
          ? 'Directus container connected successfully'
          : `Directus responded with HTTP ${response.status}`,
      });
    } catch (err: any) {
      const latencyMs = parseFloat((performance.now() - start).toFixed(2));
      const isTimeout = err.name === 'AbortError';
      res.json({
        connected: false,
        status: 0,
        statusText: isTimeout ? 'Timeout' : 'Network Error',
        latencyMs,
        endpoint: targetUrl,
        error: isTimeout
          ? 'Connection timed out (4000ms). Ensure Directus container is running on the same network or check URL.'
          : err.message,
        hint:
          'When deploying with docker-compose, use "http://directus:8055" to connect via the internal bridge network.',
      });
    }
  });

  // Directus Collection Schema / Items Proxy
  app.post('/api/directus/collections', async (req, res) => {
    try {
      const { url, token } = await getDirectusSettings();
      const cleanUrl = url.replace(/\/+$/, '');
      const collectionsUrl = `${cleanUrl}/collections`;

      const headers: Record<string, string> = {
        'User-Agent': 'NextJs-16-TestArena/1.0',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(collectionsUrl, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Directus responded with ${response.status}: ${response.statusText}`,
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(502).json({ error: `Could not fetch Directus collections: ${err.message}` });
    }
  });

  // ==========================================
  // Docker & Containerized Runtime Diagnostics
  // ==========================================
  app.get('/api/docker/system-info', (req, res) => {
    try {
      const mem = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const safeEnv: Record<string, string> = {};
      const sensitiveKeys = ['KEY', 'SECRET', 'TOKEN', 'PASSWORD', 'AUTH', 'CREDENTIAL'];
      
      Object.keys(process.env).forEach((k) => {
        const val = process.env[k] || '';
        const isSensitive = sensitiveKeys.some((s) => k.toUpperCase().includes(s));
        safeEnv[k] = isSensitive ? `${val.slice(0, 4)}••••••••${val.slice(-3)}` : val;
      });

      res.json({
        runtime: {
          nodeVersion: process.version,
          v8Version: process.versions.v8,
          uvVersion: process.versions.uv,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
          ppid: process.ppid,
          uptimeSec: process.uptime(),
          isDocker: true,
          cwd: process.cwd(),
          execPath: process.execPath,
          gid: typeof process.getgid === 'function' ? process.getgid() : 1001,
          uid: typeof process.getuid === 'function' ? process.getuid() : 1001,
        },
        memory: {
          rssMb: parseFloat((mem.rss / 1024 / 1024).toFixed(2)),
          heapTotalMb: parseFloat((mem.heapTotal / 1024 / 1024).toFixed(2)),
          heapUsedMb: parseFloat((mem.heapUsed / 1024 / 1024).toFixed(2)),
          externalMb: parseFloat((mem.external / 1024 / 1024).toFixed(2)),
          arrayBuffersMb: parseFloat(((mem.arrayBuffers || 0) / 1024 / 1024).toFixed(2)),
        },
        cpu: {
          userMs: Math.round(cpuUsage.user / 1000),
          systemMs: Math.round(cpuUsage.system / 1000),
        },
        env: {
          NODE_ENV: process.env.NODE_ENV || 'development',
          PORT: process.env.PORT || '3000',
          NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || '1',
          STANDALONE_MODE: 'true',
          allSafeCount: Object.keys(safeEnv).length,
          sampleEnv: safeEnv,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Docker Cold Start & Memory Warmup Benchmark
  app.post('/api/docker/benchmark-coldstart', async (req, res) => {
    const start = performance.now();
    try {
      const bufferSizeMb = Math.min(Number(req.body.sizeMb) || 16, 64);
      const testBuffer = Buffer.alloc(bufferSizeMb * 1024 * 1024, 0x41);
      
      let checksum = 0;
      for (let i = 0; i < 10000; i += 100) {
        checksum = (checksum + testBuffer[i]) % 256;
      }
      
      const durationMs = parseFloat((performance.now() - start).toFixed(2));
      const currentMem = process.memoryUsage();

      res.json({
        success: true,
        testedMb: bufferSizeMb,
        durationMs,
        throughputMbPerSec: parseFloat(((bufferSizeMb / durationMs) * 1000).toFixed(2)),
        checksum,
        heapUsedAfterMb: parseFloat((currentMem.heapUsed / 1024 / 1024).toFixed(2)),
        rssAfterMb: parseFloat((currentMem.rss / 1024 / 1024).toFixed(2)),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // Next.js Server Actions Simulator API
  // ==========================================
  app.post('/api/server-actions/simulate', async (req, res) => {
    const { actionName, payload, shouldFail = false, delayMs = 120 } = req.body;
    const startTime = performance.now();
    
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, Math.min(delayMs, 2000)));
    }

    if (shouldFail) {
      return res.status(422).json({
        success: false,
        actionId: `action_${Buffer.from(actionName || 'mutation').toString('base64').slice(0, 12)}`,
        error: 'Validation failed: Invalid form payload or CSRF strict-origin mismatch',
        revalidatedPaths: [],
        executionMs: parseFloat((performance.now() - startTime).toFixed(2)),
      });
    }

    const actionId = `sa_${Math.random().toString(36).substring(2, 10)}`;
    const revalidated = ['/dashboard', '/api/posts', '/sqlite-studio'];

    res.json({
      success: true,
      actionId,
      actionName: actionName || 'updateRecordAction',
      receivedPayload: payload || {},
      revalidatedPaths: revalidated,
      rscPayloadChunk: `0:["$@1",["$","div",null,{"className":"text-emerald-400","children":"Server Action Completed"}]]`,
      executionMs: parseFloat((performance.now() - startTime).toFixed(2)),
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // Next.js Edge Middleware Pipeline Simulator
  // ==========================================
  app.post('/api/middleware/test-pipeline', (req, res) => {
    const { url = '/dashboard/settings', headers = {}, mockCountry = 'TR' } = req.body;
    const start = performance.now();

    const incomingUrl = new URL(url, 'http://localhost:3000');
    let matchedRule = 'default';
    let actionType: 'pass' | 'rewrite' | 'redirect' | 'header-inject' = 'pass';
    let targetUrl = incomingUrl.pathname;
    const injectedHeaders: Record<string, string> = {
      'x-middleware-rewrite': '',
      'x-middleware-matched': 'true',
      'x-request-id': `req_${Math.random().toString(36).substring(2, 9)}`,
      'x-vercel-ip-country': mockCountry,
      'x-vercel-ip-city': mockCountry === 'TR' ? 'Istanbul' : mockCountry === 'DE' ? 'Frankfurt' : 'San Francisco',
      'x-powered-by': 'Next.js 16.3 / Node 24 LTS Container',
    };

    if (incomingUrl.pathname.startsWith('/admin') && !headers.authorization) {
      actionType = 'redirect';
      targetUrl = '/login?callbackUrl=' + encodeURIComponent(incomingUrl.pathname);
      matchedRule = 'auth-guard (strict)';
    } else if (incomingUrl.pathname === '/beta') {
      actionType = 'rewrite';
      targetUrl = '/experimental/turbopack-v16';
      injectedHeaders['x-middleware-rewrite'] = targetUrl;
      matchedRule = 'a-b-testing-bucket-b';
    } else if (incomingUrl.pathname.startsWith('/api/')) {
      actionType = 'header-inject';
      injectedHeaders['x-ratelimit-remaining'] = '98';
      injectedHeaders['x-ratelimit-limit'] = '100';
      matchedRule = 'api-rate-limiter';
    }

    const durationMs = parseFloat((performance.now() - start).toFixed(2));

    res.json({
      originalUrl: incomingUrl.pathname,
      actionType,
      targetUrl,
      matchedRule,
      injectedHeaders,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // Next.js App Router Users Route Handler Simulation
  // ==========================================
  app.get('/api/users', async (req, res) => {
    const delay = Number(req.query.delay) || 0;
    const chaos = Number(req.query.chaos) || 0;

    if (delay > 0) {
      await new Promise((r) => setTimeout(r, Math.min(delay, 2000)));
    }

    if (chaos > 0 && Math.random() * 100 < chaos) {
      const errTypes = [
        { status: 429, msg: 'Too Many Requests - Rate Limit Exceeded (Token Bucket Empty)' },
        { status: 500, msg: 'Internal Server Error - Database connection pool exhausted' },
        { status: 503, msg: 'Service Unavailable - Node 24 worker thread busy' },
      ];
      const selected = errTypes[Math.floor(Math.random() * errTypes.length)];
      return res.status(selected.status).json({
        error: selected.msg,
        statusCode: selected.status,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      users: [
        { id: 'usr_1', name: 'Alice Vercel', role: 'Staff Engineer', status: 'online' },
        { id: 'usr_2', name: 'Bob Turbopack', role: 'Rust Runtime Dev', status: 'idle' },
        { id: 'usr_3', name: 'Charlie React19', role: 'Compiler Architect', status: 'online' },
        { id: 'usr_4', name: 'Diana Next16', role: 'PPR Specialist', status: 'offline' },
      ],
      runtime: 'Node 24 LTS (Edge Compatible)',
      renderedAt: new Date().toISOString(),
      cacheControl: 's-maxage=60, stale-while-revalidate',
    });
  });

  // ==========================================
  // Dedicated High-Throughput Stress Test Endpoint
  // ==========================================
  app.post('/api/stress/benchmark', async (req, res) => {
    const { delayMs = 0, errorRatePct = 0, payloadSizeKb = 1, requestId = '' } = req.body;
    const start = performance.now();

    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, Math.min(delayMs, 3000)));
    }

    if (errorRatePct > 0 && Math.random() * 100 < errorRatePct) {
      const isRateLimit = Math.random() > 0.5;
      const status = isRateLimit ? 429 : 503;
      return res.status(status).json({
        success: false,
        error: isRateLimit ? '429 Rate Limit (Edge Bucket Overloaded)' : '503 Service Overloaded (High Concurrency)',
        status,
        requestId,
        latencyMs: parseFloat((performance.now() - start).toFixed(2)),
      });
    }

    const duration = parseFloat((performance.now() - start).toFixed(2));
    res.json({
      success: true,
      requestId,
      latencyMs: duration,
      serverTime: new Date().toISOString(),
      heapUsedMb: parseFloat((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)),
      payloadBytes: (Number(payloadSizeKb) || 1) * 1024,
    });
  });

  // ==========================================
  // WebSocket Hub & REST Trigger APIs
  // ==========================================
  interface WsClientMetadata {
    id: string;
    ws: WebSocket;
    channels: Set<string>;
    connectedAt: string;
    ip?: string;
  }

  const activeWsClients = new Map<string, WsClientMetadata>();
  let totalWsMsgsSent = 0;
  let totalWsMsgsReceived = 0;

  // Broadcast helper
  const broadcastWsEvent = (channel: string, eventName: string, payload: any, senderId?: string) => {
    const msgString = JSON.stringify({
      type: 'event',
      channel,
      eventName,
      payload,
      senderId: senderId || 'server',
      timestamp: new Date().toISOString(),
      epochMs: Date.now(),
    });

    let sentCount = 0;
    activeWsClients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        if (channel === '*' || client.channels.has('*') || client.channels.has(channel)) {
          client.ws.send(msgString);
          sentCount++;
          totalWsMsgsSent++;
        }
      }
    });
    return sentCount;
  };

  // REST: Get WS Status
  app.get('/api/ws/status', (req, res) => {
    const channelList = new Set<string>();
    activeWsClients.forEach((c) => c.channels.forEach((ch) => channelList.add(ch)));

    res.json({
      success: true,
      connectedClientsCount: activeWsClients.size,
      activeChannels: Array.from(channelList),
      totalMessagesSent: totalWsMsgsSent,
      totalMessagesReceived: totalWsMsgsReceived,
      uptimeSeconds: process.uptime(),
      serverTimestamp: new Date().toISOString(),
    });
  });

  // REST: Broadcast event via HTTP
  app.post('/api/ws/broadcast', (req, res) => {
    const { channel = 'arena:events', eventName = 'custom:event', payload = {} } = req.body;
    const recipientCount = broadcastWsEvent(channel, eventName, payload, 'http-trigger');
    res.json({
      success: true,
      channel,
      eventName,
      recipientCount,
      timestamp: new Date().toISOString(),
    });
  });

  // REST: Simulate Traffic Burst for Testing
  app.post('/api/ws/simulate-traffic', async (req, res) => {
    const { count = 5, intervalMs = 200, channel = 'arena:events' } = req.body;
    const eventTypes = [
      { name: 'rsc:flight-chunk', sample: { streamId: 'chunk_82', bytes: 1420, component: 'SuspenseBoundary<Feed>' } },
      { name: 'cache:tag-revalidated', sample: { tag: 'posts-feed', durationMs: 1.4, worker: 'edge-iad1' } },
      { name: 'server-action:mutation', sample: { actionId: 'updateProfile', status: 'MUTATED', optimistic: true } },
      { name: 'sqlite:wal-checkpoint', sample: { pagesWritten: 128, mode: 'PASSIVE', busy: 0 } },
      { name: 'telemetry:heartbeat', sample: { cpuUsage: '4.2%', heapMb: 42.8, activeSockets: activeWsClients.size } },
      { name: 'chaos:rate-limit-warn', sample: { ip: '192.168.1.100', currentRps: 84, limitRps: 100 } },
    ];

    let dispatched = 0;
    const sendBatch = async () => {
      for (let i = 0; i < Math.min(Number(count) || 5, 50); i++) {
        const picked = eventTypes[i % eventTypes.length];
        broadcastWsEvent(channel, picked.name, {
          ...picked.sample,
          seq: i + 1,
          simulatedAt: new Date().toISOString(),
        });
        dispatched++;
        if (intervalMs > 0) {
          await new Promise((r) => setTimeout(r, Math.min(intervalMs, 1000)));
        }
      }
    };

    // Execute in background
    sendBatch();

    res.json({
      success: true,
      message: `Started dispatching ${count} simulated WebSocket events to channel '${channel}'`,
      initialCount: count,
    });
  });

  // ==========================================
  // Vite Integration (Dev Middleware / Prod Static)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Create HTTP Server & Attach WebSocket Server
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    const clientId = 'client_' + Math.random().toString(36).substring(2, 9);
    const clientMeta: WsClientMetadata = {
      id: clientId,
      ws,
      channels: new Set(['*', 'arena:events', 'system:telemetry']),
      connectedAt: new Date().toISOString(),
      ip: req.socket.remoteAddress,
    };
    activeWsClients.set(clientId, clientMeta);

    // Send Welcome & Initial State
    ws.send(
      JSON.stringify({
        type: 'system:init',
        clientId,
        connectedAt: clientMeta.connectedAt,
        activeClients: activeWsClients.size,
        serverVersion: 'Next.js 16.3.0 Arena WebSocket Engine (Node 24 LTS)',
        defaultChannels: Array.from(clientMeta.channels),
        timestamp: new Date().toISOString(),
        epochMs: Date.now(),
      })
    );

    // Notify other subscribers of presence
    broadcastWsEvent('arena:events', 'presence:join', {
      clientId,
      totalConnected: activeWsClients.size,
    });

    ws.on('message', (data) => {
      totalWsMsgsReceived++;
      try {
        const parsed = JSON.parse(data.toString());
        const msgType = parsed.type;

        if (msgType === 'ping') {
          ws.send(
            JSON.stringify({
              type: 'pong',
              clientTimestamp: parsed.timestamp,
              serverTimestamp: Date.now(),
              epochMs: Date.now(),
            })
          );
        } else if (msgType === 'subscribe') {
          if (parsed.channel) {
            clientMeta.channels.add(parsed.channel);
            ws.send(
              JSON.stringify({
                type: 'channel:subscribed',
                channel: parsed.channel,
                activeChannels: Array.from(clientMeta.channels),
                timestamp: new Date().toISOString(),
                epochMs: Date.now(),
              })
            );
          }
        } else if (msgType === 'unsubscribe') {
          if (parsed.channel) {
            clientMeta.channels.delete(parsed.channel);
            ws.send(
              JSON.stringify({
                type: 'channel:unsubscribed',
                channel: parsed.channel,
                activeChannels: Array.from(clientMeta.channels),
                timestamp: new Date().toISOString(),
                epochMs: Date.now(),
              })
            );
          }
        } else if (msgType === 'event' || msgType === 'broadcast') {
          const targetChannel = parsed.channel || 'arena:events';
          const eventName = parsed.eventName || 'client:message';
          const payload = parsed.payload || {};

          // Broadcast to target channel
          broadcastWsEvent(targetChannel, eventName, payload, clientId);

          // Confirmation echo back to sender
          ws.send(
            JSON.stringify({
              type: 'ack',
              ackId: parsed.id || `ack_${Date.now()}`,
              channel: targetChannel,
              eventName,
              status: 'broadcasted',
              timestamp: new Date().toISOString(),
              epochMs: Date.now(),
            })
          );
        }
      } catch (err: any) {
        ws.send(
          JSON.stringify({
            type: 'error',
            error: 'Invalid JSON payload received',
            details: err.message,
            timestamp: new Date().toISOString(),
            epochMs: Date.now(),
          })
        );
      }
    });

    ws.on('close', () => {
      activeWsClients.delete(clientId);
      broadcastWsEvent('arena:events', 'presence:leave', {
        clientId,
        totalConnected: activeWsClients.size,
      });
    });

    ws.on('error', (err) => {
      console.warn(`WebSocket error on client ${clientId}:`, err.message);
    });
  });

  // Periodic Telemetry Pulse (every 4 seconds)
  setInterval(() => {
    if (activeWsClients.size > 0) {
      const memory = process.memoryUsage();
      broadcastWsEvent('system:telemetry', 'telemetry:pulse', {
        activeConnections: activeWsClients.size,
        heapUsedMb: parseFloat((memory.heapUsed / 1024 / 1024).toFixed(2)),
        rssMb: parseFloat((memory.rss / 1024 / 1024).toFixed(2)),
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    }
  }, 4000);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ [Next.js Arena Server] Running on http://0.0.0.0:${PORT} (WS on /ws)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

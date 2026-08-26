import express from 'express';
import path from 'path';
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ [Next.js Arena Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

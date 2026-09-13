import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getDatabase } from './server/db/database';
import { realtimeHub } from './server/realtime';
import authRoutes from './server/routes/authRoutes';
import configRoutes from './server/routes/configRoutes';
import rsvpRoutes from './server/routes/rsvpRoutes';
import wishesRoutes from './server/routes/wishesRoutes';
import galleryRoutes from './server/routes/galleryRoutes';
import adminRoutes from './server/routes/adminRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite database
  await getDatabase();

  // Basic middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Static uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // SSE Realtime Stream route
  app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const clientId = 'client_' + Math.random().toString(36).substring(2, 9);
    realtimeHub.addClient(clientId, res);
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'wedding-invitation-backend',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/config', configRoutes);
  app.use('/api/rsvp', rsvpRoutes);
  app.use('/api/wishes', wishesRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/admin', adminRoutes);

  // Vite integration
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
    console.log(`Wedding App Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

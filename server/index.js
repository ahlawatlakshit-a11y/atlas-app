import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb } from './db.js';
import jdRoutes from './routes/jd.js';
import candidatesRoutes from './routes/candidates.js';
import screeningsRoutes from './routes/screenings.js';
import slotsRoutes from './routes/slots.js';
import referralsRoutes from './routes/referrals.js';
import channelsRoutes from './routes/channels.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = join(__dirname, '..', 'client', 'dist');

const app = express();
const PORT = process.env.PORT || 4000;

initDb();
console.log('[ATLAS] SQLite initialised.');

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'atlas-server' }));

app.use('/api/jd', jdRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/screen', screeningsRoutes);
app.use('/api/slot', slotsRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/channels', channelsRoutes);

// In production (Railway), serve the built React app from the same origin so
// /api/* hits the server and everything else returns the SPA shell.
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(join(CLIENT_DIST, 'index.html'));
  });
  console.log('[ATLAS] Serving client build from', CLIENT_DIST);
} else {
  console.log('[ATLAS] No client build found — API only. Run `npm run build` from project root for production.');
}

app.use((err, _req, res, _next) => {
  console.error('[ATLAS] route error:', err);
  res.status(500).json({ error: err.message || 'Server error' });
});

const server = app.listen(PORT, () => {
  console.log(`[ATLAS] server listening on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[ATLAS] Port ${PORT} is already in use. Stop the other process or set PORT=<other> and retry.`);
  } else {
    console.error('[ATLAS] server error:', err);
  }
  process.exit(1);
});

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const pool    = require('./db/pool');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/inquiries',  require('./routes/inquiries'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/reports',    require('./routes/reports'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'unreachable' });
  }
});

// ── 404 fallback ──────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║  St. Paul's Card Dept — API Server           ║
  ║  Listening on port ${PORT}                      ║
  ╚══════════════════════════════════════════════╝
  `);
});

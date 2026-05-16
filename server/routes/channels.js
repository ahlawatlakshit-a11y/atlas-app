import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT key, name, enabled FROM channels').all();
  res.json(rows.map((r) => ({ ...r, enabled: !!r.enabled })));
});

router.put('/:key', (req, res) => {
  const { enabled } = req.body || {};
  db.prepare('UPDATE channels SET enabled = ? WHERE key = ?').run(enabled ? 1 : 0, req.params.key);
  res.json({ ok: true });
});

export default router;

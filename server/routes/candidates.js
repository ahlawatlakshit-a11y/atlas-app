import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

const ALLOWED = [
  'name', 'phone', 'source', 'lang',
  'age', 'experience_years', 'distance_km',
  'score', 'status', 'slot', 'job_id',
  'recruiter_id', 'gps_lat', 'gps_lng', 'photo',
  'role', 'hub',
];

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM candidates ORDER BY id DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const body = req.body || {};
  if (!body.name) return res.status(400).json({ error: 'name required' });
  const cols = ALLOWED.filter((k) => body[k] !== undefined);
  const placeholders = cols.map(() => '?').join(', ');
  const values = cols.map((k) => body[k]);
  const stmt = db.prepare(`INSERT INTO candidates (${cols.join(', ')}) VALUES (${placeholders})`);
  const result = stmt.run(...values);
  const row = db.prepare('SELECT * FROM candidates WHERE id = ?').get(result.lastInsertRowid);
  res.json(row);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

router.patch('/:id', (req, res) => {
  const updates = Object.entries(req.body || {}).filter(([k]) => ALLOWED.includes(k));
  if (updates.length === 0) return res.status(400).json({ error: 'no valid fields to update' });
  const setClause = updates.map(([k]) => `${k} = ?`).join(', ');
  const values = updates.map(([, v]) => v);
  db.prepare(`UPDATE candidates SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
  const row = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  res.json(row);
});

export default router;

import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM candidates ORDER BY id DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, phone, source, lang, age, experience_years, distance_km, score, status, slot, job_id } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const stmt = db.prepare(`
    INSERT INTO candidates (name, phone, source, lang, age, experience_years, distance_km, score, status, slot, job_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    name,
    phone || null,
    source || 'Direct',
    lang || null,
    age ?? null,
    experience_years ?? null,
    distance_km ?? null,
    score ?? null,
    status || 'Applied',
    slot ?? null,
    job_id ?? null
  );
  res.json({ id: result.lastInsertRowid });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

router.patch('/:id', (req, res) => {
  const allowed = ['name', 'phone', 'source', 'lang', 'age', 'experience_years', 'distance_km', 'score', 'status', 'slot', 'job_id'];
  const updates = Object.entries(req.body || {}).filter(([k]) => allowed.includes(k));
  if (updates.length === 0) return res.status(400).json({ error: 'no valid fields to update' });
  const setClause = updates.map(([k]) => `${k} = ?`).join(', ');
  const values = updates.map(([, v]) => v);
  db.prepare(`UPDATE candidates SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
  const row = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  res.json(row);
});

export default router;

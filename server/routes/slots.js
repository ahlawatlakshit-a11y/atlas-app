import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  // Generate next 5 weekdays × 3 slots; mark already-booked ones taken.
  const jobId = req.query.jobId ? Number(req.query.jobId) : null;
  const taken = new Set(
    db.prepare('SELECT slot_iso FROM bookings WHERE job_id IS ? OR job_id = ?').all(jobId, jobId).map((r) => r.slot_iso)
  );

  const slots = [];
  const today = new Date();
  let added = 0;
  let off = 0;
  while (added < 5 && off < 14) {
    off++;
    const d = new Date(today.getTime() + off * 86400000);
    if (d.getDay() === 0) continue; // skip Sundays
    ['09:00', '11:00', '14:00'].forEach((time) => {
      const iso = `${d.toISOString().slice(0, 10)}T${time}:00`;
      slots.push({ iso, date: d.toISOString().slice(0, 10), time, taken: taken.has(iso) });
    });
    added++;
  }
  res.json(slots);
});

router.post('/', (req, res) => {
  const { candidate_id, job_id, slot_iso } = req.body || {};
  if (!slot_iso) return res.status(400).json({ error: 'slot_iso required' });
  const reference_id = 'ATL-' + Math.floor(10000 + Math.random() * 89999);
  const stmt = db.prepare(`
    INSERT INTO bookings (candidate_id, job_id, slot_iso, reference_id) VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(candidate_id ?? null, job_id ?? null, slot_iso, reference_id);
  res.json({ id: result.lastInsertRowid, reference_id, slot_iso });
});

export default router;

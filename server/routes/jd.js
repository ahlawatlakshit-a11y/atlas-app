import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.post('/generate', (req, res) => {
  const brief = (req.body?.brief || '').trim();
  if (!brief) return res.status(400).json({ error: 'brief required' });

  const lift = (brief.match(/(\d+)\s?kg/i) || [, '25'])[1];
  const sal = (brief.match(/₹\s?([\d,]+)/) || [, '18,000'])[1];
  const opn = (brief.match(/(\d+)\s+(loaders?|workers?|pickers?)/i) || [, '12'])[1];
  const isNight = /night/i.test(brief);
  const location = /hyderabad/i.test(brief) ? 'Patancheru, Hyderabad' : 'Jumbotail Warehouse';
  const title = /loader/i.test(brief) ? 'Warehouse Loader' : /picker/i.test(brief) ? 'Order Picker' : 'Warehouse Associate';

  res.json({
    title,
    location,
    salary: `₹${sal}/month + PF + meals`,
    openings: parseInt(opn, 10),
    description:
      `Load and unload kirana goods (rice, oil, atta, FMCG packs) onto trucks. ` +
      (isNight ? 'Night shift 8 PM - 4 AM.' : 'Day shift 9 AM - 6 PM.') +
      ' Free chai-breakfast. Pickup from Patancheru bus stop.',
    requirements: [
      'Age 18-45',
      'Min 6 months loading/unloading experience',
      `Lift ${lift} kg comfortably`,
      'Live within 25 km of warehouse',
      isNight ? 'Available night shift' : 'Available day shift',
    ],
    criteria: { maxDistance: 25, minLift: parseInt(lift, 10) },
  });
});

router.post('/publish', (req, res) => {
  const { title, location, salary, openings, description, requirements, criteria } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  const stmt = db.prepare(`
    INSERT INTO jobs (title, location, salary, openings, description, requirements, criteria_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    title,
    location || '',
    salary || '',
    openings || 0,
    description || '',
    JSON.stringify(requirements || []),
    JSON.stringify(criteria || {})
  );
  res.json({ id: result.lastInsertRowid });
});

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM jobs ORDER BY id DESC').all();
  res.json(rows);
});

export default router;

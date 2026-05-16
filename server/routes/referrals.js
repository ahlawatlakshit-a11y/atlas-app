import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const phone = req.query.phone;
  const rows = phone
    ? db.prepare('SELECT * FROM referrals WHERE referrer_phone = ? ORDER BY id DESC').all(phone)
    : db.prepare('SELECT * FROM referrals ORDER BY id DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { referrer_phone, friend_name, friend_phone, lang } = req.body || {};
  if (!friend_name || !friend_phone) return res.status(400).json({ error: 'friend_name and friend_phone required' });
  const stmt = db.prepare(`
    INSERT INTO referrals (referrer_phone, friend_name, friend_phone, lang)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(referrer_phone || null, friend_name, friend_phone, lang || 'hi');
  res.json({ id: result.lastInsertRowid });
});

export default router;

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'data', 'atlas.db');

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT,
      salary TEXT,
      openings INTEGER,
      description TEXT,
      requirements TEXT,
      criteria_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      source TEXT,
      lang TEXT,
      age INTEGER,
      experience_years INTEGER,
      distance_km INTEGER,
      score INTEGER,
      status TEXT DEFAULT 'Applied',
      slot TEXT,
      job_id INTEGER REFERENCES jobs(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS screenings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER REFERENCES candidates(id),
      job_id INTEGER REFERENCES jobs(id),
      lang TEXT,
      answers_json TEXT,
      breakdown_json TEXT,
      score INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER REFERENCES candidates(id),
      job_id INTEGER REFERENCES jobs(id),
      slot_iso TEXT NOT NULL,
      reference_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_phone TEXT,
      friend_name TEXT,
      friend_phone TEXT,
      lang TEXT,
      status TEXT DEFAULT 'Sent',
      payout INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS channels (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      enabled INTEGER DEFAULT 1
    );
  `);

  // Migration: add 'slot' column to existing candidates table if missing
  try { db.exec("ALTER TABLE candidates ADD COLUMN slot TEXT"); } catch { /* column exists */ }

  // Seed channels
  if (db.prepare('SELECT COUNT(*) AS n FROM channels').get().n === 0) {
    const ins = db.prepare('INSERT INTO channels (key, name, enabled) VALUES (?, ?, 1)');
    [
      ['apna', 'Apna'],
      ['workindia', 'WorkIndia'],
      ['quikrjobs', 'QuikrJobs'],
      ['vahan', 'Vahan'],
      ['wagroups', 'WhatsApp Groups'],
      ['kirana', 'Kirana Network'],
    ].forEach(([k, n]) => ins.run(k, n));
  }

  // Seed candidates (from prototype state.candidates)
  if (db.prepare('SELECT COUNT(*) AS n FROM candidates').get().n === 0) {
    const ins = db.prepare(`
      INSERT INTO candidates (name, phone, source, lang, age, experience_years, distance_km, score, status, slot)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    [
      ['Suresh Reddy',  '+91 98480 12345', 'Apna',         'Telugu·EN', 28, 3, 8,  92, 'Hired',     'May 4, 11:00 AM'],
      ['Lakshmi Devi',  '+91 98765 11122', 'WhatsApp Grp', 'Telugu',    34, 5, 12, 88, 'Offer sent','May 5, 02:00 PM'],
      ['Anil Kumar',    '+91 99887 76655', 'WorkIndia',    'Hindi',     24, 2, 15, 81, 'Interview', 'May 6, 10:00 AM'],
      ['Mohammed Faiz', '+91 90001 23456', 'Kirana Ref',   'Hindi·EN',  31, 4, 6,  95, 'Hired',     'May 4, 09:00 AM'],
      ['Karthik Reddy', '+91 96543 21098', 'Vahan',        'Telugu',    22, 1, 20, 71, 'Interview', 'May 7, 11:00 AM'],
      ['Yadav Prasad',  '+91 98123 45678', 'Apna',         'Hindi',     39, 8, 18, 86, 'Qualified', 'May 8, 03:00 PM'],
      ['Bhavna Joshi',  '+91 99654 33221', 'QuikrJobs',    'Hindi',     29, 3, 28, 58, 'Rejected',  null],
      ['Ravi Sharma',   '+91 97001 22334', 'WhatsApp Grp', 'Hindi',     26, 2, 11, 78, 'Qualified', 'May 7, 09:00 AM'],
    ].forEach((row) => ins.run(...row));
  }

  // Seed referrals (from prototype seedReferrals)
  if (db.prepare('SELECT COUNT(*) AS n FROM referrals').get().n === 0) {
    const ins = db.prepare(`
      INSERT INTO referrals (referrer_phone, friend_name, friend_phone, lang, status, payout)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    [
      ['+91 98765 43210', 'Ramesh Yadav',  '+91 98765 11111', 'hi', 'Joined',    500],
      ['+91 98765 43210', 'Mohan Singh',   '+91 99888 22222', 'hi', 'Joined',    500],
      ['+91 98765 43210', 'Babu Lal',      '+91 97654 33333', 'hi', 'Interview', 0],
      ['+91 98765 43210', 'Vinod Kumar',   '+91 96543 44444', 'hi', 'Joined',    500],
      ['+91 98765 43210', 'Kishan Singh',  '+91 95432 55555', 'hi', 'Screening', 0],
    ].forEach((row) => ins.run(...row));
  }
}

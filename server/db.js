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

  // Migrations: idempotent ALTERs for columns added after initial schema.
  // ALTER throws if column already exists — swallow that.
  const migrations = [
    "ALTER TABLE candidates ADD COLUMN slot TEXT",
    "ALTER TABLE candidates ADD COLUMN recruiter_id TEXT",
    "ALTER TABLE candidates ADD COLUMN gps_lat REAL",
    "ALTER TABLE candidates ADD COLUMN gps_lng REAL",
    "ALTER TABLE candidates ADD COLUMN photo TEXT",
    "ALTER TABLE candidates ADD COLUMN role TEXT",
    "ALTER TABLE candidates ADD COLUMN hub TEXT",
  ];
  for (const sql of migrations) {
    try { db.exec(sql); } catch { /* column exists */ }
  }

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

  // Seed candidates — spread across 4 roles, 3 hubs, mix of field & online sources.
  // `days_ago` is the days-before-today value for created_at; gives the 14-day trend real shape.
  if (db.prepare('SELECT COUNT(*) AS n FROM candidates').get().n === 0) {
    const ins = db.prepare(`
      INSERT INTO candidates
        (name, phone, source, lang, age, experience_years, distance_km, score, status, slot,
         role, hub, recruiter_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);
    const rows = [
      // ====== Van Delivery Boys ======
      ['Suresh Reddy',   '+91 98480 12345', 'Field',        'Telugu·EN', 26, 3, 5,  92, 'Hired',     'May 19, 11:00 AM', 'van_delivery', 'bala_nagar', 'Priya M', 13],
      ['Mohammed Faiz',  '+91 90001 23456', 'Kirana Ref',   'Hindi·EN',  31, 4, 6,  95, 'Hired',     'May 18, 09:00 AM', 'van_delivery', 'attapur',    null,      12],
      ['Karthik Reddy',  '+91 96543 21098', 'Vahan',        'Telugu',    24, 1, 8,  71, 'Interview', 'May 21, 11:00 AM', 'van_delivery', 'kompally',   null,      11],
      ['Imran Khan',     '+91 98765 99887', 'Field',        'Hindi',     28, 2, 4,  88, 'Offer sent','May 20, 10:00 AM', 'van_delivery', 'bala_nagar', 'Priya M', 10],
      ['Naveen Goud',    '+91 97123 33445', 'Field',        'Telugu·EN', 25, 2, 6,  85, 'Hired',     'May 17, 09:00 AM', 'van_delivery', 'bala_nagar', 'Priya M',  9],
      ['Tarun Reddy',    '+91 99887 55443', 'Apna',         'Telugu',    30, 3, 18, 64, 'Qualified', 'May 23, 10:00 AM', 'van_delivery', 'kompally',   null,       8],
      ['Vinay Kumar',    '+91 98000 11223', 'Field',        'Hindi',     26, 1, 5,  79, 'Interview', 'May 24, 11:00 AM', 'van_delivery', 'attapur',    'Gopal R',  7],
      ['Sandeep Patil',  '+91 97001 88776', 'WorkIndia',    'Hindi',     32, 5, 10, 81, 'Qualified', 'May 25, 09:00 AM', 'van_delivery', 'bala_nagar', null,       6],

      // ====== Pickers ======
      ['Lakshmi Devi',   '+91 98765 11122', 'WhatsApp Grp', 'Telugu',    34, 5, 12, 88, 'Offer sent','May 20, 02:00 PM', 'picker', 'attapur',    null,       12],
      ['Yadav Prasad',   '+91 98123 45678', 'Apna',         'Hindi',     39, 8, 18, 86, 'Qualified', 'May 22, 03:00 PM', 'picker', 'kompally',   null,       11],
      ['Anitha Rao',     '+91 99887 22334', 'Field',        'Telugu',    27, 2, 7,  82, 'Interview', 'May 21, 09:00 AM', 'picker', 'bala_nagar', 'Priya M',  9],
      ['Rekha Bai',      '+91 96321 44556', 'Field',        'Hindi',     30, 3, 5,  89, 'Hired',     'May 16, 10:00 AM', 'picker', 'bala_nagar', 'Priya M',  8],
      ['Sunita Yadav',   '+91 95432 77889', 'Kirana Ref',   'Hindi',     28, 2, 8,  77, 'Interview', 'May 24, 02:00 PM', 'picker', 'attapur',    null,       6],
      ['Kavita Sharma',  '+91 99001 22334', 'WhatsApp Grp', 'Hindi',     33, 4, 9,  84, 'Qualified', 'May 25, 11:00 AM', 'picker', 'kompally',   null,       4],
      ['Divya Mohan',    '+91 98765 00112', 'Field',        'Telugu·EN', 26, 2, 6,  90, 'Hired',     'May 15, 09:00 AM', 'picker', 'attapur',    'Gopal R',  5],

      // ====== Packers ======
      ['Anil Kumar',     '+91 99887 76655', 'WorkIndia',    'Hindi',     24, 2, 15, 81, 'Interview', 'May 22, 10:00 AM', 'packer', 'attapur',    null,       12],
      ['Ravi Sharma',    '+91 97001 22334', 'Field',        'Hindi',     26, 2, 11, 78, 'Qualified', 'May 23, 09:00 AM', 'packer', 'bala_nagar', 'Gopal R', 10],
      ['Sita Kumari',    '+91 98321 44556', 'WhatsApp Grp', 'Hindi',     33, 6, 9,  90, 'Hired',     'May 17, 02:00 PM', 'packer', 'kompally',   null,       9],
      ['Pawan Singh',    '+91 95678 11223', 'Field',        'Hindi',     27, 3, 5,  87, 'Hired',     'May 14, 10:00 AM', 'packer', 'bala_nagar', 'Priya M',  7],
      ['Mukesh Reddy',   '+91 96123 44556', 'Apna',         'Telugu',    35, 7, 22, 62, 'Rejected',  null,                'packer', 'kompally',   null,       5],
      ['Geeta Devi',     '+91 99887 33221', 'Field',        'Hindi',     29, 3, 4,  85, 'Interview', 'May 25, 11:00 AM', 'packer', 'attapur',    'Gopal R',  3],

      // ====== Warehouse Loaders ======
      ['Bhavna Joshi',   '+91 99654 33221', 'QuikrJobs',    'Hindi',     29, 3, 28, 58, 'Rejected',  null,                'warehouse_loader', 'attapur',    null,      11],
      ['Raghu Naidu',    '+91 96321 87654', 'Field',        'Telugu',    35, 5, 6,  91, 'Hired',     'May 18, 08:00 PM', 'warehouse_loader', 'bala_nagar', 'Gopal R', 8],
      ['Ramesh Goud',    '+91 98123 99887', 'Field',        'Telugu',    32, 4, 7,  84, 'Interview', 'May 26, 08:00 PM', 'warehouse_loader', 'bala_nagar', 'Priya M', 4],
      ['Hari Krishna',   '+91 97456 33221', 'WhatsApp Grp', 'Hindi',     31, 4, 14, 79, 'Qualified', 'May 25, 09:00 PM', 'warehouse_loader', 'kompally',   null,      2],
    ];
    rows.forEach((r) => {
      const days = r[r.length - 1];
      const args = r.slice(0, -1);
      args.push(`-${days} days`);
      ins.run(...args);
    });
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

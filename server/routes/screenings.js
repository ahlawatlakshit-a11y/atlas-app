import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Role dimension labels (kept in sync with client/src/lib/roleCatalog.js).
const ROLE_DIMENSIONS = {
  warehouse_loader: ['Age', 'Experience', 'Distance', 'Lift 25kg', 'Night shift'],
  van_delivery:     ['Age', 'Own vehicle', 'Driving licence', 'Smartphone', 'Area familiarity'],
  picker:           ['Age', 'SKU literacy', 'Experience', 'Stand 8 hrs', 'Day shift'],
  packer:           ['Age', 'Packing exp', 'Lift 25kg', 'Bilingual labels', 'Day shift'],
};

const DIMENSION_MAX = [20, 25, 20, 20, 15];

// Score a single answer against its dimension max. Handles:
//   - number (age, exp years, distance km)
//   - 'yes' / 'partial' / 'no'
// Dimension index is needed because some numeric dims (age 0, distance 2)
// have non-trivial bucketing.
function scoreOne(value, dimIdx) {
  const max = DIMENSION_MAX[dimIdx];

  // String yes/partial/no — uniform across dims
  if (value === 'yes')     return max;
  if (value === 'partial') return Math.round(max / 2);
  if (value === 'no')      return 0;

  // Numeric — dimension-specific bucketing
  if (typeof value !== 'number') return 0;

  if (dimIdx === 0) {
    // Age: ideal 18-45, partial 46-50, low otherwise
    if (value >= 18 && value <= 45) return max;
    if (value >= 46 && value <= 50) return Math.round(max * 0.6);
    return Math.round(max * 0.25);
  }
  if (dimIdx === 2) {
    // Distance to hub (km): closer is better
    if (value <= 10) return max;
    if (value <= 20) return Math.round(max * 0.7);
    if (value <= 25) return Math.round(max * 0.4);
    return Math.round(max * 0.1);
  }
  // All other numeric: years-of-experience pattern
  // 0 yrs = floor (5 pts), each year = +5, capped at max
  if (value === 0) return Math.round(max * 0.2);
  return Math.min(max, value * 5);
}

router.post('/', (req, res) => {
  const { candidate_id, job_id, lang, answers, role } = req.body || {};
  if (!Array.isArray(answers) || answers.length !== 5) {
    return res.status(400).json({ error: 'answers must be a length-5 array' });
  }

  const dimensions = ROLE_DIMENSIONS[role] || ROLE_DIMENSIONS.warehouse_loader;
  const breakdown = answers.map((value, i) => ({
    label: dimensions[i],
    value: value ?? null,
    pts: scoreOne(value, i),
    max: DIMENSION_MAX[i],
  }));
  const score = breakdown.reduce((sum, b) => sum + b.pts, 0);
  const verdict = score >= 80 ? 'STRONG MATCH' : score >= 60 ? 'QUALIFIED' : 'NOT QUALIFIED';

  const stmt = db.prepare(`
    INSERT INTO screenings (candidate_id, job_id, lang, answers_json, breakdown_json, score)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    candidate_id ?? null,
    job_id ?? null,
    lang || 'en',
    JSON.stringify(answers),
    JSON.stringify(breakdown),
    score
  );
  res.json({ id: result.lastInsertRowid, score, verdict, breakdown });
});

export default router;

import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Mirrors prototype's computeScore() — 5-dimension rubric out of 100
function scoreAnswers(a) {
  const breakdown = [];
  let total = 0;

  const age = a[0];
  let agePts = 0;
  if (typeof age === 'number') {
    if (age >= 18 && age <= 45) agePts = 20;
    else if (age >= 46 && age <= 50) agePts = 12;
    else agePts = 5;
  }
  total += agePts;
  breakdown.push({ label: 'Age', value: age ?? null, pts: agePts, max: 20 });

  const exp = a[1] ?? 0;
  let expPts = Math.min(25, (typeof exp === 'number' ? exp : 0) * 5);
  if (exp === 0) expPts = 5;
  total += expPts;
  breakdown.push({ label: 'Experience', value: exp, pts: expPts, max: 25 });

  const dist = a[2];
  let distPts = 0;
  if (typeof dist === 'number') {
    if (dist <= 10) distPts = 20;
    else if (dist <= 20) distPts = 14;
    else if (dist <= 25) distPts = 8;
    else distPts = 2;
  }
  total += distPts;
  breakdown.push({ label: 'Distance', value: dist, pts: distPts, max: 20 });

  const lift = a[3];
  const liftPts = lift === 'yes' ? 20 : lift === 'partial' ? 10 : 0;
  total += liftPts;
  breakdown.push({ label: 'Lift 25kg', value: lift, pts: liftPts, max: 20 });

  const shift = a[4];
  const shiftPts = shift === 'yes' ? 15 : shift === 'partial' ? 8 : 0;
  total += shiftPts;
  breakdown.push({ label: 'Night shift', value: shift, pts: shiftPts, max: 15 });

  return { score: total, breakdown };
}

router.post('/', (req, res) => {
  const { candidate_id, job_id, lang, answers } = req.body || {};
  if (!Array.isArray(answers) || answers.length !== 5) {
    return res.status(400).json({ error: 'answers must be a length-5 array' });
  }
  const { score, breakdown } = scoreAnswers(answers);
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

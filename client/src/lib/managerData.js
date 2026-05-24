// Manager-view configuration: channel-level cost-per-hire benchmarks (₹ per joined hire)
// and monthly quota targets per hub × role. Tunable by ops; for the prototype these
// are realistic-ish industry numbers and JD-derived headcount targets.

import { ROLES, HUBS } from './roleCatalog.js';

// ₹ per JOINED hire — what each channel costs in ad spend / referral payout / recruiter time
export const CHANNEL_COST = {
  Apna:          2500,
  WorkIndia:     1800,
  QuikrJobs:     2200,
  Vahan:         1400,
  'WhatsApp Grp': 250,
  'Kirana Ref':   500,  // bonus paid on Day 30
  Field:          450,  // amortised field-recruiter time
  Direct:         100,
};

// Monthly quota per hub × role (what TA + Hub Ops jointly need to fill this month)
export const QUOTAS = {
  bala_nagar: { van_delivery: 8, picker: 6, packer: 5, warehouse_loader: 4 },
  attapur:    { van_delivery: 6, picker: 5, packer: 4, warehouse_loader: 3 },
  kompally:   { van_delivery: 5, picker: 4, packer: 3, warehouse_loader: 2 },
};

export function quotaForHub(hubId) {
  const r = QUOTAS[hubId] || {};
  return Object.values(r).reduce((a, b) => a + b, 0);
}

export function totalMonthlyQuota() {
  return Object.values(QUOTAS).reduce((sum, h) => sum + Object.values(h).reduce((a, b) => a + b, 0), 0);
}

// ------- Aggregation helpers --------------------------------------------------

const HIRED_STATUSES = new Set(['Hired']);
const OFFERED_PLUS = new Set(['Offer sent', 'Hired']);
const INTERVIEWED_PLUS = new Set(['Interview', 'Offer sent', 'Hired']);

export function aggregateForManager(candidates) {
  // ---- By recruiter ----
  const byRecruiter = {};
  candidates.forEach((c) => {
    const key = c.recruiter_id || '(non-field)';
    const r = (byRecruiter[key] = byRecruiter[key] || { name: key, signups: 0, qualified: 0, interviewed: 0, hired: 0, scoreSum: 0 });
    r.signups++;
    if ((c.score ?? 0) >= 60) r.qualified++;
    if (INTERVIEWED_PLUS.has(c.status)) r.interviewed++;
    if (HIRED_STATUSES.has(c.status)) r.hired++;
    r.scoreSum += c.score ?? 0;
  });
  Object.values(byRecruiter).forEach((r) => {
    r.avgScore = r.signups ? Math.round(r.scoreSum / r.signups) : 0;
    r.convPct = r.signups ? Math.round((r.hired / r.signups) * 100) : 0;
  });

  // ---- By hub ----
  const byHub = {};
  HUBS.filter((h) => h.id !== 'patancheru').forEach((h) => {
    byHub[h.id] = {
      hub: h,
      signups: 0,
      qualified: 0,
      interviewed: 0,
      hired: 0,
      scoreSum: 0,
      costSum: 0,
      quota: quotaForHub(h.id),
    };
  });
  candidates.forEach((c) => {
    if (!c.hub || !byHub[c.hub]) return;
    const h = byHub[c.hub];
    h.signups++;
    if ((c.score ?? 0) >= 60) h.qualified++;
    if (INTERVIEWED_PLUS.has(c.status)) h.interviewed++;
    if (HIRED_STATUSES.has(c.status)) {
      h.hired++;
      h.costSum += CHANNEL_COST[c.source || 'Direct'] ?? 1000;
    }
    h.scoreSum += c.score ?? 0;
  });
  Object.values(byHub).forEach((h) => {
    h.avgScore = h.signups ? Math.round(h.scoreSum / h.signups) : 0;
    h.cph = h.hired ? Math.round(h.costSum / h.hired) : 0;
    h.fillPct = h.quota ? Math.round((h.hired / h.quota) * 100) : 0;
  });

  // ---- By channel (cost-per-hire ROI) ----
  const bySource = {};
  candidates.forEach((c) => {
    const src = c.source || 'Direct';
    const s = (bySource[src] = bySource[src] || { source: src, signups: 0, hired: 0, costPerHire: CHANNEL_COST[src] ?? 1000 });
    s.signups++;
    if (HIRED_STATUSES.has(c.status)) s.hired++;
  });
  Object.values(bySource).forEach((s) => {
    s.conversionPct = s.signups ? Math.round((s.hired / s.signups) * 100) : 0;
    s.totalSpend = s.hired * s.costPerHire;
  });

  // ---- Funnel ----
  const funnel = [
    { stage: 'Applied',     n: candidates.length },
    { stage: 'Qualified',   n: candidates.filter((c) => (c.score ?? 0) >= 60).length },
    { stage: 'Interviewed', n: candidates.filter((c) => INTERVIEWED_PLUS.has(c.status)).length },
    { stage: 'Offer sent',  n: candidates.filter((c) => OFFERED_PLUS.has(c.status)).length },
    { stage: 'Hired',       n: candidates.filter((c) => HIRED_STATUSES.has(c.status)).length },
  ];
  funnel.forEach((s, i) => {
    s.pctOfApplied = funnel[0].n ? Math.round((s.n / funnel[0].n) * 100) : 0;
    s.dropFromPrev = i === 0 ? 0 : funnel[i - 1].n - s.n;
  });

  // ---- Quota tracking (role × hub matrix) ----
  const quotaMatrix = [];
  Object.entries(QUOTAS).forEach(([hubId, roles]) => {
    Object.entries(roles).forEach(([roleId, target]) => {
      const filled = candidates.filter((c) => c.hub === hubId && c.role === roleId && HIRED_STATUSES.has(c.status)).length;
      const inPipeline = candidates.filter((c) => c.hub === hubId && c.role === roleId && !HIRED_STATUSES.has(c.status) && c.status !== 'Rejected').length;
      quotaMatrix.push({ hubId, roleId, target, filled, inPipeline, fillPct: target ? Math.round((filled / target) * 100) : 0 });
    });
  });

  // ---- 14-day timeline ----
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    return { date: d, signups: 0, hired: 0 };
  });
  candidates.forEach((c) => {
    if (!c.created_at) return;
    const cd = new Date(c.created_at);
    cd.setHours(0, 0, 0, 0);
    const bucket = days.find((b) => b.date.getTime() === cd.getTime());
    if (bucket) {
      bucket.signups++;
      if (HIRED_STATUSES.has(c.status)) bucket.hired++;
    }
  });

  // ---- Top-level KPIs ----
  const totalQuota = totalMonthlyQuota();
  const totalHired = candidates.filter((c) => HIRED_STATUSES.has(c.status)).length;
  const totalSpend = candidates
    .filter((c) => HIRED_STATUSES.has(c.status))
    .reduce((sum, c) => sum + (CHANNEL_COST[c.source || 'Direct'] ?? 1000), 0);
  const avgCph = totalHired ? Math.round(totalSpend / totalHired) : 0;

  const kpis = {
    totalQuota,
    totalHired,
    quotaFillPct: totalQuota ? Math.round((totalHired / totalQuota) * 100) : 0,
    totalApplied: candidates.length,
    avgCph,
    totalSpend,
    activeRecruiters: Object.keys(byRecruiter).filter((k) => k !== '(non-field)').length,
    avgScore: candidates.length ? Math.round(candidates.reduce((s, c) => s + (c.score ?? 0), 0) / candidates.length) : 0,
  };

  return { kpis, byRecruiter, byHub, bySource, funnel, quotaMatrix, days };
}

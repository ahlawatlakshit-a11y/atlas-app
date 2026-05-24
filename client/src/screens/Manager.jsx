import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { ROLE_BY_ID, HUB_BY_ID, ROLES, HUBS } from '../lib/roleCatalog.js';
import { aggregateForManager, CHANNEL_COST } from '../lib/managerData.js';

const SOURCE_COLOURS = {
  Apna: '#0066FF', WorkIndia: '#FF6B00', QuikrJobs: '#7C3AED', Vahan: '#16A34A',
  'WhatsApp Grp': '#25D366', 'Kirana Ref': '#F26522', Field: '#16A34A', Direct: '#64748B',
};

const INR = (n) =>
  '₹' + Math.round(n).toLocaleString('en-IN');

export default function Manager() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get('/candidates');
        if (!cancelled) setCandidates(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const agg = useMemo(() => aggregateForManager(candidates), [candidates]);

  if (loading) {
    return (
      <div className="screen-enter bg-white rounded-card-lg p-7 shadow-jt-sm border border-[var(--border)]">
        <p className="text-[var(--text-muted)]">Loading manager view…</p>
      </div>
    );
  }

  const { kpis, byRecruiter, byHub, bySource, funnel, quotaMatrix, days } = agg;

  // Sort recruiters by hires desc
  const recruiterRows = Object.values(byRecruiter)
    .filter((r) => r.name !== '(non-field)')
    .sort((a, b) => b.hired - a.hired || b.signups - a.signups);

  // Sort hubs in JD order
  const hubRows = ['bala_nagar', 'attapur', 'kompally'].map((id) => byHub[id]).filter(Boolean);

  // Sort channels by hires desc
  const channelRows = Object.values(bySource).sort((a, b) => b.hired - a.hired);

  // Industry benchmark for cost comparison
  const INDUSTRY_AVG_CPH = 4200;
  const savingsPerHire = INDUSTRY_AVG_CPH - kpis.avgCph;
  const savingsTotal = savingsPerHire * kpis.totalHired;

  return (
    <div className="screen-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            👔 TA + Hub Operations
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Manager view — Hyderabad workforce ops</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Live pipeline across all 3 hubs and 4 roles. Drill into recruiters, hubs, and channels.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2.5 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
        >
          ↓ Recruiter pipeline view
        </button>
      </div>

      {/* TOP KPI strip */}
      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <KpiCard label="Monthly quota fill" value={`${kpis.quotaFillPct}%`} sub={`${kpis.totalHired} / ${kpis.totalQuota} hires`} tone={kpis.quotaFillPct >= 75 ? 'green' : kpis.quotaFillPct >= 40 ? 'amber' : 'red'} />
        <KpiCard label="Avg cost-per-hire" value={INR(kpis.avgCph)} sub={`vs industry ${INR(INDUSTRY_AVG_CPH)}`} tone="green" />
        <KpiCard label="Total spend (mo)" value={INR(kpis.totalSpend)} sub={`Saved ${INR(savingsTotal)} vs industry`} tone="green" />
        <KpiCard label="Active recruiters" value={kpis.activeRecruiters} sub={`Across 3 hubs`} tone="blue" />
        <KpiCard label="Avg candidate score" value={`${kpis.avgScore}/100`} sub={`Pre-screen quality`} tone="blue" />
      </div>

      {/* 14-day trend */}
      <Card title="Last 14 days · pipeline trend" sub="Daily sign-ups + hires across all hubs">
        <Trend14Day days={days} />
      </Card>

      {/* HUB comparison */}
      <Card title="Hub performance" sub="Compare Bala Nagar · Attapur · Kompally side-by-side">
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {hubRows.map((h) => (
            <HubCard key={h.hub.id} h={h} />
          ))}
        </div>
      </Card>

      {/* RECRUITER leaderboard */}
      <Card title="Recruiter leaderboard" sub="Sorted by hires this month">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg)]">
                {['Rank', 'Recruiter', 'Sign-ups', 'Qualified', 'Interviewed', 'Hired', 'Conv %', 'Avg score'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border)] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recruiterRows.length === 0 && (
                <tr><td colSpan={8} className="p-5 text-center text-[var(--text-muted)] text-sm">No field-recruited candidates yet. Turn on FIELD MODE in the topbar and sign someone up.</td></tr>
              )}
              {recruiterRows.map((r, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                const convCol = r.convPct >= 30 ? 'var(--accent-green)' : r.convPct >= 15 ? '#B45309' : 'var(--accent-red)';
                return (
                  <tr key={r.name} className="hover:bg-jt-blue-light transition-colors">
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm font-bold">{medal}</td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm">
                      <div className="font-bold">{r.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">📍 Field recruiter</div>
                    </td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm font-semibold">{r.signups}</td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm">{r.qualified}</td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm">{r.interviewed}</td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm">
                      <span className="font-bold text-accent-green">{r.hired}</span>
                    </td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm">
                      <span style={{ color: convCol }} className="font-bold">{r.convPct}%</span>
                    </td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm font-semibold">{r.avgScore}/100</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Conversion FUNNEL */}
      <Card title="Conversion funnel" sub="Where are we leaking candidates?">
        <Funnel funnel={funnel} />
      </Card>

      {/* Channel ROI */}
      <Card title="Channel ROI · cost-per-hire by source" sub="Where to double-down, where to cut spend">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg)]">
                {['Channel', 'Sign-ups', 'Hired', 'Conv %', 'Cost / hire', 'Total spend'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border)] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {channelRows.map((s) => {
                const col = SOURCE_COLOURS[s.source] || '#64748B';
                const cphCol = s.costPerHire <= 600 ? 'var(--accent-green)' : s.costPerHire <= 1800 ? '#B45309' : 'var(--accent-red)';
                return (
                  <tr key={s.source} className="hover:bg-jt-blue-light transition-colors">
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm">
                      <span className="inline-block px-2 py-1 rounded text-[11px] font-bold" style={{ background: col + '20', color: col }}>
                        {s.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm">{s.signups}</td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm font-bold text-accent-green">{s.hired}</td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm">{s.conversionPct}%</td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm">
                      <span style={{ color: cphCol }} className="font-bold">{INR(s.costPerHire)}</span>
                    </td>
                    <td className="px-4 py-3 border-b border-[var(--border)] text-sm font-semibold">{INR(s.totalSpend)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-3">
          Benchmark from CHANNEL_COST table — Field walk-ups & Kirana referrals are the most cost-efficient. Apna/QuikrJobs have higher CAC but reach scale.
        </p>
      </Card>

      {/* Quota matrix */}
      <Card title="Quota tracker · role × hub" sub="Where we're behind and where we're ahead">
        <QuotaMatrix quotaMatrix={quotaMatrix} />
      </Card>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function Card({ title, sub, children }) {
  return (
    <div className="bg-white rounded-card-lg p-5 sm:p-6 border border-[var(--border)] shadow-jt-sm mb-5">
      <div className="mb-4">
        <div className="text-base sm:text-lg font-bold text-jt-blue tracking-tight">{title}</div>
        {sub && <div className="text-[12px] text-[var(--text-muted)] mt-0.5">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, tone }) {
  const toneStyles = {
    green: { value: 'var(--accent-green)', sub: 'var(--accent-green)' },
    amber: { value: '#B45309', sub: '#B45309' },
    red:   { value: 'var(--accent-red)', sub: 'var(--accent-red)' },
    blue:  { value: 'var(--jt-blue)', sub: 'var(--text-muted)' },
  };
  const t = toneStyles[tone] || toneStyles.blue;
  return (
    <div className="bg-white rounded-card p-4 border border-[var(--border)] shadow-jt-sm">
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">{label}</div>
      <div className="text-2xl sm:text-3xl font-extrabold mt-1" style={{ color: t.value }}>{value}</div>
      <div className="text-[11px] mt-0.5 font-semibold" style={{ color: t.sub }}>{sub}</div>
    </div>
  );
}

function HubCard({ h }) {
  const fillCol = h.fillPct >= 75 ? 'var(--accent-green)' : h.fillPct >= 40 ? '#B45309' : 'var(--accent-red)';
  return (
    <div className="rounded-card-lg p-5 border border-[var(--border)]" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Hub</div>
          <div className="text-lg font-extrabold text-jt-blue">📍 {h.hub.name}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold" style={{ color: fillCol }}>{h.fillPct}%</div>
          <div className="text-[11px] text-[var(--text-muted)]">quota filled</div>
        </div>
      </div>
      <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, h.fillPct)}%`, background: fillCol }} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[12px]">
        <div><span className="text-[var(--text-muted)]">Sign-ups:</span> <strong>{h.signups}</strong></div>
        <div><span className="text-[var(--text-muted)]">Qualified:</span> <strong>{h.qualified}</strong></div>
        <div><span className="text-[var(--text-muted)]">Hired:</span> <strong className="text-accent-green">{h.hired}</strong> / {h.quota}</div>
        <div><span className="text-[var(--text-muted)]">Cost/hire:</span> <strong>{h.cph ? '₹' + h.cph.toLocaleString('en-IN') : '—'}</strong></div>
        <div className="col-span-2"><span className="text-[var(--text-muted)]">Avg score:</span> <strong>{h.avgScore}/100</strong></div>
      </div>
    </div>
  );
}

function Funnel({ funnel }) {
  const max = funnel[0]?.n || 1;
  return (
    <div className="space-y-2.5">
      {funnel.map((s, i) => {
        const width = Math.max(8, (s.n / max) * 100);
        const drop = i > 0 ? funnel[i - 1].n - s.n : 0;
        const dropPct = i > 0 && funnel[i - 1].n ? Math.round((drop / funnel[i - 1].n) * 100) : 0;
        return (
          <div key={s.stage}>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-28 shrink-0 font-semibold text-jt-blue">{s.stage}</div>
              <div className="flex-1 h-9 bg-[var(--bg)] rounded-lg overflow-hidden relative">
                <div
                  className="h-full flex items-center px-3 text-white text-sm font-bold transition-all"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, var(--jt-orange), var(--jt-orange-dark))`,
                  }}
                >
                  {s.n}
                </div>
              </div>
              <div className="w-32 shrink-0 text-right">
                <span className="text-[12px] font-bold text-jt-blue">{s.pctOfApplied}%</span>
                <span className="text-[11px] text-[var(--text-muted)]"> of applied</span>
              </div>
            </div>
            {i > 0 && drop > 0 && (
              <div className="ml-32 text-[11px] text-accent-red mt-0.5">
                ↓ {drop} dropped ({dropPct}%)
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuotaMatrix({ quotaMatrix }) {
  const hubs = ['bala_nagar', 'attapur', 'kompally'];
  const roles = ['van_delivery', 'picker', 'packer', 'warehouse_loader'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border)]">Role \ Hub</th>
            {hubs.map((hId) => (
              <th key={hId} className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
                📍 {HUB_BY_ID[hId]?.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roles.map((roleId) => {
            const roleDef = ROLE_BY_ID[roleId];
            return (
              <tr key={roleId}>
                <td className="px-3 py-3 border-b border-[var(--border)] font-bold text-sm">
                  {roleDef?.emoji} {roleDef?.short}
                </td>
                {hubs.map((hId) => {
                  const cell = quotaMatrix.find((m) => m.hubId === hId && m.roleId === roleId);
                  if (!cell) return <td key={hId} className="px-3 py-3 border-b border-[var(--border)] text-[var(--text-muted)]">—</td>;
                  const fillCol = cell.fillPct >= 75 ? 'var(--accent-green)' : cell.fillPct >= 40 ? '#B45309' : 'var(--accent-red)';
                  return (
                    <td key={hId} className="px-3 py-3 border-b border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: fillCol }}>
                          {cell.filled}/{cell.target}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          (+{cell.inPipeline} in pipe)
                        </span>
                      </div>
                      <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden mt-1">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, cell.fillPct)}%`, background: fillCol }} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Trend14Day({ days }) {
  const maxSignups = Math.max(...days.map((d) => d.signups), 1);
  const W = 720;
  const H = 120;
  const PAD = 24;
  const innerW = W - PAD * 2;
  const innerH = H - PAD;
  const step = innerW / (days.length - 1);

  const signupPts = days
    .map((d, i) => `${PAD + i * step},${PAD + innerH - (d.signups / maxSignups) * innerH}`)
    .join(' ');
  const hiredPts = days
    .map((d, i) => `${PAD + i * step},${PAD + innerH - (d.hired / maxSignups) * innerH}`)
    .join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* baseline */}
        <line x1={PAD} y1={PAD + innerH} x2={W - PAD} y2={PAD + innerH} stroke="#E5E7EB" strokeWidth="1" />

        {/* sign-ups line */}
        <polyline fill="none" stroke="var(--jt-orange)" strokeWidth="2.5" points={signupPts} />
        {days.map((d, i) => (
          <circle key={`s${i}`} cx={PAD + i * step} cy={PAD + innerH - (d.signups / maxSignups) * innerH} r="3" fill="var(--jt-orange)" />
        ))}

        {/* hires line */}
        <polyline fill="none" stroke="var(--accent-green)" strokeWidth="2" points={hiredPts} strokeDasharray="4,3" />
        {days.map((d, i) => (
          <circle key={`h${i}`} cx={PAD + i * step} cy={PAD + innerH - (d.hired / maxSignups) * innerH} r="2.5" fill="var(--accent-green)" />
        ))}
      </svg>
      <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
        <div className="flex gap-4 text-[12px]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 inline-block bg-jt-orange rounded" /> Sign-ups</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 inline-block bg-accent-green rounded" style={{ borderTop: '1px dashed currentColor' }} /> Hires</span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)]">
          {days[0].date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {days[days.length - 1].date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>
      </div>
    </div>
  );
}

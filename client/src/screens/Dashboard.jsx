import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useFlow } from '../lib/flowStore.jsx';

const FILTERS = ['All', 'Hired', 'Offer sent', 'Interview', 'Qualified', 'Rejected'];

const SOURCE_COLOURS = {
  Apna: '#0066FF',
  WorkIndia: '#FF6B00',
  QuikrJobs: '#7C3AED',
  Vahan: '#16A34A',
  'WhatsApp Grp': '#25D366',
  'Kirana Ref': '#F26522',
  Direct: '#64748B',
};

function statusPillClass(status) {
  if (status === 'Hired') return 'bg-accent-green-light text-accent-green';
  if (status === 'Offer sent') return 'bg-jt-blue-light text-jt-blue';
  if (status === 'Interview') return 'bg-[#FEF3C7] text-[#B45309]';
  if (status === 'Qualified') return 'bg-jt-blue-light text-jt-blue';
  if (status === 'Rejected') return 'bg-[#FEE2E2] text-accent-red';
  return 'bg-[var(--border)] text-[var(--text-muted)]';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { update, toast } = useFlow();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

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

  const visible = filter === 'All' ? candidates : candidates.filter((c) => c.status === filter);

  const stats = {
    applied: candidates.length,
    qualified: candidates.filter((c) => c.score >= 60).length,
    booked: candidates.filter((c) => c.slot && c.slot !== '—').length,
    hired: candidates.filter((c) => c.status === 'Hired').length,
  };

  function viewScore(c) {
    toast(`${c.name}: ${c.score}/100 · ${c.status}`);
  }

  function bookSlot() {
    navigate('/slot');
  }

  function sendOffer(c) {
    update({ selectedCandidate: c });
    navigate('/offer');
  }

  function exportCsv() {
    const rows = [['Name', 'Phone', 'Source', 'Lang', 'Age', 'Exp', 'Distance', 'Score', 'Status', 'Slot']];
    candidates.forEach((c) => {
      rows.push([c.name, c.phone, c.source || 'Direct', c.lang, c.age, c.experience_years, c.distance_km, c.score, c.status, c.slot || '—']);
    });
    const csv = rows.map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'atlas-pipeline.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Pipeline exported');
  }

  return (
    <div className="screen-enter">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Recruiter</div>
          <h2 className="text-2xl font-bold tracking-tight">Hyderabad Warehouse · Loader Pipeline</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('/jd')}
            className="px-4 py-2.5 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
          >
            + New role
          </button>
          <button
            onClick={exportCsv}
            className="px-4 py-2.5 rounded-xl bg-jt-blue text-white font-semibold hover:bg-jt-blue-dark"
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        <StatCard label="Applied (7d)" num={stats.applied} delta="↑ 312% vs old funnel" />
        <StatCard label="Qualified" num={stats.qualified} delta="68% pass rate" />
        <StatCard label="Slots booked" num={stats.booked} delta="94% show-up" />
        <StatCard label="Hired" num={stats.hired} delta="Avg 2.1 days" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => {
          const count = f === 'All' ? candidates.length : candidates.filter((c) => c.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'px-3.5 py-2 rounded-full border text-[13px] font-semibold transition-colors',
                filter === f
                  ? 'bg-jt-blue text-white border-jt-blue'
                  : 'bg-white text-[var(--text-muted)] border-[var(--border)] hover:bg-jt-blue-light hover:text-jt-blue',
              ].join(' ')}
            >
              {f} <span className="opacity-70">· {count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-card overflow-hidden shadow-jt-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg)]">
                {['Candidate', 'Source', 'Lang', 'Age', 'Exp', 'Dist', 'Score', 'Status', 'Slot', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3.5 text-[12px] uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={10} className="p-7 text-center text-[var(--text-muted)]">Loading…</td></tr>
              )}
              {!loading && visible.length === 0 && (
                <tr><td colSpan={10} className="p-7 text-center text-[var(--text-muted)]">No candidates match this filter.</td></tr>
              )}
              {visible.map((c) => {
                const src = c.source || 'Direct';
                const srcCol = SOURCE_COLOURS[src] || '#64748B';
                const scoreCol = c.score >= 80 ? 'var(--accent-green)' : c.score >= 60 ? '#B45309' : 'var(--accent-red)';
                return (
                  <tr key={c.id} className="hover:bg-jt-blue-light transition-colors">
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm">
                      <div className="font-bold">{c.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{c.phone}</div>
                    </td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm">
                      <span
                        className="inline-block px-2 py-1 rounded text-[11px] font-bold"
                        style={{ background: srcCol + '20', color: srcCol }}
                      >
                        {src}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm">{c.lang}</td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm">{c.age}</td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm">{c.experience_years} yr</td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm">{c.distance_km} km</td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm">
                      <strong style={{ color: scoreCol }}>{c.score}</strong>/100
                    </td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm">
                      <span className={'inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ' + statusPillClass(c.status)}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-xs">{c.slot || '—'}</td>
                    <td className="px-4 py-4 border-b border-[var(--border)]">
                      <div className="flex gap-1.5">
                        <IconBtn title="View score" onClick={() => viewScore(c)}>👁</IconBtn>
                        <IconBtn title="Book slot" onClick={bookSlot}>📅</IconBtn>
                        <IconBtn title="Send offer" onClick={() => sendOffer(c)}>📄</IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, num, delta }) {
  return (
    <div className="bg-white rounded-card p-5 border border-[var(--border)] shadow-jt-sm">
      <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">{label}</div>
      <div className="text-3xl font-extrabold mt-1 text-jt-blue">{num}</div>
      <div className="text-xs text-accent-green mt-1 font-semibold">{delta}</div>
    </div>
  );
}

function IconBtn({ children, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-8 h-8 rounded-lg border border-[var(--border)] bg-white text-jt-blue text-sm flex items-center justify-center hover:bg-jt-orange hover:text-white hover:border-jt-orange transition-colors"
    >
      {children}
    </button>
  );
}

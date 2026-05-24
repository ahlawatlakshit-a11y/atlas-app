import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useFlow } from '../lib/flowStore.jsx';
import { ROLE_BY_ID, HUB_BY_ID, ROLES, HUBS } from '../lib/roleCatalog.js';

const STATUS_FILTERS = ['All', 'Hired', 'Offer sent', 'Interview', 'Qualified', 'Rejected'];

const SOURCE_COLOURS = {
  Apna: '#0066FF',
  WorkIndia: '#FF6B00',
  QuikrJobs: '#7C3AED',
  Vahan: '#16A34A',
  'WhatsApp Grp': '#25D366',
  'Kirana Ref': '#F26522',
  Field: '#16A34A',
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
  const { state, update, toast } = useFlow();
  const { managerMode } = state;
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [hubFilter, setHubFilter] = useState('All');

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

  const visible = useMemo(() => {
    return candidates.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (roleFilter !== 'All' && c.role !== roleFilter) return false;
      if (hubFilter !== 'All' && c.hub !== hubFilter) return false;
      return true;
    });
  }, [candidates, statusFilter, roleFilter, hubFilter]);

  const stats = {
    applied: candidates.length,
    qualified: candidates.filter((c) => c.score >= 60).length,
    booked: candidates.filter((c) => c.slot && c.slot !== '—').length,
    hired: candidates.filter((c) => c.status === 'Hired').length,
    field: candidates.filter((c) => c.source === 'Field').length,
  };

  function viewScore(c) { toast(`${c.name}: ${c.score}/100 · ${c.status}`); }
  function bookSlot() { navigate('/slot'); }
  function sendOffer(c) {
    update({ selectedCandidate: c });
    navigate('/offer');
  }

  function exportCsv() {
    const rows = [['Name', 'Phone', 'Role', 'Hub', 'Source', 'Recruiter', 'Lang', 'Age', 'Exp', 'Distance', 'Score', 'Status', 'Slot', 'GPS']];
    candidates.forEach((c) => {
      const gps = c.gps_lat && c.gps_lng ? `${c.gps_lat},${c.gps_lng}` : '';
      const roleName = ROLE_BY_ID[c.role]?.name || c.role || '';
      const hubName = HUB_BY_ID[c.hub]?.name || c.hub || '';
      rows.push([c.name, c.phone, roleName, hubName, c.source || 'Direct', c.recruiter_id || '', c.lang, c.age, c.experience_years, c.distance_km, c.score, c.status, c.slot || '—', gps]);
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

  function openGoogleMaps(lat, lng) {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="screen-enter">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Recruiter</div>
          <h2 className="text-2xl font-bold tracking-tight">Hyderabad Field Pipeline</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Van Delivery · Pickers · Packers · Loaders — across Bala Nagar, Attapur, Kompally
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {managerMode && (
            <button
              onClick={() => navigate('/manager')}
              className="px-4 py-2.5 rounded-xl text-white font-semibold hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--jt-blue), var(--jt-blue-dark))' }}
            >
              👔 Manager view ↑
            </button>
          )}
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
      <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <StatCard label="Applied (7d)" num={stats.applied} delta="↑ 312% vs old funnel" />
        <StatCard label="Qualified" num={stats.qualified} delta="68% pass rate" />
        <StatCard label="Slots booked" num={stats.booked} delta="94% show-up" />
        <StatCard label="Hired" num={stats.hired} delta="Avg 2.1 days" />
        <StatCard label="Field sign-ups" num={stats.field} delta="📍 walk-up + chowk" />
      </div>

      {/* Role filter */}
      <FilterRow label="Role">
        <FilterPill active={roleFilter === 'All'} onClick={() => setRoleFilter('All')}>
          All · {candidates.length}
        </FilterPill>
        {ROLES.map((r) => {
          const count = candidates.filter((c) => c.role === r.id).length;
          return (
            <FilterPill key={r.id} active={roleFilter === r.id} onClick={() => setRoleFilter(r.id)}>
              {r.emoji} {r.name} · {count}
            </FilterPill>
          );
        })}
      </FilterRow>

      {/* Hub filter */}
      <FilterRow label="Hub">
        <FilterPill active={hubFilter === 'All'} onClick={() => setHubFilter('All')}>
          All · {candidates.length}
        </FilterPill>
        {HUBS.filter((h) => h.id !== 'patancheru').map((h) => {
          const count = candidates.filter((c) => c.hub === h.id).length;
          return (
            <FilterPill key={h.id} active={hubFilter === h.id} onClick={() => setHubFilter(h.id)}>
              📍 {h.name} · {count}
            </FilterPill>
          );
        })}
      </FilterRow>

      {/* Status filter */}
      <FilterRow label="Status">
        {STATUS_FILTERS.map((s) => {
          const count = s === 'All' ? candidates.length : candidates.filter((c) => c.status === s).length;
          return (
            <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s} · {count}
            </FilterPill>
          );
        })}
      </FilterRow>

      {/* Table */}
      <div className="bg-white rounded-card overflow-hidden shadow-jt-sm mt-3">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg)]">
                {['Candidate', 'Role', 'Hub', 'Source', 'Lang', 'Score', 'Status', 'Slot', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3.5 text-[12px] uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border)] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="p-7 text-center text-[var(--text-muted)]">Loading…</td></tr>
              )}
              {!loading && visible.length === 0 && (
                <tr><td colSpan={9} className="p-7 text-center text-[var(--text-muted)]">No candidates match these filters.</td></tr>
              )}
              {visible.map((c) => {
                const src = c.source || 'Direct';
                const srcCol = SOURCE_COLOURS[src] || '#64748B';
                const scoreCol = c.score >= 80 ? 'var(--accent-green)' : c.score >= 60 ? '#B45309' : 'var(--accent-red)';
                const initials = (c.name || '').split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('');
                const roleDef = ROLE_BY_ID[c.role];
                const hubDef = HUB_BY_ID[c.hub];
                return (
                  <tr key={c.id} className="hover:bg-jt-blue-light transition-colors">
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm">
                      <div className="flex items-center gap-3">
                        {c.photo ? (
                          <img src={c.photo} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-[var(--border)]" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-jt-blue-light text-jt-blue flex items-center justify-center font-bold text-sm shrink-0">
                            {initials || '?'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold">{c.name}</div>
                          <div className="text-xs text-[var(--text-muted)]">{c.phone}</div>
                          {c.recruiter_id && (
                            <div className="text-[11px] text-accent-green font-semibold mt-0.5">
                              📍 by {c.recruiter_id}
                              {c.gps_lat && c.gps_lng && (
                                <button
                                  onClick={() => openGoogleMaps(c.gps_lat, c.gps_lng)}
                                  className="ml-1 underline hover:text-jt-blue"
                                  title="Open in Google Maps"
                                >
                                  · map
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm whitespace-nowrap">
                      {roleDef ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-jt-orange-light text-jt-orange-dark text-[12px] font-bold">
                          {roleDef.emoji} {roleDef.short}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm whitespace-nowrap">
                      {hubDef ? (
                        <span className="text-[12px] font-semibold text-jt-blue">📍 {hubDef.name}</span>
                      ) : (
                        <span className="text-[var(--text-muted)] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm">
                      <span className="inline-block px-2 py-1 rounded text-[11px] font-bold" style={{ background: srcCol + '20', color: srcCol }}>
                        {src}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm">{c.lang}</td>
                    <td className="px-4 py-4 border-b border-[var(--border)] text-sm whitespace-nowrap">
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

function FilterRow({ label, children }) {
  return (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-bold w-12 shrink-0">
        {label}
      </div>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-colors',
        active
          ? 'bg-jt-blue text-white border-jt-blue'
          : 'bg-white text-[var(--text-muted)] border-[var(--border)] hover:bg-jt-blue-light hover:text-jt-blue',
      ].join(' ')}
    >
      {children}
    </button>
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

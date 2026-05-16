import { useNavigate } from 'react-router-dom';
import { useFlow } from '../lib/flowStore.jsx';

const ICONS = {
  Age: '🎂',
  Experience: '🛠',
  Distance: '📍',
  'Lift 25kg': '💪',
  'Night shift': '🌙',
};

function formatValue(label, v) {
  if (v == null) return '—';
  if (label === 'Age') return `${v}`;
  if (label === 'Experience') return `${v} years`;
  if (label === 'Distance') return `${v} km`;
  if (label === 'Lift 25kg') return v === 'yes' ? 'Yes, easily' : v === 'partial' ? 'Partial' : 'No';
  if (label === 'Night shift') return v === 'yes' ? 'Yes, every day' : v === 'partial' ? 'Partial' : 'No';
  return String(v);
}

export default function Score() {
  const navigate = useNavigate();
  const { state } = useFlow();
  const { score, verdict, breakdown } = state;

  // If user landed here directly without a score, send them back
  if (score == null) {
    return (
      <div className="screen-enter bg-white rounded-card-lg p-7 shadow-jt-sm border border-[var(--border)]">
        <p className="text-[var(--text-muted)]">No screening result yet.</p>
        <button
          onClick={() => navigate('/language')}
          className="mt-3 px-5 py-3 rounded-xl bg-jt-orange text-white font-semibold"
        >
          Start screening →
        </button>
      </div>
    );
  }

  const passed = score >= 60;
  const deg = (score / 100) * 360;
  const verdictLabel = verdict || (score >= 80 ? 'STRONG MATCH' : passed ? 'QUALIFIED' : 'NOT QUALIFIED');
  const ringColor = passed ? 'var(--accent-green)' : 'var(--accent-red)';
  const message = passed
    ? 'You meet all critical requirements. Pick a slot below to confirm your in-person interview.'
    : 'Thanks for applying. We will keep your profile and notify you when a better-fit role opens up.';

  return (
    <div className="screen-enter bg-white rounded-card-lg p-7 shadow-jt-sm border border-[var(--border)]">
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        Worker · Step 3 of 5
      </div>
      <h2 className="text-2xl font-bold mb-1.5 tracking-tight">Your screening result</h2>
      <p className="text-[var(--text-muted)] text-sm mb-5">
        ATLAS scored your answers against the role criteria in real time.
      </p>

      {/* Hero */}
      <div
        className="rounded-card-lg p-7 text-center text-white"
        style={{ background: 'linear-gradient(135deg, var(--jt-blue), var(--jt-blue-dark))' }}
      >
        <div className="relative w-[180px] h-[180px] mx-auto my-3 rounded-full flex flex-col items-center justify-center"
             style={{
               background: `conic-gradient(${ringColor} 0deg ${deg}deg, rgba(255,255,255,.15) ${deg}deg 360deg)`,
             }}>
          <div
            className="absolute inset-3 rounded-full"
            style={{ background: 'var(--jt-blue-dark)' }}
          />
          <div className="relative z-10 text-[56px] font-extrabold leading-none">{score}</div>
          <div className="relative z-10 text-xs uppercase tracking-wider opacity-80 mt-1">out of 100</div>
        </div>

        <span
          className={[
            'inline-block mt-3 px-5 py-2 rounded-full text-white font-bold text-sm tracking-wider',
            passed ? 'bg-accent-green' : 'bg-accent-red',
          ].join(' ')}
        >
          {verdictLabel}
        </span>
        <p className="mt-3.5 opacity-85 text-sm">{message}</p>
      </div>

      {/* Breakdown */}
      <div className="mt-6 grid gap-3">
        {(breakdown || []).map((row) => {
          const pct = (row.pts / row.max) * 100;
          const barColor =
            pct >= 70 ? 'var(--accent-green)' : pct >= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)';
          return (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl"
              style={{ background: 'var(--bg)' }}
            >
              <div className="flex items-center gap-3 min-w-[160px]">
                <div className="w-9 h-9 rounded-lg bg-jt-orange-light text-jt-orange-dark flex items-center justify-center text-lg">
                  {ICONS[row.label] || '•'}
                </div>
                <div>
                  <div className="font-semibold">{row.label}</div>
                  <div className="text-xs text-[var(--text-muted)] font-medium">
                    {formatValue(row.label, row.value)}
                  </div>
                </div>
              </div>
              <div className="flex-1 h-2 bg-[var(--border)] rounded-full mx-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
              <div className="font-bold text-jt-blue min-w-[60px] text-right">
                {row.pts}/{row.max}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-7">
        <button
          onClick={() => navigate('/language')}
          className="px-5 py-3 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
        >
          ← Restart
        </button>
        {passed && (
          <button
            onClick={() => navigate('/slot')}
            className="px-6 py-4 rounded-xl bg-jt-orange text-white font-semibold text-base shadow-[0_4px_12px_rgba(242,101,34,.3)] hover:bg-jt-orange-dark"
          >
            Book interview slot →
          </button>
        )}
      </div>
    </div>
  );
}

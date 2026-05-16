import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlow } from '../lib/flowStore.jsx';
import { api } from '../lib/api.js';

function formatDayDate(iso) {
  // iso = "2026-05-12"
  const d = new Date(iso + 'T00:00:00');
  return {
    day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  };
}

function formatTime(t) {
  // t = "09:00" → "09:00 AM"
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function Slot() {
  const navigate = useNavigate();
  const { state, update } = useFlow();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIso, setSelectedIso] = useState(state.selectedSlot?.iso || null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get('/slot');
        if (!cancelled) setSlots(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function confirm() {
    if (!selectedIso) return;
    const slot = slots.find((s) => s.iso === selectedIso);
    setBooking(true);
    try {
      const result = await api.post('/slot', {
        slot_iso: selectedIso,
        candidate_id: null,
        job_id: null,
      });
      update({ selectedSlot: slot, booking: result });
      navigate('/confirm');
    } catch (err) {
      setError(err.message);
      setBooking(false);
    }
  }

  return (
    <div className="screen-enter bg-white rounded-card-lg p-7 shadow-jt-sm border border-[var(--border)]">
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        Worker · Step 4 of 5
      </div>
      <h2 className="text-2xl font-bold mb-1.5 tracking-tight">Pick your interview slot</h2>
      <p className="text-[var(--text-muted)] text-sm mb-5">
        In-person interview at Jumbotail Warehouse, Patancheru, Hyderabad.
      </p>

      {loading && <div className="text-[var(--text-muted)]">Loading slots…</div>}
      {error && <div className="text-accent-red">{error}</div>}

      {!loading && !error && (
        <div
          className="mt-5 grid gap-3.5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
        >
          {slots.map((s) => {
            const { day, date } = formatDayDate(s.date);
            const isSelected = selectedIso === s.iso;
            return (
              <button
                key={s.iso}
                disabled={s.taken}
                onClick={() => setSelectedIso(s.iso)}
                className={[
                  'p-4 rounded-2xl border-2 text-center transition-all',
                  s.taken
                    ? 'opacity-40 cursor-not-allowed border-[var(--border)] bg-white'
                    : isSelected
                    ? 'border-jt-orange bg-jt-orange-light -translate-y-0.5'
                    : 'border-[var(--border)] bg-white hover:border-jt-orange hover:-translate-y-0.5',
                ].join(' ')}
              >
                <div className="font-bold text-jt-blue text-base">{day}</div>
                <div className="text-xs text-[var(--text-muted)]">{date}</div>
                <div className="text-lg font-extrabold mt-2 text-jt-orange-dark">{formatTime(s.time)}</div>
                {s.taken && (
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Taken</div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-7">
        <button
          onClick={() => navigate('/score')}
          className="px-5 py-3 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
        >
          ← Back
        </button>
        <button
          onClick={confirm}
          disabled={!selectedIso || booking}
          className="px-6 py-4 rounded-xl bg-jt-orange text-white font-semibold text-base shadow-[0_4px_12px_rgba(242,101,34,.3)] hover:bg-jt-orange-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {booking ? 'Booking…' : 'Confirm slot →'}
        </button>
      </div>
    </div>
  );
}

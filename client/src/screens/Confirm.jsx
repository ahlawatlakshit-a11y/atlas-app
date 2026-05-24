import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlow } from '../lib/flowStore.jsx';
import { api } from '../lib/api.js';

function fullDateTime(slot) {
  if (!slot) return '—';
  const d = new Date(slot.date + 'T00:00:00');
  const datePart = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const [h, m] = slot.time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${datePart}, ${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function shortSlot(slot) {
  if (!slot) return null;
  const d = new Date(slot.date + 'T00:00:00');
  const datePart = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const [h, m] = slot.time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${datePart}, ${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

const LANG_LABEL = { hi: 'Hindi', en: 'English', te: 'Telugu' };

export default function Confirm() {
  const navigate = useNavigate();
  const { state, reset, toast } = useFlow();
  const { candidate, selectedSlot, booking, score, answers, lang, recruiterMode, recruiterId, intake, role, hub } = state;
  const [savedId, setSavedId] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const savedOnce = useRef(false);

  // Persist the candidate to the backend ONCE on mount, so they appear in the dashboard.
  useEffect(() => {
    if (savedOnce.current) return;
    if (!selectedSlot || !booking) return;
    savedOnce.current = true;

    const payload = {
      name: candidate?.name || 'Walk-up candidate',
      phone: candidate?.phone || '',
      source: recruiterMode ? 'Field' : 'Direct',
      lang: LANG_LABEL[lang] || 'English',
      age: typeof answers?.[0] === 'number' ? answers[0] : null,
      experience_years: typeof answers?.[1] === 'number' ? answers[1] : null,
      distance_km: typeof answers?.[2] === 'number' ? answers[2] : null,
      score,
      status: 'Interview',
      slot: shortSlot(selectedSlot),
      recruiter_id: recruiterMode ? recruiterId : null,
      gps_lat: intake?.gps?.lat ?? null,
      gps_lng: intake?.gps?.lng ?? null,
      photo: intake?.photo || null,
      role: role || null,
      hub: hub || null,
    };

    api
      .post('/candidates', payload)
      .then((row) => setSavedId(row.id))
      .catch((err) => setSaveError(err.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!selectedSlot || !booking) {
    return (
      <div className="screen-enter bg-white rounded-card-lg p-7 shadow-jt-sm border border-[var(--border)]">
        <p className="text-[var(--text-muted)]">No booking yet.</p>
        <button
          onClick={() => navigate(recruiterMode ? '/intake' : '/language')}
          className="mt-3 px-5 py-3 rounded-xl bg-jt-orange text-white font-semibold"
        >
          Start over →
        </button>
      </div>
    );
  }

  const dateStr = fullDateTime(selectedSlot);
  const refId = booking.reference_id;

  function sendWhatsApp() {
    const msg = encodeURIComponent(
      `Hi ATLAS — confirming my warehouse loader interview on ${dateStr}. Reference ${refId}. Name: ${candidate.name}.`
    );
    const phone = (candidate.phone || '').replace(/\D/g, '');
    const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function startOver() {
    reset();
    navigate('/');
  }

  function nextWalkup() {
    reset();
    navigate('/intake');
  }

  return (
    <div className="screen-enter bg-white rounded-card-lg p-12 shadow-jt-sm border border-[var(--border)] text-center">
      <div className="text-[80px]">✅</div>
      <h2 className="text-2xl font-bold mt-2 tracking-tight">All set, {candidate.name}!</h2>
      <p className="text-[var(--text-muted)] text-sm mt-1">Your interview is booked.</p>

      <div
        className="mx-auto mt-5 max-w-[480px] text-left rounded-card-lg p-7"
        style={{ background: 'var(--jt-blue-light)' }}
      >
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          📅 Interview details
        </div>
        <div className="mt-2 leading-loose text-sm">
          <div><strong>Candidate:</strong> {candidate.name}</div>
          <div><strong>Phone:</strong> {candidate.phone}</div>
          <div><strong>Role:</strong> Warehouse Loader</div>
          <div><strong>Date & time:</strong> {dateStr}</div>
          <div><strong>Where:</strong> Jumbotail Warehouse, Patancheru, Hyderabad</div>
          <div><strong>Bring:</strong> Aadhaar card (optional first round)</div>
          <div><strong>Score:</strong> {score}/100</div>
          <div><strong>Reference ID:</strong> {refId}</div>
          {recruiterMode && (
            <div className="mt-2 pt-2 border-t border-white/60 text-[12px] text-[var(--text-muted)]">
              📍 Recruited by <strong>{recruiterId}</strong>
              {intake?.gps && (
                <> · GPS {intake.gps.lat.toFixed(4)}, {intake.gps.lng.toFixed(4)}</>
              )}
              {savedId && <> · Candidate #{savedId} saved</>}
              {saveError && <span className="text-accent-red"> · Save failed: {saveError}</span>}
            </div>
          )}
        </div>
      </div>

      <p className="text-[var(--text-muted)] text-xs mt-5 max-w-[480px] mx-auto">
        A WhatsApp confirmation has been sent. Walk-in welcome — no documents needed for first round.
      </p>

      <div className="flex justify-center gap-3 mt-6 flex-wrap">
        {recruiterMode ? (
          <>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-3 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
            >
              View dashboard
            </button>
            <button
              onClick={nextWalkup}
              className="px-6 py-4 rounded-xl text-white font-extrabold text-base shadow-lg hover:opacity-90"
              style={{ background: 'var(--accent-green)' }}
            >
              + Sign up next walk-up →
            </button>
          </>
        ) : (
          <>
            <button
              onClick={startOver}
              className="px-5 py-3 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
            >
              Back to home
            </button>
            <button
              onClick={sendWhatsApp}
              className="px-6 py-4 rounded-xl text-white font-semibold text-base shadow-[0_4px_12px_rgba(37,211,102,.35)] hover:opacity-90"
              style={{ background: '#25D366' }}
            >
              📲 Send WhatsApp confirmation
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlow } from '../lib/flowStore.jsx';
import { ROLES, HUBS, DEFAULT_ROLE_ID, DEFAULT_HUB_ID } from '../lib/roleCatalog.js';

const LANGS = [
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी', sub: 'Hindi' },
  { code: 'en', flag: '🇬🇧', name: 'English', sub: 'English' },
  { code: 'te', flag: '🇮🇳', name: 'తెలుగు', sub: 'Telugu' },
];

function downscaleImage(file, maxEdge = 480) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Intake() {
  const navigate = useNavigate();
  const { state, update, updateIntake, toast } = useFlow();
  const { intake, recruiterId } = state;

  const [hub, setHub] = useState(state.hub || DEFAULT_HUB_ID);
  const [role, setRole] = useState(state.role || DEFAULT_ROLE_ID);
  const [lang, setLang] = useState(state.lang === 'en' || state.lang === 'hi' || state.lang === 'te' ? state.lang : 'te');
  const [gpsStatus, setGpsStatus] = useState('Asking for location…');
  const fileRef = useRef(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('GPS not available on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = +pos.coords.latitude.toFixed(5);
        const lng = +pos.coords.longitude.toFixed(5);
        updateIntake({ gps: { lat, lng } });
        setGpsStatus(`📍 ${lat}, ${lng} (±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => setGpsStatus(`📍 Location unavailable (${err.message})`),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onPhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await downscaleImage(file);
      updateIntake({ photo: dataUrl });
    } catch (err) {
      toast('Photo failed: ' + err.message);
    } finally {
      e.target.value = '';
    }
  }

  function start() {
    if (!intake.name.trim()) { toast('Enter candidate name'); return; }
    if (!intake.phone.trim()) { toast('Enter phone number'); return; }
    update({
      lang,
      role,
      hub,
      candidate: { name: intake.name.trim(), phone: intake.phone.trim() },
    });
    navigate('/screening');
  }

  const selectedRole = ROLES.find((r) => r.id === role);

  return (
    <div className="screen-enter bg-white rounded-card-lg p-7 shadow-jt-sm border border-[var(--border)]">
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
        📍 Field intake · Recruited by {recruiterId || 'Field Recruiter'}
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Sign up a walk-up candidate</h2>
      <p className="text-[var(--text-muted)] text-sm mt-1">
        Pick role + hub, fill 2 fields, hand the phone to the candidate for 5 voice questions. ~3 minutes total.
      </p>

      {/* HUB */}
      <div className="mt-5">
        <label className="block font-semibold text-sm mb-1.5">Hub *</label>
        <div className="flex gap-2 flex-wrap">
          {HUBS.filter((h) => h.id !== 'patancheru').map((h) => (
            <button
              key={h.id}
              onClick={() => setHub(h.id)}
              className={[
                'px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all',
                hub === h.id
                  ? 'border-jt-orange bg-jt-orange-light text-jt-blue'
                  : 'border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-jt-orange',
              ].join(' ')}
            >
              📍 {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* ROLE */}
      <div className="mt-4">
        <label className="block font-semibold text-sm mb-1.5">Role *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={[
                'rounded-xl border-2 p-3 text-left transition-all',
                role === r.id
                  ? 'border-jt-orange bg-jt-orange-light'
                  : 'border-[var(--border)] bg-white hover:border-jt-orange',
              ].join(' ')}
            >
              <div className="text-2xl">{r.emoji}</div>
              <div className="font-bold text-sm mt-0.5">{r.name}</div>
              <div className="text-[11px] text-[var(--text-muted)] leading-snug mt-0.5">{r.blurb}</div>
            </button>
          ))}
        </div>
        {selectedRole && (
          <div className="mt-2 text-[12px] text-[var(--text-muted)]">
            Will ask 5 questions on:&nbsp;
            <strong className="text-jt-blue">{selectedRole.dimensions.join(' · ')}</strong>
          </div>
        )}
      </div>

      {/* NAME + PHONE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <div>
          <label className="block font-semibold text-sm mb-1.5">Candidate name *</label>
          <input
            autoFocus
            className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-base focus:outline-none focus:border-jt-orange"
            placeholder="e.g. Rajesh Kumar"
            value={intake.name}
            onChange={(e) => updateIntake({ name: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-semibold text-sm mb-1.5">Phone number *</label>
          <input
            type="tel"
            inputMode="tel"
            className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-base focus:outline-none focus:border-jt-orange"
            placeholder="+91 98765 43210"
            value={intake.phone}
            onChange={(e) => updateIntake({ phone: e.target.value })}
          />
        </div>
      </div>

      {/* LANGUAGE */}
      <div className="mt-4">
        <label className="block font-semibold text-sm mb-1.5">Screening language</label>
        <div className="flex gap-2 flex-wrap">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={[
                'px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all',
                lang === l.code
                  ? 'border-jt-orange bg-jt-orange-light text-jt-blue'
                  : 'border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-jt-orange',
              ].join(' ')}
            >
              {l.flag} {l.name} <span className="opacity-70 text-xs">· {l.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PHOTO + GPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block font-semibold text-sm mb-1.5">Candidate photo (optional)</label>
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden bg-[var(--bg)] shrink-0">
              {intake.photo ? (
                <img src={intake.photo} alt="candidate" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhotoChange} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light text-sm"
              >
                {intake.photo ? '🔄 Retake' : '📷 Take photo'}
              </button>
              {intake.photo && (
                <button
                  onClick={() => updateIntake({ photo: null })}
                  className="ml-2 px-3 py-2.5 rounded-xl bg-transparent text-accent-red border border-[var(--border)] font-semibold text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-sm mb-1.5">Recruitment location</label>
          <div className="px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--bg)] text-[var(--text-muted)] min-h-[50px] flex items-center">
            {gpsStatus}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Auto-captured. Helps you see which chowks produce the best candidates.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-7 flex-wrap gap-2">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-3 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
        >
          ← Back
        </button>
        <button
          onClick={start}
          className="px-6 py-4 rounded-xl bg-jt-orange text-white font-semibold text-base shadow-[0_4px_12px_rgba(242,101,34,.3)] hover:bg-jt-orange-dark"
        >
          Start voice screening →
        </button>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useFlow } from '../lib/flowStore.jsx';

const LANGS = [
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी', sub: 'Hindi' },
  { code: 'en', flag: '🇬🇧', name: 'English', sub: 'English' },
  { code: 'te', flag: '🇮🇳', name: 'తెలుగు', sub: 'Telugu' },
];

export default function Language() {
  const navigate = useNavigate();
  const { state, update } = useFlow();

  const pick = (code) => {
    update({ lang: code });
    setTimeout(() => navigate('/screening'), 350);
  };

  return (
    <div className="screen-enter bg-white rounded-card-lg p-7 shadow-jt-sm border border-[var(--border)]">
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        Worker · Step 1 of 5
      </div>
      <h2 className="text-2xl font-bold mb-1.5 tracking-tight">
        अपनी भाषा चुनें · Select your language · మీ భాషను ఎంచుకోండి
      </h2>
      <p className="text-[var(--text-muted)] text-sm mb-5">
        Tap once. The whole conversation will be in this language.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
        {LANGS.map((l) => {
          const selected = state.lang === l.code;
          return (
            <button
              key={l.code}
              onClick={() => pick(l.code)}
              className={[
                'rounded-card-lg border-[3px] px-5 py-7 text-center transition-all',
                'hover:-translate-y-1 hover:shadow-jt-md hover:border-jt-orange',
                selected
                  ? 'border-jt-orange bg-jt-orange-light'
                  : 'border-[var(--border)] bg-white',
              ].join(' ')}
            >
              <div className="text-5xl mb-3">{l.flag}</div>
              <div className="text-2xl font-extrabold text-jt-blue">{l.name}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{l.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

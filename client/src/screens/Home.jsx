import { Link, useNavigate } from 'react-router-dom';
import { useFlow } from '../lib/flowStore.jsx';

const roleCards = [
  {
    to: '/language',
    icon: '👷',
    title: "I'm looking for work · Voice apply",
    desc: 'Speak in your language. ATLAS asks 5 questions and books your interview slot in 4 minutes.',
    iconBg: 'bg-jt-orange-light',
  },
  {
    to: '/jd',
    icon: '🏢',
    title: "I'm a recruiter",
    desc: 'Post a role, get pre-screened candidates ranked by score, schedule interviews, send offers.',
    iconBg: 'bg-jt-blue-light',
  },
  {
    to: '/whatsapp',
    icon: '📱',
    title: 'Apply via WhatsApp',
    desc: 'Get a WhatsApp message from ATLAS Bot. Whole interview happens in chat — works on any ₹3,000 phone.',
    iconBg: 'bg-[#DCFCE7]',
    badge: 'No app needed',
  },
  {
    to: '/referral',
    icon: '🤝',
    title: 'Refer a worker · Earn ₹500',
    desc: 'Got someone who needs a job? Share their number. We pay ₹500 per joined hire — paid on Day 30.',
    iconBg: 'bg-[#FEF3C7]',
    badge: 'Kirana network',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { state } = useFlow();
  const { recruiterMode, recruiterId } = state;

  return (
    <div className="screen-enter">
      {/* Field-mode banner — shown only when recruiter mode is on */}
      {recruiterMode && (
        <div
          className="rounded-card-lg p-5 sm:p-6 mb-5 flex items-center justify-between gap-4 flex-wrap text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-green), #138043)' }}
        >
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold opacity-85">📍 Field recruitment mode</div>
            <div className="text-xl sm:text-2xl font-extrabold mt-0.5">
              Recruiting as {recruiterId || 'Field Recruiter'}
            </div>
            <p className="text-sm opacity-90 mt-1">
              Sign up walk-up candidates at chowks, kirana hubs, bus stands. Each candidate is tagged with your name, GPS, and photo.
            </p>
          </div>
          <button
            onClick={() => navigate('/intake')}
            className="px-6 py-4 rounded-xl bg-white text-accent-green font-extrabold text-base shadow-lg hover:opacity-90"
          >
            + Sign up walk-up candidate →
          </button>
        </div>
      )}

      <section
        className="rounded-card-lg p-12 sm:p-14 text-white relative overflow-hidden mb-7"
        style={{ background: 'linear-gradient(135deg, var(--jt-blue) 0%, var(--jt-blue-dark) 100%)' }}
      >
        <span className="inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-white/15">
          Project ATLAS · v0.2 prototype
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mt-3.5 max-w-[700px]">
          Hire <span className="text-jt-orange">van delivery boys, pickers, packers & loaders</span> 10x faster — in their own language.
        </h1>
        <p className="mt-4 text-base sm:text-lg opacity-90 max-w-[620px]">
          Voice-first AI recruiting for Jumbotail's Hyderabad hubs — <strong>Bala Nagar · Attapur · Kompally</strong>. Hindi, English & Telugu. Field-recruiter mode on every phone.
        </p>
        <div className="mt-8 flex gap-9 flex-wrap">
          <Stat num="68%" label="India workforce that is blue-collar" />
          <Stat num="₹4,200" label="Cost-per-hire today" />
          <Stat num="₹450" label="Cost-per-hire with ATLAS" />
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {roleCards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-white border-2 border-[var(--border)] rounded-card-lg p-8 transition-all hover:border-jt-orange hover:-translate-y-1 hover:shadow-jt-lg relative block"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${c.iconBg}`}>{c.icon}</div>
            <h3 className="text-xl font-bold mb-2">
              {c.title}
              {c.badge && (
                <span className="ml-2 inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-jt-orange-light text-jt-orange-dark">
                  {c.badge}
                </span>
              )}
            </h3>
            <p className="text-[var(--text-muted)] text-sm">{c.desc}</p>
            <div className="absolute top-8 right-8 text-[var(--text-muted)] text-2xl">→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ num, label }) {
  return (
    <div>
      <div className="text-3xl font-extrabold text-jt-orange">{num}</div>
      <div className="text-xs uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

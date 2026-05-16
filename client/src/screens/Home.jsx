import { Link } from 'react-router-dom';

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
  return (
    <div className="screen-enter">
      <section className="rounded-card-lg p-12 sm:p-14 text-white relative overflow-hidden mb-7"
               style={{ background: 'linear-gradient(135deg, var(--jt-blue) 0%, var(--jt-blue-dark) 100%)' }}>
        <span className="inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-white/15">
          Project ATLAS · v0.2 prototype
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mt-3.5 max-w-[700px]">
          Hire warehouse workers <span className="text-jt-orange">10x faster</span>, in their own language.
        </h1>
        <p className="mt-4 text-base sm:text-lg opacity-90 max-w-[620px]">
          ATLAS is a voice-first AI agent that sources, screens and schedules blue-collar talent — in Hindi, English & Telugu.
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
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${c.iconBg}`}>
              {c.icon}
            </div>
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

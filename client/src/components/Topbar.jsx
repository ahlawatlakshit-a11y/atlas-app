import { NavLink, Link } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/jd', label: 'Recruiter' },
  { to: '/language', label: 'Voice Apply' },
  { to: '/whatsapp', label: 'WhatsApp' },
  { to: '/referral', label: 'Referral' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Topbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--border)] shadow-jt-sm">
      <div className="max-w-[1280px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4 flex-wrap">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-white font-extrabold text-xl bg-gradient-to-br from-jt-orange to-jt-orange-dark shadow-[0_4px_12px_rgba(242,101,34,.35)]">
            A
          </div>
          <div>
            <div className="font-extrabold text-[22px] tracking-tight text-jt-blue leading-none">ATLAS</div>
            <div className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
              AI Hiring for Bharat's Workforce · powered by Jumbotail
            </div>
          </div>
        </Link>
        <nav className="flex gap-1.5 flex-wrap">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full border text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-jt-blue text-white border-jt-blue'
                    : 'bg-white text-[var(--text-muted)] border-[var(--border)] hover:bg-jt-blue-light hover:text-jt-blue'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

import { NavLink, Link } from 'react-router-dom';
import { useFlow } from '../lib/flowStore.jsx';

const BASE_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/jd', label: 'Recruiter' },
  { to: '/language', label: 'Voice Apply' },
  { to: '/whatsapp', label: 'WhatsApp' },
  { to: '/referral', label: 'Referral' },
  { to: '/dashboard', label: 'Pipeline' },
];

export default function Topbar() {
  const { state, setRecruiterMode, loginAsManager, logoutManager, toast } = useFlow();
  const { recruiterMode, recruiterId, managerMode } = state;

  // Manager-only nav items append when logged in
  const navItems = [
    ...BASE_NAV,
    ...(managerMode ? [{ to: '/manager', label: '👔 Manager' }] : []),
  ];

  function toggleFieldMode() {
    if (recruiterMode) {
      setRecruiterMode(false);
      toast('Field mode off');
    } else {
      let id = recruiterId;
      if (!id) {
        id = (typeof window !== 'undefined' && window.prompt('Recruiter name?', 'Priya M')) || 'Field Recruiter';
      }
      setRecruiterMode(true, id);
      toast(`📍 Field mode on · ${id}`);
    }
  }

  function toggleManagerLogin() {
    if (managerMode) {
      logoutManager();
      toast('👔 Logged out of Manager view');
      return;
    }
    const pin = typeof window !== 'undefined' ? window.prompt('Manager PIN (4 digits):') : null;
    if (pin == null) return; // cancelled
    if (loginAsManager(pin)) {
      toast('👔 Manager view unlocked');
    } else {
      toast('❌ Wrong PIN — access denied');
    }
  }

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

        <div className="flex items-center gap-3 flex-wrap">
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

          {/* Field mode pill */}
          <button
            onClick={toggleFieldMode}
            title={recruiterMode ? 'Click to turn off field mode' : 'Click to start field-recruitment mode'}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border transition-colors',
              recruiterMode
                ? 'bg-accent-green-light text-accent-green border-transparent'
                : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-jt-orange',
            ].join(' ')}
          >
            <span>{recruiterMode ? '📍' : '○'}</span>
            <span>
              FIELD {recruiterMode ? 'ON' : 'OFF'}
              {recruiterMode && recruiterId && <span className="ml-1 font-semibold opacity-80">· {recruiterId}</span>}
            </span>
          </button>

          {/* Manager login pill */}
          <button
            onClick={toggleManagerLogin}
            title={managerMode ? 'Click to log out of Manager view' : 'Enter PIN to access Manager analytics'}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border transition-colors',
              managerMode
                ? 'text-white border-transparent'
                : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-jt-blue',
            ].join(' ')}
            style={managerMode ? { background: 'linear-gradient(135deg, var(--jt-blue), var(--jt-blue-dark))' } : undefined}
          >
            <span>{managerMode ? '👔' : '🔒'}</span>
            <span>{managerMode ? 'MANAGER · LOGOUT' : 'MANAGER LOGIN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { kiranaPartners } from '../lib/staticData.js';
import { useFlow } from '../lib/flowStore.jsx';

const STATUS_PILL = {
  Joined: 'bg-accent-green-light text-accent-green',
  Interview: 'bg-[#FEF3C7] text-[#B45309]',
  Screening: 'bg-jt-blue-light text-jt-blue',
  Sent: 'bg-jt-blue-light text-jt-blue',
};

export default function Referral() {
  const navigate = useNavigate();
  const { toast } = useFlow();
  const [referrals, setReferrals] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lang, setLang] = useState('hi');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const data = await api.get('/referrals');
      setReferrals(data);
    } catch (err) {
      toast('Could not load referrals: ' + err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function send() {
    if (!name.trim() || !phone.trim()) {
      toast('Enter name and phone');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/referrals', { friend_name: name.trim(), friend_phone: phone.trim(), lang });
      setName('');
      setPhone('');
      await load();
      toast(`📲 WhatsApp invite sent to ${name.trim()}`);
    } catch (err) {
      toast('Failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Earnings derived from list
  const joinedCount = referrals.filter((r) => r.status === 'Joined').length;
  const earnings = referrals.reduce((sum, r) => sum + (r.payout || 0), 0);
  const inProcess = referrals.filter((r) => r.status !== 'Joined' && r.status !== 'Sent').length;
  const pending = inProcess * 500;

  return (
    <div className="screen-enter">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">🤝 Referral Network</div>
          <h2 className="text-2xl font-bold tracking-tight">Refer a worker. Earn ₹500. Day 30 payout.</h2>
          <p className="text-[var(--text-muted)] text-sm">Workers refer workers. Kirana owners refer their neighbours. The cheapest sourcing channel that exists.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2.5 rounded-xl bg-jt-blue text-white font-semibold hover:bg-jt-blue-dark"
        >
          ← Home
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div
          className="rounded-card-lg p-6 text-white"
          style={{ background: 'linear-gradient(135deg, var(--jt-orange), var(--jt-orange-dark))' }}
        >
          <div className="text-[13px] uppercase tracking-wider opacity-90 font-semibold">YOUR EARNINGS</div>
          <div className="text-4xl font-extrabold leading-none mt-1">₹{earnings.toLocaleString('en-IN')}</div>
          <div className="text-[13px] opacity-90 mt-1.5">
            {joinedCount} friends joined · {inProcess} still in process · ₹{pending.toLocaleString('en-IN')} pending
          </div>
        </div>
        <div
          className="rounded-card-lg p-6 text-white"
          style={{ background: 'linear-gradient(135deg, var(--jt-blue), var(--jt-blue-dark))' }}
        >
          <div className="text-[12px] uppercase tracking-wider opacity-85 font-semibold">NETWORK SCALE</div>
          <div className="text-4xl font-extrabold leading-none mt-1">73 nodes</div>
          <div className="text-[13px] opacity-90 mt-1.5">Hyderabad: 47 kirana stores · 26 worker referrers · ↑ 11 this week</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Refer-a-friend */}
        <div className="bg-white rounded-card-lg p-7 border border-[var(--border)] shadow-jt-sm">
          <h3 className="text-xl font-bold tracking-tight">Refer a friend</h3>
          <p className="text-[var(--text-muted)] text-sm mt-1 mb-4">
            Share their phone number. ATLAS sends them a WhatsApp message in their language.
          </p>

          <div className="mb-4">
            <label className="block font-semibold text-sm mb-1.5">Friend's name</label>
            <input
              className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] focus:outline-none focus:border-jt-orange"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold text-sm mb-1.5">Phone number</label>
              <input
                className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] focus:outline-none focus:border-jt-orange"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1.5">Preferred language</label>
              <select
                className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] bg-white focus:outline-none focus:border-jt-orange"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="hi">हिन्दी</option>
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
              </select>
            </div>
          </div>

          <button
            onClick={send}
            disabled={submitting}
            className="w-full px-5 py-3 rounded-xl bg-jt-orange text-white font-semibold shadow-[0_4px_12px_rgba(242,101,34,.3)] hover:bg-jt-orange-dark disabled:opacity-50"
          >
            {submitting ? 'Sending…' : '📲 Send WhatsApp invite'}
          </button>

          <h3 className="text-sm font-bold text-jt-blue mt-6 mb-2">My referrals</h3>
          <div>
            {referrals.length === 0 && (
              <div className="text-[var(--text-muted)] text-sm py-3">No referrals yet — send your first one above.</div>
            )}
            {referrals.map((r) => {
              const initials = (r.friend_name || '')
                .split(' ')
                .map((s) => s[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('');
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-[10px] mb-2" style={{ background: 'var(--bg)' }}>
                  <div className="w-10 h-10 rounded-full bg-jt-blue-light text-jt-blue flex items-center justify-center font-bold text-sm">
                    {initials || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{r.friend_name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{r.friend_phone}</div>
                  </div>
                  <span className={'px-2.5 py-1 rounded-full text-[11px] font-bold ' + (STATUS_PILL[r.status] || 'bg-[var(--border)] text-[var(--text-muted)]')}>
                    {r.status}
                  </span>
                  <strong className="text-accent-green ml-2 min-w-[50px] text-right">
                    {r.payout ? '₹' + r.payout : '—'}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kirana network */}
        <div className="bg-white rounded-card-lg p-7 border border-[var(--border)] shadow-jt-sm">
          <h3 className="text-xl font-bold tracking-tight">Kirana partner network</h3>
          <p className="text-[var(--text-muted)] text-sm mt-1 mb-4">
            Each shop is a sourcing node. They earn ₹500/joined hire — paid into their Jumbotail B2B account.
          </p>
          <div>
            {kiranaPartners.map((s) => (
              <div key={s.name} className="flex items-center gap-3 p-3 mb-2 bg-white border border-[var(--border)] rounded-[10px]">
                <div className="w-11 h-11 rounded-[10px] bg-jt-orange-light text-jt-orange-dark flex items-center justify-center text-xl">
                  🏪
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{s.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{s.area} · joined ATLAS network</div>
                </div>
                <div className="bg-accent-green-light text-accent-green px-2.5 py-1 rounded-full text-xs font-bold">
                  {s.refers} hires
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => toast('+1 partner invited')}
            className="w-full mt-3 px-4 py-2.5 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
          >
            + Invite a kirana partner
          </button>
        </div>
      </div>
    </div>
  );
}

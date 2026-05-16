import { useNavigate } from 'react-router-dom';
import { useFlow } from '../lib/flowStore.jsx';
import { api } from '../lib/api.js';

export default function Offer() {
  const navigate = useNavigate();
  const { state, update, toast } = useFlow();
  const c = state.selectedCandidate;

  // Fallback when navigated directly without a candidate selected
  if (!c) {
    return (
      <div className="screen-enter bg-white rounded-card-lg p-7 shadow-jt-sm border border-[var(--border)]">
        <p className="text-[var(--text-muted)]">No candidate selected.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-3 px-5 py-3 rounded-xl bg-jt-orange text-white font-semibold"
        >
          ← Pick from Dashboard
        </button>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const refId = 'JT-OFR-' + (10000 + (c.id % 89999));
  const role = 'Warehouse Loader';
  const location = 'Patancheru, Hyderabad';
  const salary = '₹18,000/month + PF + meals';

  async function sendOffer() {
    try {
      await api.patch(`/candidates/${c.id}`, { status: 'Offer sent' });
      update({ selectedCandidate: { ...c, status: 'Offer sent' } });
      toast('📲 Offer sent on WhatsApp');
      setTimeout(() => navigate('/whatsapp'), 1100);
    } catch (err) {
      toast('Send failed: ' + err.message);
    }
  }

  return (
    <div className="screen-enter">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3 print:hidden">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Recruiter</div>
          <h2 className="text-2xl font-bold tracking-tight">Generate offer letter</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
          >
            ← Back to dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-jt-blue text-white font-semibold hover:bg-jt-blue-dark"
          >
            🖨 Print / Save PDF
          </button>
          <button
            onClick={sendOffer}
            className="px-4 py-2.5 rounded-xl bg-jt-orange text-white font-semibold hover:bg-jt-orange-dark"
          >
            📲 Send via WhatsApp
          </button>
        </div>
      </div>

      <div
        className="relative bg-white rounded-lg shadow-jt-lg max-w-[720px] mx-auto p-12 sm:p-16 leading-relaxed text-[#222]"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {/* Top gradient bar */}
        <div
          className="absolute left-0 right-0 top-0 h-1.5 rounded-t-lg"
          style={{ background: 'linear-gradient(90deg, var(--jt-orange), var(--jt-blue))' }}
        />

        <div className="flex justify-between items-start border-b-2 border-jt-orange pb-4 mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-jt-blue tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              JUMBOTAIL
            </h2>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">India's largest B2B kirana platform</div>
          </div>
          <div className="text-right text-[13px] text-[var(--text-muted)]">
            <div><strong>Date:</strong> {today}</div>
            <div><strong>Ref:</strong> {refId}</div>
          </div>
        </div>

        <h3 className="text-jt-blue font-bold text-[22px] mt-6 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
          Letter of Appointment
        </h3>
        <p className="mb-3.5 text-[15px]">
          Dear <strong>{c.name}</strong>,
        </p>
        <p className="mb-3.5 text-[15px]">
          Following your interview on <strong>{c.slot || 'your scheduled date'}</strong> at our {location} facility, we are
          delighted to offer you the position of <strong>{role}</strong> at Jumbotail Technologies Pvt Ltd.
        </p>

        <h3 className="text-jt-blue font-bold text-[22px] mt-6 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
          Compensation & Terms
        </h3>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-[15px]">
          <li><strong>Monthly salary:</strong> {salary}</li>
          <li><strong>Shift:</strong> Night shift, 8:00 PM – 4:00 AM, 6 days a week (weekly off rotational)</li>
          <li><strong>Reporting location:</strong> Jumbotail Warehouse, {location}</li>
          <li><strong>Joining date:</strong> Within 7 days of acceptance</li>
          <li><strong>Probation:</strong> 60 days, with confirmation review</li>
          <li><strong>Benefits:</strong> ESI + PF, free chai-breakfast, weekly off, performance bonus up to ₹2,500/month</li>
        </ul>

        <h3 className="text-jt-blue font-bold text-[22px] mt-6 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
          Next steps
        </h3>
        <p className="mb-3 text-[15px]">Please carry the following on your first day:</p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-[15px]">
          <li>Aadhaar card (original + photocopy)</li>
          <li>Bank passbook copy for salary credit</li>
          <li>2 passport-size photographs</li>
        </ul>

        <p className="mb-3.5 text-[15px]">
          To accept this offer, simply reply <strong>"YES"</strong> on WhatsApp to <strong>+91-80-6900-1234</strong> or click
          the link in the WhatsApp message we have just sent. Our HR team is reachable Mon–Sat, 9 AM – 7 PM.
        </p>
        <p className="mb-3.5 text-[15px]">Welcome to the Jumbotail family. We look forward to working with you.</p>

        <p className="mt-8 text-[15px]">
          Warm regards,<br />
          <strong>Priya Menon</strong><br />
          <span className="text-[13px] text-[var(--text-muted)]">Head of Workforce, Jumbotail Hyderabad</span>
        </p>

        <div className="mt-8 pt-4 border-t border-[var(--border)] text-[13px] text-[var(--text-muted)] flex justify-between flex-wrap gap-2">
          <span>Signed digitally · ATLAS · {refId}</span>
          <span>Jumbotail Technologies Pvt Ltd</span>
        </div>
      </div>
    </div>
  );
}

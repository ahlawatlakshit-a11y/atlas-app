import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { channels as CHANNEL_DEFS } from '../lib/staticData.js';
import { useFlow } from '../lib/flowStore.jsx';

const SAMPLE_BRIEF = 'Need 12 warehouse loaders for night shift at Jumbotail Hyderabad warehouse. Must lift 25kg. ₹18,000/month + PF + meals.';

export default function JDGenerator() {
  const navigate = useNavigate();
  const { toast } = useFlow();
  const [brief, setBrief] = useState(SAMPLE_BRIEF);
  const [jd, setJd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState(CHANNEL_DEFS.map((c) => ({ ...c, on: true })));
  const [publishing, setPublishing] = useState(false);

  async function generate() {
    if (!brief.trim()) {
      toast('Please enter a brief');
      return;
    }
    setLoading(true);
    try {
      const result = await api.post('/jd/generate', { brief: brief.trim() });
      setJd(result);
      toast('JD generated in 1.2 seconds');
    } catch (err) {
      toast('Generate failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function useDefault() {
    setBrief(SAMPLE_BRIEF);
    // immediate generate after sample fill — match prototype
    setTimeout(generate, 50);
  }

  function toggleChannel(key) {
    setChannels((prev) => prev.map((c) => (c.key === key ? { ...c, on: !c.on } : c)));
  }

  async function publish() {
    if (!jd) return;
    setPublishing(true);
    try {
      await api.post('/jd/publish', jd);
      const activeNames = channels.filter((c) => c.on).map((c) => c.name).join(' · ');
      toast(`🚀 Published to ${channels.filter((c) => c.on).length} channels: ${activeNames}`);
      setTimeout(() => navigate('/language'), 1400);
    } catch (err) {
      toast('Publish failed: ' + err.message);
      setPublishing(false);
    }
  }

  const activeCount = channels.filter((c) => c.on).length;

  return (
    <div className="screen-enter bg-white rounded-card-lg p-7 shadow-jt-sm border border-[var(--border)]">
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        Step 1 of 4 · Recruiter
      </div>
      <h2 className="text-2xl font-bold mb-1.5 tracking-tight">Generate a job description</h2>
      <p className="text-[var(--text-muted)] text-sm mb-5">
        Type a one-line brief. ATLAS writes a worker-friendly JD in 3 languages.
      </p>

      <div className="mb-4">
        <label className="block font-semibold text-sm mb-1.5">Quick brief</label>
        <input
          className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-base focus:outline-none focus:border-jt-orange"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="e.g. Need 12 loaders for night shift, Hyderabad warehouse, must lift 25kg"
        />
      </div>

      <div className="flex gap-2.5 flex-wrap">
        <button
          onClick={generate}
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-jt-orange text-white font-semibold shadow-[0_4px_12px_rgba(242,101,34,.3)] hover:bg-jt-orange-dark disabled:opacity-50"
        >
          {loading ? 'Generating…' : '✨ Generate JD with AI'}
        </button>
        <button
          onClick={useDefault}
          className="px-5 py-3 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
        >
          Use sample
        </button>
      </div>

      {jd && (
        <div className="mt-7 screen-enter">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
            AI-generated JD
            <span className="px-2 py-0.5 rounded text-[11px] bg-jt-orange-light text-jt-orange-dark">live</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <Field label="Job title" value={jd.title} onChange={(v) => setJd({ ...jd, title: v })} />
            <Field label="Location" value={jd.location} onChange={(v) => setJd({ ...jd, location: v })} />
            <Field label="Monthly salary" value={jd.salary} onChange={(v) => setJd({ ...jd, salary: v })} />
            <Field
              label="Openings"
              type="number"
              value={jd.openings}
              onChange={(v) => setJd({ ...jd, openings: parseInt(v, 10) || 0 })}
            />
          </div>

          <TextareaField
            label="Worker-friendly description"
            value={jd.description}
            rows={5}
            onChange={(v) => setJd({ ...jd, description: v })}
          />
          <TextareaField
            label="Must-have requirements"
            value={(jd.requirements || []).join('\n')}
            rows={4}
            onChange={(v) => setJd({ ...jd, requirements: v.split('\n').filter(Boolean) })}
          />

          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mt-7 mb-1.5 flex items-center gap-2 flex-wrap">
            Distribution channels
            <span className="px-2 py-0.5 rounded text-[11px] bg-accent-green-light text-accent-green normal-case tracking-normal">
              {activeCount} active · ~95K reach
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-[13px] mb-3.5">
            ATLAS syndicates this JD to every blue-collar funnel automatically. Toggle off any you don't want.
          </p>

          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {channels.map((c) => (
              <button
                key={c.key}
                onClick={() => toggleChannel(c.key)}
                className={[
                  'relative text-left rounded-xl p-3.5 border-2 transition-all hover:-translate-y-0.5 hover:shadow-jt-md hover:border-jt-orange',
                  c.on ? 'border-accent-green bg-accent-green-light' : 'border-[var(--border)] bg-white',
                ].join(' ')}
              >
                <div
                  className={[
                    'absolute top-3 right-3 w-9 h-5 rounded-full transition-colors relative',
                    c.on ? 'bg-accent-green' : 'bg-[var(--border)]',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all',
                      c.on ? 'left-[18px]' : 'left-0.5',
                    ].join(' ')}
                  />
                </div>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white font-extrabold text-sm"
                    style={{ background: c.color }}
                  >
                    {c.logo}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{c.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{c.reach}</div>
                  </div>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-2 leading-snug">{c.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-3 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
            >
              ← Back
            </button>
            <button
              onClick={publish}
              disabled={publishing}
              className="px-6 py-4 rounded-xl bg-jt-orange text-white font-semibold text-base shadow-[0_4px_12px_rgba(242,101,34,.3)] hover:bg-jt-orange-dark disabled:opacity-50"
            >
              {publishing ? 'Publishing…' : 'Publish to all channels →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block font-semibold text-sm mb-1.5">{label}</label>
      <input
        type={type}
        className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-base focus:outline-none focus:border-jt-orange"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, rows = 4 }) {
  return (
    <div className="mt-4">
      <label className="block font-semibold text-sm mb-1.5">{label}</label>
      <textarea
        rows={rows}
        className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-base resize-y focus:outline-none focus:border-jt-orange font-sans"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

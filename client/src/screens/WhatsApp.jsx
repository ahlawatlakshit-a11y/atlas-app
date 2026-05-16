import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { waScript, whatsappGroups, flowSteps } from '../lib/staticData.js';
import { useFlow } from '../lib/flowStore.jsx';

function waTime() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

export default function WhatsAppScreen() {
  const navigate = useNavigate();
  const { toast } = useFlow();
  const [bubbles, setBubbles] = useState([]); // { type:'bot'|'me'|'voice'|'quick'|'typing', text?, time?, voice?, quick? }
  const [activeStep, setActiveStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState(new Set());
  const [autoPlay, setAutoPlay] = useState(false);
  const idxRef = useRef(0);
  const timerRef = useRef(null);
  const bodyRef = useRef(null);
  const [groups, setGroups] = useState(whatsappGroups);

  function reset() {
    if (timerRef.current) clearTimeout(timerRef.current);
    idxRef.current = 0;
    setBubbles([]);
    setActiveStep(0);
    setDoneSteps(new Set());
    setAutoPlay(false);
  }

  // Kick off chat on mount
  useEffect(() => {
    reset();
    timerRef.current = setTimeout(() => playNext(), 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll on new bubble
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [bubbles]);

  function appendBubble(b) {
    setBubbles((prev) => [...prev.filter((x) => x.type !== 'typing'), b]);
  }

  function showTyping() {
    setBubbles((prev) => [...prev.filter((x) => x.type !== 'typing'), { type: 'typing' }]);
  }

  function clearQuickBubbles() {
    setBubbles((prev) => prev.filter((x) => x.type !== 'quick'));
  }

  function playNext() {
    const i = idxRef.current;
    if (i >= waScript.length) return;
    const msg = waScript[i];

    // Update flow tracker if step is set
    if (msg.step !== undefined) {
      setActiveStep(msg.step);
      setDoneSteps((prev) => {
        const next = new Set(prev);
        for (let s = 0; s < msg.step; s++) next.add(s);
        return next;
      });
    }

    if (msg.from === 'bot') {
      showTyping();
      timerRef.current = setTimeout(() => {
        appendBubble({ type: 'bot', text: msg.text, time: waTime() });
        if (msg.quick) appendBubble({ type: 'quick', options: msg.quick });
        idxRef.current++;
        if (autoPlayRef.current && idxRef.current < waScript.length) {
          timerRef.current = setTimeout(playNext, 1100);
        }
      }, msg.delay || 700);
    } else {
      timerRef.current = setTimeout(() => {
        clearQuickBubbles();
        if (msg.voice) appendBubble({ type: 'voice', voice: msg.voice, time: waTime() });
        else appendBubble({ type: 'me', text: msg.text, time: waTime() });
        idxRef.current++;
        if (autoPlayRef.current && idxRef.current < waScript.length) {
          timerRef.current = setTimeout(playNext, 700);
        } else if (!autoPlayRef.current && idxRef.current < waScript.length && waScript[idxRef.current].from === 'bot') {
          timerRef.current = setTimeout(playNext, 400);
        }
      }, msg.delay || 500);
    }
  }

  // Mirror autoPlay state into a ref so the closure captured by setTimeout sees latest value
  const autoPlayRef = useRef(autoPlay);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);

  function startAutoPlay() {
    const fromStart = idxRef.current === 0 || idxRef.current >= waScript.length;
    if (fromStart) reset();
    autoPlayRef.current = true;
    setAutoPlay(true);
    timerRef.current = setTimeout(playNext, fromStart ? 300 : 0);
    toast('▶ Auto-play started');
  }

  function userPick(val) {
    clearQuickBubbles();
    appendBubble({ type: 'me', text: val, time: waTime() });
    if (waScript[idxRef.current] && waScript[idxRef.current].from === 'me') idxRef.current++;
    if (val === 'Refer a friend') {
      timerRef.current = setTimeout(() => navigate('/referral'), 800);
      return;
    }
    timerRef.current = setTimeout(playNext, 600);
  }

  function postToGroups() {
    setGroups((prev) => prev.map((g) => ({ ...g, views: g.views + Math.floor(50 + Math.random() * 150) })));
    toast('📣 Posted to 47 groups · ~12,000 members reached');
  }

  return (
    <div className="screen-enter">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">📲 WhatsApp Apply Flow</div>
          <h2 className="text-2xl font-bold tracking-tight">The whole interview, inside WhatsApp.</h2>
          <p className="text-[var(--text-muted)] text-sm">No app. No download. Works on any ₹3,000 phone in a basti.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { reset(); timerRef.current = setTimeout(() => playNext(), 400); }}
            className="px-4 py-2.5 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light"
          >
            ↺ Restart chat
          </button>
          <button
            onClick={startAutoPlay}
            className="px-4 py-2.5 rounded-xl bg-jt-blue text-white font-semibold hover:bg-jt-blue-dark"
          >
            ▶ Auto-play demo
          </button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* PHONE */}
        <div className="flex justify-center">
          <div
            className="relative w-[380px] max-w-full rounded-[36px] p-[14px] pt-[14px] pb-[18px] shadow-[0_30px_60px_rgba(0,0,0,.25)]"
            style={{ background: '#0B141A' }}
          >
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[18px] rounded-xl"
              style={{ background: '#000' }}
            />
            <div className="rounded-[22px] overflow-hidden flex flex-col mt-[18px]" style={{ background: '#0B141A', height: '640px' }}>
              <div
                className="flex items-center gap-2.5 px-3.5 py-3 text-white border-b"
                style={{ background: '#1F2C33', borderColor: '#2A3942' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold"
                  style={{ background: 'linear-gradient(135deg, var(--jt-orange), var(--jt-orange-dark))' }}
                >
                  A
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">ATLAS · Jumbotail Hiring</div>
                  <div className="text-[11px]" style={{ color: '#00D26A' }}>● online · typing in हिन्दी / తెలుగు</div>
                </div>
              </div>

              <div ref={bodyRef} className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1" style={{ background: '#0B141A' }}>
                {bubbles.map((b, idx) => {
                  if (b.type === 'typing') {
                    return (
                      <div key={idx} className="text-[12px] italic px-3 py-1.5" style={{ color: '#8696A0' }}>
                        ATLAS Bot is typing...
                      </div>
                    );
                  }
                  if (b.type === 'bot') {
                    return (
                      <div
                        key={idx}
                        className="self-start max-w-[78%] px-2.5 py-2 text-sm leading-snug rounded-lg rounded-tl-none break-words"
                        style={{ background: '#1F2C33', color: '#E9EDEF', animation: 'bubbleIn .25s ease' }}
                        dangerouslySetInnerHTML={{ __html: b.text + `<span style="display:block;font-size:10px;color:#8696A0;text-align:right;margin-top:2px;">${b.time}</span>` }}
                      />
                    );
                  }
                  if (b.type === 'me') {
                    return (
                      <div
                        key={idx}
                        className="self-end max-w-[78%] px-2.5 py-2 text-sm leading-snug rounded-lg rounded-tr-none break-words"
                        style={{ background: '#005C4B', color: '#E9EDEF' }}
                      >
                        <span dangerouslySetInnerHTML={{ __html: b.text }} />
                        <span className="block text-[10px] text-right mt-0.5" style={{ color: '#8696A0' }}>{b.time} ✓✓</span>
                      </div>
                    );
                  }
                  if (b.type === 'voice') {
                    return (
                      <div
                        key={idx}
                        className="self-end inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm"
                        style={{ background: '#005C4B', color: 'white' }}
                      >
                        🎤
                        <div className="inline-flex gap-[2px] items-end h-5">
                          <span className="inline-block w-[3px] rounded-sm" style={{ background: '#53BDEB', height: '6px' }} />
                          <span className="inline-block w-[3px] rounded-sm" style={{ background: '#53BDEB', height: '14px' }} />
                          <span className="inline-block w-[3px] rounded-sm" style={{ background: '#53BDEB', height: '10px' }} />
                          <span className="inline-block w-[3px] rounded-sm" style={{ background: '#53BDEB', height: '18px' }} />
                          <span className="inline-block w-[3px] rounded-sm" style={{ background: '#53BDEB', height: '8px' }} />
                        </div>
                        {b.voice}
                        <span className="text-[10px]" style={{ color: '#8696A0' }}>{b.time} ✓✓</span>
                      </div>
                    );
                  }
                  if (b.type === 'quick') {
                    return (
                      <div key={idx} className="flex flex-wrap gap-1.5 p-2 self-stretch justify-end">
                        {b.options.map((q) => (
                          <button
                            key={q}
                            onClick={() => userPick(q)}
                            className="px-3.5 py-2 rounded-full text-[13px] font-semibold text-white border-none cursor-pointer hover:opacity-90"
                            style={{ background: '#00A884' }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              <div className="flex items-center gap-2 px-2.5 py-2" style={{ background: '#1F2C33' }}>
                <span style={{ color: '#8696A0', fontSize: '18px' }}>😊</span>
                <input
                  className="flex-1 px-3 py-2 rounded-full border-none text-[13px] text-white outline-none pointer-events-none"
                  placeholder="Type a message"
                  style={{ background: '#2A3942' }}
                  readOnly
                />
                <span className="text-white text-lg">🎤</span>
              </div>
            </div>
          </div>
        </div>

        {/* TECH PANEL */}
        <div className="bg-white rounded-card-lg p-6 border border-[var(--border)] shadow-jt-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Production architecture</div>
          <div className="text-[13px] mt-2 mb-3">
            Built on <strong>Meta WhatsApp Business Cloud API</strong> (free for first 1,000 conversations/mo) with{' '}
            <strong>Bhashini</strong> for Indic ASR/TTS. No worker installs anything — they just receive a message.
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mt-3.5">Live flow tracker</div>
          <div className="mt-2">
            {flowSteps.map((s, i) => {
              const isActive = i === activeStep;
              const isDone = doneSteps.has(i);
              return (
                <div
                  key={i}
                  className={[
                    'flex items-start gap-3 p-3 rounded-[10px] mb-1 transition-colors',
                    isActive ? 'bg-accent-green-light' : '',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[13px]',
                      isActive ? 'bg-accent-green text-white' : isDone ? 'bg-jt-blue text-white' : 'bg-[var(--border)] text-[var(--text-muted)]',
                    ].join(' ')}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{s.lbl}</div>
                    <div className="text-xs text-[var(--text-muted)]">{s.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mt-4 flex items-center gap-2 flex-wrap">
            Active WhatsApp groups
            <span className="px-2 py-0.5 rounded text-[11px] bg-jt-orange-light text-jt-orange-dark normal-case tracking-normal">
              47 groups · 12K members
            </span>
          </div>
          <div className="mt-2">
            {groups.map((g) => (
              <div key={g.name} className="flex items-center gap-2.5 p-2.5 mb-1.5 rounded-[10px]" style={{ background: 'var(--bg)' }}>
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white text-lg shrink-0"
                  style={{ background: '#25D366' }}
                >
                  📣
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[13px] truncate">{g.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{g.members.toLocaleString()} members · {g.lang}</div>
                </div>
                <div className="text-xs font-bold text-accent-green">{g.views} views</div>
              </div>
            ))}
          </div>

          <button
            onClick={postToGroups}
            className="w-full mt-3 px-4 py-2.5 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold text-[13px] hover:bg-jt-blue-light"
          >
            📣 Post latest JD to all 47 groups
          </button>

          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mt-5">Why WhatsApp wins for Bharat</div>
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mt-1">
            • <strong>98% of smartphones</strong> in tier 2/3 India already have WhatsApp installed<br />
            • <strong>Voice notes</strong> are how they actually communicate — not typing<br />
            • <strong>Zero install friction</strong> — the #1 killer of blue-collar funnels<br />
            • <strong>Forwardable</strong> — one message can hit 50 referrals in a kirana group
          </p>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlow } from '../lib/flowStore.jsx';
import { i18n, speechLangCode } from '../lib/i18n.js';
import { api } from '../lib/api.js';

// Per-question chip → typed-answer mapping (same logic as prototype's pickChip)
const CHIP_VALUES = [
  [22, 28, 35, 45],
  [0, 1, 3, 5],
  [3, 10, 20, 32],
  ['yes', 'yes', 'partial', 'no'],
  ['yes', 'yes', 'partial', 'no'],
];

const TITLES = { en: 'Voice Screening', hi: 'आवाज़ से स्क्रीनिंग', te: 'వాయిస్ స్క్రీనింగ్' };
const TAP_HINTS = {
  en: 'Tap the mic to answer',
  hi: 'जवाब देने के लिए माइक दबाएँ',
  te: 'సమాధానం చెప్పడానికి మైక్ నొక్కండి',
};
const GOT_IT = { en: '✓ Got it!', hi: '✓ समझ गए!', te: '✓ అర్థమైంది!' };

function parseAnswer(text, expects) {
  const t = text.toLowerCase();
  if (expects === 'yesno') {
    if (/yes|yeah|yup|haa+n|haa|sure|ஆம்|आम/.test(t)) return 'yes';
    return 'no';
  }
  const digits = (t.match(/\d+/) || [])[0];
  if (digits) return parseInt(digits, 10);
  const numWords = { one: 1, two: 2, three: 3, four: 4, five: 5, ten: 10, twenty: 20, 'twenty five': 25, 'twenty eight': 28, thirty: 30 };
  for (const w of Object.keys(numWords)) if (t.includes(w)) return numWords[w];
  return text;
}

export default function Screening() {
  const navigate = useNavigate();
  const { state, update } = useFlow();
  const lang = state.lang || 'en';
  const pack = i18n[lang];

  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([null, null, null, null, null]);
  const [demoMode, setDemoMode] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusText, setStatusText] = useState(TAP_HINTS[lang]);
  const [submitting, setSubmitting] = useState(false);
  const recognitionRef = useRef(null);
  const typerRef = useRef(null);

  const q = pack.questions[qIdx];
  const total = pack.questions.length;
  const canAdvance = answers[qIdx] !== null && !listening;

  // TTS the question whenever it changes
  useEffect(() => {
    setTranscript('');
    setStatusText(TAP_HINTS[lang]);
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(q.text);
        u.lang = speechLangCode[lang];
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch {}
    }
    return () => {
      if (typerRef.current) clearInterval(typerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, [qIdx, lang, q.text]);

  function setAnswer(value, displayText) {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = value;
      return next;
    });
    if (displayText !== undefined) setTranscript(displayText);
    setStatusText(GOT_IT[lang]);
  }

  function pickChip(i, optLabel) {
    setAnswer(CHIP_VALUES[qIdx][i], `(tapped) ${optLabel}`);
  }

  function runDemoVoice() {
    const demoText = pack.demoAnswers[qIdx];
    const mapped = pack.demoMapped[qIdx];
    setListening(true);
    setStatusText(pack.listening);
    setTranscript('');
    setTimeout(() => {
      setStatusText(pack.processing);
      let i = 0;
      typerRef.current = setInterval(() => {
        if (i < demoText.length) {
          setTranscript((prev) => prev + demoText[i]);
          i++;
        } else {
          clearInterval(typerRef.current);
          typerRef.current = null;
          setListening(false);
          setAnswer(mapped, demoText);
        }
      }, 50);
    }, 1400);
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      // No Web Speech API — fall back to demo mode automatically
      setDemoMode(true);
      runDemoVoice();
      return;
    }
    if (listening) return;

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = speechLangCode[lang];
    rec.interimResults = true;
    rec.continuous = false;

    setListening(true);
    setStatusText(pack.listening);
    setTranscript('');
    let finalText = '';

    rec.onresult = (ev) => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setTranscript((finalText + interim).trim());
    };
    rec.onerror = () => {
      setListening(false);
      setStatusText('Mic error — using demo voice');
      setTimeout(runDemoVoice, 600);
    };
    rec.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      if (finalText.trim()) {
        const parsed = parseAnswer(finalText, q.expects);
        setAnswer(parsed, finalText.trim());
      } else {
        setStatusText('Did not catch that — try again');
      }
    };

    rec.start();
  }

  function handleMicClick() {
    if (demoMode) runDemoVoice();
    else startListening();
  }

  async function submitAnswer() {
    if (qIdx < total - 1) {
      setQIdx(qIdx + 1);
      return;
    }
    // Last question — POST to backend
    setSubmitting(true);
    try {
      const result = await api.post('/screen', { lang, answers });
      update({
        answers,
        score: result.score,
        verdict: result.verdict,
        breakdown: result.breakdown,
      });
      navigate('/score');
    } catch (err) {
      setStatusText('Server error: ' + err.message);
      setSubmitting(false);
    }
  }

  function skipQuestion() {
    setAnswer(null);
    submitAnswer();
  }

  return (
    <div className="screen-enter bg-white rounded-card-lg p-7 shadow-jt-sm border border-[var(--border)]">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Worker · Step 2 of 5
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{TITLES[lang]}</h2>
        </div>
        <button
          onClick={() => setDemoMode((d) => !d)}
          className={[
            'inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-colors',
            demoMode
              ? 'bg-accent-green-light text-accent-green border-transparent'
              : 'bg-jt-blue-light text-jt-blue border-transparent',
          ].join(' ')}
        >
          <span>{demoMode ? '🎬' : '🎙'}</span>
          <span>Demo Mode: {demoMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6">
        {pack.questions.map((_, i) => (
          <div
            key={i}
            className={[
              'flex-1 h-1.5 rounded-full transition-colors',
              i < qIdx ? 'bg-accent-green' : i === qIdx ? 'bg-jt-orange' : 'bg-[var(--border)]',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Voice stage */}
      <div
        className="rounded-card-lg p-9 text-center border border-[var(--border)]"
        style={{ background: 'linear-gradient(135deg, #F8FAFF, #FFF6F0)' }}
      >
        <span className="inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-jt-orange-light text-jt-orange-dark">
          Question {qIdx + 1} of {total}
        </span>
        <div className="text-2xl sm:text-[26px] font-bold text-jt-blue my-4 min-h-[70px]">
          {q.text}
        </div>
        {lang !== 'en' && (
          <div className="text-sm text-[var(--text-muted)] font-medium -mt-2 mb-4">
            {i18n.en.questions[qIdx].text}
          </div>
        )}

        <button
          onClick={handleMicClick}
          disabled={submitting}
          className={[
            'w-32 h-32 rounded-full border-none text-white text-5xl my-4 mx-auto flex items-center justify-center cursor-pointer transition-transform',
            'shadow-[0_12px_32px_rgba(242,101,34,.4)] hover:scale-105',
            listening ? 'mic-pulse' : '',
          ].join(' ')}
          style={{ background: 'linear-gradient(135deg, var(--jt-orange), var(--jt-orange-dark))' }}
          aria-label="Tap to answer"
        >
          {listening ? (
            <div className="wave">
              <span /><span /><span /><span /><span />
            </div>
          ) : (
            '🎤'
          )}
        </button>

        <div className="text-sm text-[var(--text-muted)] mt-2 min-h-[22px]">{statusText}</div>

        <div
          className={[
            'bg-white rounded-xl px-4 py-3.5 mt-4 text-base min-h-[56px] border border-dashed border-[var(--border)]',
            transcript ? 'text-[var(--text)]' : 'text-[var(--text-muted)] italic',
          ].join(' ')}
        >
          {transcript || 'Your answer will appear here…'}
        </div>

        {/* Tap-chip alternatives */}
        <div className="flex gap-2.5 flex-wrap justify-center mt-4">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pickChip(i, opt)}
              className="px-4 py-2.5 rounded-full bg-white border-2 border-[var(--border)] font-semibold transition-colors hover:border-jt-orange hover:bg-jt-orange-light"
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-2.5 mt-5">
          <button
            onClick={skipQuestion}
            disabled={submitting}
            className="px-5 py-3 rounded-xl bg-transparent text-jt-blue border border-[var(--border)] font-semibold hover:bg-jt-blue-light disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={submitAnswer}
            disabled={!canAdvance || submitting}
            className="px-5 py-3 rounded-xl bg-jt-orange text-white font-semibold shadow-[0_4px_12px_rgba(242,101,34,.3)] hover:bg-jt-orange-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Scoring…' : qIdx < total - 1 ? 'Next →' : 'See result →'}
          </button>
        </div>
      </div>
    </div>
  );
}

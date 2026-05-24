import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { DEFAULT_ROLE_ID, DEFAULT_HUB_ID } from './roleCatalog.js';

const FlowContext = createContext(null);

const STORAGE_KEY = 'atlas.recruiter';

function loadPersisted() {
  if (typeof localStorage === 'undefined') return { recruiterMode: false, recruiterId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { recruiterMode: false, recruiterId: null };
    const parsed = JSON.parse(raw);
    return {
      recruiterMode: !!parsed.recruiterMode,
      recruiterId: parsed.recruiterId || null,
    };
  } catch {
    return { recruiterMode: false, recruiterId: null };
  }
}

const persisted = loadPersisted();

const initialState = {
  lang: 'en',
  candidate: { name: 'Ramesh Kumar', phone: '+91 98765 43210' },
  role: DEFAULT_ROLE_ID,
  hub: DEFAULT_HUB_ID,
  answers: [null, null, null, null, null],
  score: null,
  verdict: null,
  breakdown: null,
  selectedSlot: null,
  booking: null,
  selectedCandidate: null,
  toast: null,

  // Field-recruitment mode (persisted)
  recruiterMode: persisted.recruiterMode,
  recruiterId: persisted.recruiterId,

  // Intake form data (per-candidate, NOT persisted)
  intake: {
    name: '',
    phone: '',
    photo: null, // data URL
    gps: null,   // { lat, lng }
  },
};

export function FlowProvider({ children }) {
  const [state, setState] = useState(initialState);
  const toastTimer = useRef(null);

  // Persist recruiter prefs whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ recruiterMode: state.recruiterMode, recruiterId: state.recruiterId })
      );
    } catch { /* private mode etc */ }
  }, [state.recruiterMode, state.recruiterId]);

  const update = (patch) => setState((s) => ({ ...s, ...patch }));

  // Reset per-candidate data but PRESERVE recruiter mode + id
  const reset = () =>
    setState((s) => ({
      ...initialState,
      recruiterMode: s.recruiterMode,
      recruiterId: s.recruiterId,
    }));

  const updateIntake = (patch) =>
    setState((s) => ({ ...s, intake: { ...s.intake, ...patch } }));

  const setRecruiterMode = (on, idHint) => {
    setState((s) => {
      let id = s.recruiterId;
      if (on && !id) id = (idHint || 'Field Recruiter').trim() || 'Field Recruiter';
      if (!on) id = s.recruiterId; // keep id around so toggling back doesn't re-prompt
      return { ...s, recruiterMode: on, recruiterId: id };
    });
  };

  const setRecruiterId = (id) => setState((s) => ({ ...s, recruiterId: id }));

  const toast = (msg) => {
    setState((s) => ({ ...s, toast: msg }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setState((s) => ({ ...s, toast: null }));
    }, 2200);
  };

  return (
    <FlowContext.Provider
      value={{ state, update, reset, updateIntake, setRecruiterMode, setRecruiterId, toast }}
    >
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useFlow must be used inside <FlowProvider>');
  return ctx;
}

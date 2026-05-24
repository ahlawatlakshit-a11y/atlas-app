import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { DEFAULT_ROLE_ID, DEFAULT_HUB_ID } from './roleCatalog.js';

const FlowContext = createContext(null);

// ---- Demo-only access control --------------------------------------------
// Manager view is gated behind this PIN. Swap to real auth before production.
// For interview/pitch demos: tell the interviewer the PIN out-of-band.
export const MANAGER_PIN = '2024';

const RECRUITER_KEY = 'atlas.recruiter';
const MANAGER_KEY   = 'atlas.manager';

function loadRecruiterPersisted() {
  if (typeof localStorage === 'undefined') return { recruiterMode: false, recruiterId: null };
  try {
    const raw = localStorage.getItem(RECRUITER_KEY);
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

function loadManagerPersisted() {
  if (typeof localStorage === 'undefined') return { managerMode: false };
  try {
    const raw = localStorage.getItem(MANAGER_KEY);
    if (!raw) return { managerMode: false };
    return { managerMode: !!JSON.parse(raw).managerMode };
  } catch {
    return { managerMode: false };
  }
}

const recruiterPersisted = loadRecruiterPersisted();
const managerPersisted = loadManagerPersisted();

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
  recruiterMode: recruiterPersisted.recruiterMode,
  recruiterId: recruiterPersisted.recruiterId,

  // Manager login (persisted) — gates /manager and Manager nav pill
  managerMode: managerPersisted.managerMode,

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

  // Persist recruiter prefs
  useEffect(() => {
    try {
      localStorage.setItem(
        RECRUITER_KEY,
        JSON.stringify({ recruiterMode: state.recruiterMode, recruiterId: state.recruiterId })
      );
    } catch { /* private mode etc */ }
  }, [state.recruiterMode, state.recruiterId]);

  // Persist manager login
  useEffect(() => {
    try {
      localStorage.setItem(MANAGER_KEY, JSON.stringify({ managerMode: state.managerMode }));
    } catch { /* private mode etc */ }
  }, [state.managerMode]);

  const update = (patch) => setState((s) => ({ ...s, ...patch }));

  // Reset per-candidate data but PRESERVE recruiter + manager modes
  const reset = () =>
    setState((s) => ({
      ...initialState,
      recruiterMode: s.recruiterMode,
      recruiterId: s.recruiterId,
      managerMode: s.managerMode,
    }));

  const updateIntake = (patch) =>
    setState((s) => ({ ...s, intake: { ...s.intake, ...patch } }));

  const setRecruiterMode = (on, idHint) => {
    setState((s) => {
      let id = s.recruiterId;
      if (on && !id) id = (idHint || 'Field Recruiter').trim() || 'Field Recruiter';
      if (!on) id = s.recruiterId;
      return { ...s, recruiterMode: on, recruiterId: id };
    });
  };

  const setRecruiterId = (id) => setState((s) => ({ ...s, recruiterId: id }));

  // Returns true if PIN matched, false otherwise. Caller is responsible for toasting.
  const loginAsManager = (pin) => {
    if (String(pin).trim() === MANAGER_PIN) {
      setState((s) => ({ ...s, managerMode: true }));
      return true;
    }
    return false;
  };

  const logoutManager = () => setState((s) => ({ ...s, managerMode: false }));

  const toast = (msg) => {
    setState((s) => ({ ...s, toast: msg }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setState((s) => ({ ...s, toast: null }));
    }, 2200);
  };

  return (
    <FlowContext.Provider
      value={{
        state,
        update,
        reset,
        updateIntake,
        setRecruiterMode,
        setRecruiterId,
        loginAsManager,
        logoutManager,
        toast,
      }}
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

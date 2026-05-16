import { createContext, useContext, useRef, useState } from 'react';

const FlowContext = createContext(null);

const initialState = {
  lang: 'en',
  candidate: { name: 'Ramesh Kumar', phone: '+91 98765 43210' },
  answers: [null, null, null, null, null],
  score: null,
  verdict: null,
  breakdown: null,
  selectedSlot: null,
  booking: null,
  selectedCandidate: null,
  toast: null,
};

export function FlowProvider({ children }) {
  const [state, setState] = useState(initialState);
  const toastTimer = useRef(null);

  const update = (patch) => setState((s) => ({ ...s, ...patch }));
  const reset = () => setState({ ...initialState });

  const toast = (msg) => {
    setState((s) => ({ ...s, toast: msg }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setState((s) => ({ ...s, toast: null }));
    }, 2200);
  };

  return <FlowContext.Provider value={{ state, update, reset, toast }}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useFlow must be used inside <FlowProvider>');
  return ctx;
}

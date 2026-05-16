import { useFlow } from '../lib/flowStore.jsx';

export default function Toast() {
  const { state } = useFlow();
  const visible = !!state.toast;
  return (
    <div
      className={[
        'fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-xl text-white font-semibold shadow-jt-lg transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-32',
      ].join(' ')}
      style={{ background: 'var(--jt-blue-dark)' }}
    >
      {state.toast || 'Saved!'}
    </div>
  );
}

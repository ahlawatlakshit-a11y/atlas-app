import { Routes, Route, Navigate } from 'react-router-dom';
import Topbar from './components/Topbar.jsx';
import Toast from './components/Toast.jsx';
import { useFlow } from './lib/flowStore.jsx';
import Home from './screens/Home.jsx';
import JDGenerator from './screens/JDGenerator.jsx';
import Language from './screens/Language.jsx';
import Intake from './screens/Intake.jsx';
import Screening from './screens/Screening.jsx';
import Score from './screens/Score.jsx';
import Slot from './screens/Slot.jsx';
import Confirm from './screens/Confirm.jsx';
import Dashboard from './screens/Dashboard.jsx';
import Manager from './screens/Manager.jsx';
import WhatsApp from './screens/WhatsApp.jsx';
import Referral from './screens/Referral.jsx';
import Offer from './screens/Offer.jsx';

// Gate manager-only routes. If a non-manager tries to visit /manager directly
// (typed URL, shared link, etc.) they bounce back to home + see a toast.
function ManagerOnly({ children }) {
  const { state, toast } = useFlow();
  if (!state.managerMode) {
    // Defer toast to next tick so it doesn't fire mid-render
    setTimeout(() => toast('🔒 Manager view requires login'), 0);
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-6 pt-7 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jd" element={<JDGenerator />} />
          <Route path="/language" element={<Language />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/screening" element={<Screening />} />
          <Route path="/score" element={<Score />} />
          <Route path="/slot" element={<Slot />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manager" element={<ManagerOnly><Manager /></ManagerOnly>} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/offer" element={<Offer />} />
        </Routes>
      </main>
      <Toast />
    </>
  );
}

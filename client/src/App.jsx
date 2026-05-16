import { Routes, Route } from 'react-router-dom';
import Topbar from './components/Topbar.jsx';
import Toast from './components/Toast.jsx';
import Home from './screens/Home.jsx';
import JDGenerator from './screens/JDGenerator.jsx';
import Language from './screens/Language.jsx';
import Screening from './screens/Screening.jsx';
import Score from './screens/Score.jsx';
import Slot from './screens/Slot.jsx';
import Confirm from './screens/Confirm.jsx';
import Dashboard from './screens/Dashboard.jsx';
import WhatsApp from './screens/WhatsApp.jsx';
import Referral from './screens/Referral.jsx';
import Offer from './screens/Offer.jsx';

export default function App() {
  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-6 pt-7 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jd" element={<JDGenerator />} />
          <Route path="/language" element={<Language />} />
          <Route path="/screening" element={<Screening />} />
          <Route path="/score" element={<Score />} />
          <Route path="/slot" element={<Slot />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/offer" element={<Offer />} />
        </Routes>
      </main>
      <Toast />
    </>
  );
}

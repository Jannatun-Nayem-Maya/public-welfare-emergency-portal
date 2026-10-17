import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useLang } from './context/LangContext.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import Health from './pages/Health.jsx';
import BloodDonors from './pages/BloodDonors.jsx';
import Scholarship from './pages/Scholarship.jsx';
import DisasterAlerts from './pages/DisasterAlerts.jsx';
import EmergencyContacts from './pages/EmergencyContacts.jsx';
import ReliefApply from './pages/ReliefApply.jsx';
import ServiceApply from './pages/ServiceApply.jsx';
import Volunteer from './pages/Volunteer.jsx';
import WelfarePrograms from './pages/WelfarePrograms.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CitizenDashboard from './pages/CitizenDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const { t } = useLang();
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/health" element={<Health />} />
          <Route path="/blood-donors" element={<BloodDonors />} />
          <Route path="/scholarship" element={<Scholarship />} />
          <Route path="/disaster-alerts" element={<DisasterAlerts />} />
          <Route path="/emergency-contacts" element={<EmergencyContacts />} />
          <Route path="/relief-apply" element={<ProtectedRoute><ReliefApply /></ProtectedRoute>} />
          <Route path="/service-apply/:name" element={<ProtectedRoute><ServiceApply /></ProtectedRoute>} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/welfare-programs" element={<WelfarePrograms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<div className="container section center"><h2>404</h2><p>{t('পাতাটি পাওয়া যায়নি', 'Page not found')}</p></div>} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          <p>© 2026 {t('জনসেবা পোর্টাল – ডিজিটাল গভর্নেন্স প্ল্যাটফর্ম', 'Jonoseba Portal – Digital Governance Platform')}</p>
          <small>{t('জরুরি প্রয়োজনে ৯৯৯ নম্বরে কল করুন', 'In an emergency, call 999')}</small>
        </div>
      </footer>
    </div>
  );
}

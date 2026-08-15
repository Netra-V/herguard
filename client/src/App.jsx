import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from "./components/common/layout/DashboardLayout";
import AuthLayout from "./components/common/layout/AuthLayout";
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SOSTokenSetup from './pages/SOSTokenSetup';
import ForgotPassword from './pages/ForgetPassword';
import NotFound from './pages/NotFound';
import Dashboard from './pages/dashboard/Dashboard';
import EmergencySOS from './pages/dashboard/EmergencySOS';
import SafeRoute from './pages/dashboard/SafeRoute';
import DangerMap from './pages/dashboard/DangerMap';
import TripTracker from './pages/dashboard/TripTracker';
import ReportIncident from './pages/dashboard/ReportIncident';
import EmergencyContacts from './pages/dashboard/EmergencyContacts';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/sos-token" element={<SOSTokenSetup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/sos" element={<EmergencySOS />} />
          <Route path="/dashboard/safe-route" element={<SafeRoute />} />
          <Route path="/dashboard/danger-map" element={<DangerMap />} />
          <Route path="/dashboard/trip-tracker" element={<TripTracker />} />
          <Route path="/dashboard/report" element={<ReportIncident />} />
          <Route path="/dashboard/contacts" element={<EmergencyContacts />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
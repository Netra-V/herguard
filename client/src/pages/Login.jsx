import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import { ToastContext } from '../context/ToastContext';
import { triggerPublicSOS } from '../services/sosService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import '../styles/auth.css';

const emergencyNumbers = [
  { label: 'Police: 100', tel: '100' },
  { label: 'Women Helpline: 1091', tel: '1091' },
  { label: 'Ambulance: 102', tel: '102' },
  { label: 'National Emergency: 112', tel: '112' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const [sosProcessing, setSosProcessing] = useState(false);

  const getSOSSessionToken = () => localStorage.getItem('hergod_sos_token');

  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Location services are not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
        (error) => {
          const messages = {
            1: 'Location permission was denied. Please allow location access and try again.',
            2: 'Your current location could not be determined. Please try again.',
            3: 'Location request timed out. Please try again.',
          };
          reject(new Error(messages[error.code] || 'Unable to get your current location.'));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

  const handleSOS = async (event) => {
    event.preventDefault();
    if (sosProcessing) return;

    const sosToken = getSOSSessionToken();

    if (!sosToken) {
      showToast(
        'Emergency SOS is not registered on this device. Please create your HerGod account once, then SOS will work without login.',
        'error'
      );
      return;
    }

    setSosProcessing(true);

    try {
      const location = await getCurrentLocation();
      const result = await triggerPublicSOS({
        sosToken,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      showToast(result.message || 'Emergency SOS activated.', 'success');
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || 'Unable to activate SOS. Please try again.',
        'error'
      );
    } finally {
      setSosProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="glass auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="auth-logo">HerGod</div>
      <p className="auth-tagline">Women's Safety & Emergency Support Platform</p>
      <h2 className="auth-heading">Welcome back</h2>
      <p className="auth-sub">Sign in to your HerGod account</p>

      <form onSubmit={handleSubmit}>
        <Input label="Email Address" type="email" placeholder="priya@email.com" required
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" placeholder="Your password" required
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <Link to="/forgot-password" style={{ color: 'var(--blue)', fontSize: '.85rem' }}>Forgot password?</Link>
        </div>

        <div className="auth-tip">💡 Demo tip: Register first, then log in with the same credentials.</div>

        <Button type="submit" className="btn-block" disabled={loading}>
          {loading ? 'Signing in...' : '🔒 Sign In'}
        </Button>
      </form>

      <p className="auth-footer">Don't have an account? <Link to="/signup">Create one</Link></p>

      {getSOSSessionToken() && (
        <div
          className="auth-tip"
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            border: '1px solid var(--border)',
          }}
        >
          <strong>🛡️ Your Emergency SOS Token</strong>
          <div
            style={{
              marginTop: '.6rem',
              padding: '.65rem',
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1.15rem',
              fontWeight: 700,
              letterSpacing: '.12em',
            }}
          >
            {getSOSSessionToken()}
          </div>
          <p style={{ marginTop: '.55rem', color: 'var(--muted)', fontSize: '.8rem', lineHeight: 1.5 }}>
            This unique token identifies your registered HerGod account for Emergency SOS.
            You do not need to sign in to use the SOS button below.
          </p>
        </div>
      )}

      <div className="emergency-box">
        <h4>Need help right now?</h4>
        <button
          type="button"
          onClick={handleSOS}
          disabled={sosProcessing}
          aria-label="Emergency SOS"
          style={{
            display: 'block',
            width: '100%',
            padding: 0,
            margin: 0,
            border: 0,
            background: 'transparent',
            textAlign: 'left',
            cursor: sosProcessing ? 'wait' : 'pointer',
          }}
        >
          <div className="sos-quick">
            <span style={{ fontSize: '1.5rem' }}>🚨</span>
            <div>
              <strong>{sosProcessing ? 'Activating SOS...' : 'Emergency SOS'}</strong>
              <p style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                No login needed — tap to alert
              </p>
            </div>
          </div>
        </button>
        <div className="dial-pills">
          {emergencyNumbers.map((n) => (
            <a key={n.tel} href={`tel:${n.tel}`} className="dial-pill">{n.label}</a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
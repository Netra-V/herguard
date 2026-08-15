import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import '../styles/auth.css';

export default function SOSTokenSetup() {
  const location = useLocation();
  const token = location.state?.sosToken || localStorage.getItem('hergod_sos_token');

  return (
    <motion.div
      className="glass auth-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="auth-logo">HerGod</div>

      <p className="auth-tagline">
        Women's Safety & Emergency Support Platform
      </p>

      <h2 className="auth-heading">Emergency SOS Activated</h2>

      <p className="auth-sub">
        Your account has been created successfully. HerGod has generated a
        unique Emergency SOS Token for your account.
      </p>

      <div className="auth-tip">
        <strong>🛡️ Your Emergency SOS is ready</strong>
        <p style={{ marginTop: '.5rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          This token is securely linked to your account. It will also be
          displayed on the Sign In page for clarity. Most importantly, the
          Emergency SOS button can identify your account using this token
          without requiring you to sign in during an emergency.
        </p>

        {token && (
          <div
            style={{
              marginTop: '1rem',
              padding: '.75rem',
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
              fontWeight: 700,
              letterSpacing: '.08em',
            }}
          >
            SOS Token: {token}
          </div>
        )}
      </div>

      <div className="emergency-box">
        <h4>How Emergency SOS works</h4>

        <div style={{ color: 'var(--text)', fontSize: '.88rem', lineHeight: 1.7 }}>
          <p>1. Your unique token is generated during registration.</p>
          <p>2. The token is linked to your User ID in the database.</p>
          <p>3. The token is kept on this browser for emergency use.</p>
          <p>4. You can press Emergency SOS from the Login page without signing in.</p>
        </div>
      </div>

      <p className="auth-footer" style={{ marginTop: '.75rem' }}>
        <strong>For demonstration:</strong> your unique SOS Token will remain visible on the Sign In page so the emergency-token concept is clear.
      </p>

      <Link to="/login">
        <Button type="button" className="btn-block">
          Continue to Sign In
        </Button>
      </Link>

      <p className="auth-footer">
        Your normal email/password login remains unchanged.
      </p>
    </motion.div>
  );
}

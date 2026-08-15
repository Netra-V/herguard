import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import { ToastContext } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import '../styles/auth.css';

export default function Signup() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    ecName: '', ecPhone: '', ecRelation: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        emergencyContact: {
          name: form.ecName,
          phone: form.ecPhone,
          relation: form.ecRelation,
        },
      });

      showToast('Account created! Your Emergency SOS Token is ready.', 'success');

      navigate('/sos-token', {
        state: { sosToken: data.sosToken },
        replace: true,
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="glass auth-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 520 }}
    >
      <div className="auth-logo">HerGod</div>
      <p className="auth-tagline">Women's Safety & Emergency Support Platform</p>
      <h2 className="auth-heading">Create your account</h2>
      <p className="auth-sub">Your safety journey starts here.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <Input
            label="Full Name"
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            label="Phone Number"
            placeholder="+91 9876543210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="you@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="Minimum 6 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div className="emergency-section">
          <h4>🛡️ Emergency Contact 1 (Required for SOS)</h4>

          <Input
            label="Contact Name"
            required
            placeholder="Mom / Dad"
            value={form.ecName}
            onChange={(e) => setForm({ ...form, ecName: e.target.value })}
          />

          <div className="form-row">
            <Input
              label="Phone"
              required
              placeholder="+91 9876543210"
              value={form.ecPhone}
              onChange={(e) => setForm({ ...form, ecPhone: e.target.value })}
            />

            <Input
              label="Relation"
              placeholder="Mother / Father / Friend"
              value={form.ecRelation}
              onChange={(e) => setForm({ ...form, ecRelation: e.target.value })}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="btn-block"
          disabled={loading}
          style={{ marginTop: '1rem' }}
        >
          {loading ? 'Creating...' : '✨ Create Account'}
        </Button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </motion.div>
  );
}

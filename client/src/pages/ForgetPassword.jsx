import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forgotPassword, resetPassword } from '../services/authService';
import { ToastContext } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import '../styles/auth.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useContext(ToastContext);

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setToken(res.resetToken);
      showToast('Reset token generated (demo mode)', 'success');
      setStep(2);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ token, password });
      showToast('Password reset! You can login now.', 'success');
      setStep(3);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <motion.div className="glass auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="auth-logo">HerGod</div>
      <h2 className="auth-heading">Reset Password</h2>
      <p className="auth-sub">
        {step === 1 && 'Enter your email to receive a reset token.'}
        {step === 2 && 'Enter the token and your new password.'}
        {step === 3 && 'Password updated successfully!'}
      </p>

      {step === 1 && (
        <form onSubmit={handleForgot}>
          <Input label="Email Address" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="btn-block" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Token'}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleReset}>
          <Input label="Reset Token" required value={token}
            onChange={(e) => setToken(e.target.value)} />
          <Input label="New Password" type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="btn-block" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}

      {step === 3 && (
        <Link to="/login"><Button className="btn-block">Go to Login</Button></Link>
      )}

      <p className="auth-footer"><Link to="/login">← Back to login</Link></p>
    </motion.div>
  );
}
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', textAlign: 'center', padding: '2rem',
      background: 'linear-gradient(135deg,#eef2ff,#ede9fe)' }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 800, background: 'var(--gradient)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Page not found</p>
      <Link to="/"><Button>Go Home</Button></Link>
    </div>
  );
}
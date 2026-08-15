import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import '../styles/landing.css';

const features = [
  { icon: '🚨', title: 'One-Tap SOS', desc: 'Instant SMS alerts to emergency contacts with live GPS.', path: '/dashboard/sos' },
  { icon: '🗺️', title: 'Danger Map', desc: 'Community-reported incidents on an interactive live map.', path: '/dashboard/danger-map' },
  { icon: '🛣️', title: 'Safe Route', desc: 'Smart routing that avoids high-risk areas.', path: '/dashboard/safe-route' },
  { icon: '🚗', title: 'Trip Tracker', desc: 'Share live location during journeys with safety check-ins.', path: '/dashboard/trip-tracker' },
  { icon: '📝', title: 'Report Incidents', desc: 'Help others by reporting unsafe areas in your community.', path: '/dashboard/report' },
  { icon: '👥', title: 'Emergency Contacts', desc: 'Manage up to 5 trusted contacts for instant alerts.', path: '/dashboard/contacts' },
];

export default function Landing() {
  return (
    <div className="landing">
      <nav className="nav-bar">
        <div className="nav-logo">HerGod</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#stats">Impact</a>
          <Link to="/login"><Button variant="outline" className="btn-sm">Sign In</Button></Link>
          <Link to="/signup"><Button className="btn-sm">Get Started</Button></Link>
        </div>
      </nav>

      <section className="hero">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1>Your Safety, Our Priority</h1>
          <p>HerGod is a modern women's safety platform with SOS alerts, live maps, safe routing, and community-powered incident reporting.</p>
          <div className="hero-btns">
            <Link to="/signup"><Button>Create Free Account</Button></Link>
            <Link to="/login"><Button variant="outline">Sign In</Button></Link>
          </div>
        </motion.div>
      </section>

      <section id="about" className="section">
        <div className="about-grid">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="section-title" style={{ textAlign: 'left' }}>About HerGod</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
              HerGod empowers women with technology-driven safety tools. From one-tap emergency alerts
              to community danger maps and smart route planning — everything you need to stay safe.
            </p>
          </motion.div>
          <motion.div className="glass glass-card" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h3 style={{ marginBottom: '0.75rem' }}>🛡️ Built for Safety</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Real-time GPS, instant contact alerts, and a supportive community.</p>
          </motion.div>
        </div>
      </section>

      <section id="features" className="section">
        <h2 className="section-title">Features</h2>
        <p className="section-sub">Everything you need to stay safe, anywhere, anytime.</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <Link key={f.title} to={f.path} className="feature-link">
              <motion.div className="glass feature-card"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{f.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <section id="stats" className="section">
        <h2 className="section-title">Emergency Statistics</h2>
        <p className="section-sub">Every second counts in an emergency.</p>
        <div className="stats-row">
          {[
            { n: '1091', l: 'Women Helpline' },
            { n: '100', l: 'Police' },
            { n: '102', l: 'Ambulance' },
            { n: '112', l: 'National Emergency' },
          ].map((s) => (
            <div key={s.l} className="glass glass-card">
              <div className="stat-num">{s.n}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="cta-section">
        <h2>Ready to feel safer?</h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>Join HerGod today — it's free.</p>
        <Link to="/signup"><Button style={{ background: '#fff', color: 'var(--blue)' }}>Create Account</Button></Link>
      </div>

      <footer className="footer">
        <p>© 2026 HerGod — Women's Safety & Emergency Support Platform</p>
      </footer>
    </div>
  );
}
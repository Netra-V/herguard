import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { getDashboardStats } from '../../services/authService';
import { getContacts } from '../../services/contactService';
import { getNotifications, deleteNotification } from '../../services/notificationService';
import useGeolocation from '../../hooks/useGeolocation';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { greet, fmtDate } from '../../utils/formatters';

const actions = [
  { title: 'SOS Alert', desc: 'Trigger emergency alert', icon: '🚨', color: 'red', path: '/dashboard/sos' },
  { title: 'Live Map', desc: 'View danger heatmap', icon: '🗺️', color: 'blue', path: '/dashboard/danger-map' },
  { title: 'Safe Route', desc: 'Plan a safe journey', icon: '🛣️', color: 'green', path: '/dashboard/safe-route' },
  { title: 'Report Incident', desc: 'Alert the community', icon: '📝', color: 'yellow', path: '/dashboard/report' },
  { title: 'Trip Tracker', desc: 'Get safety check-ins', icon: '🚗', color: 'purple', path: '/dashboard/trip-tracker' },
  { title: 'My Profile', desc: 'Manage contacts', icon: '👤', color: 'pink', path: '/dashboard/profile' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { position } = useGeolocation();
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifs((items) => items.filter((item) => item._id !== id));
    } catch {
      // Keep the dashboard usable if deletion fails.
    }
  };

  useEffect(() => {
    Promise.all([getDashboardStats(), getContacts(), getNotifications()])
      .then(([s, c, n]) => { setStats(s); setContacts(c); setNotifs(n); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="dash-header">
        <div className="dash-greeting">
          <h1>{greet()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>You have {stats?.contacts || 0} emergency contacts saved — Stay safe today.</p>
        </div>
        <button className="quick-sos-btn" onClick={() => navigate('/dashboard/sos')}>
          🚨 Quick SOS
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: '👥', cls: 'blue', val: stats?.contacts || 0, lbl: 'Emergency Contacts' },
          { icon: '🚨', cls: 'purple', val: stats?.sosCount || 0, lbl: 'SOS Alerts Sent' },
          { icon: '📝', cls: 'yellow', val: stats?.reports || 0, lbl: 'Reports Submitted' },
          { icon: '🚗', cls: 'green', val: stats?.activeTrips || 0, lbl: 'Active Trips' },
        ].map((s) => (
          <motion.div key={s.lbl} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="stat-card">
              <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
              <div className="stat-info"><h3>{s.val}</h3><p>{s.lbl}</p></div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Safety Score</h3>
          <div className="safety-score">
            <div className="safety-ring" style={{ '--pct': `${stats?.safetyScore || 75}%` }}>
              <div className="safety-ring-inner">{stats?.safetyScore || 75}%</div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
              {stats?.safetyScore >= 80 ? 'Excellent! You are well prepared.' : 'Add more contacts to improve your score.'}
            </p>
          </div>
        </Card>
        <Card>
          <h3 style={{ marginBottom: '1rem' }}>📍 Your Location</h3>
          {position ? (
            <div>
              <p style={{ fontSize: '.9rem' }}>Lat: {position.lat.toFixed(5)}</p>
              <p style={{ fontSize: '.9rem' }}>Lng: {position.lng.toFixed(5)}</p>
              <span className="badge badge-green" style={{ marginTop: '.5rem' }}>GPS Active</span>
            </div>
          ) : (
            <p style={{ color: 'var(--muted)' }}>Fetching location...</p>
          )}
        </Card>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
      <div className="actions-grid">
        {actions.map((a, i) => (
          <motion.button type="button" key={a.title} className={`action-card ${a.color}`}
            initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }} onClick={() => navigate(a.path)} aria-label={`Open ${a.title}`}>
            <span style={{ fontSize: '1.8rem' }}>{a.icon}</span>
            <h3>{a.title}</h3>
            <p>{a.desc}</p>
          </motion.button>
        ))}
      </div>

      <div className="bottom-row">
        <Card className="tip-box">
          <h3>💡 Safety Tip of the Day</h3>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginTop: '.5rem' }}>
            Share your live location with a trusted contact when travelling alone at night.
            Use HerGod Trip Tracker for automatic check-ins every 10 minutes.
          </p>
        </Card>
        <Card>
          <h3 style={{ marginBottom: '.75rem' }}>Emergency Contacts</h3>
          {contacts.length === 0 ? (
            <p className="empty-state">No contacts yet. Add them in Profile.</p>
          ) : contacts.slice(0, 3).map((c) => (
            <div key={c._id} className="contact-preview">
              <div className="contact-avatar">{c.name[0]}</div>
              <div>
                <strong style={{ fontSize: '.9rem' }}>{c.name}</strong>
                <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{c.phone} · {c.relation}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="bottom-row" style={{ marginTop: '1.25rem' }}>
        <Card>
          <h3 style={{ marginBottom: '.75rem' }}>🔔 Notifications</h3>
          {notifs.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>No notifications yet.</p>
          ) : notifs.slice(0, 5).map((n) => (
            <div
              key={n._id}
              className="notif-item"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <strong>{n.title}</strong>
                <p style={{ color: 'var(--muted)' }}>{n.message}</p>
                <small style={{ color: 'var(--muted)' }}>{fmtDate(n.createdAt)}</small>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteNotification(n._id)}
                title="Delete notification"
                aria-label={`Delete notification: ${n.title}`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  flex: '0 0 auto',
                }}
              >
                🗑
              </button>
            </div>
          ))}
        </Card>
        <Card className="weather-widget">
          <div className="weather-icon">⛅</div>
          <div>
            <h3>Weather</h3>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Stay aware of conditions during travel.</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '.25rem' }}>28°C</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
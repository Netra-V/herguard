import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuth from "../../../hooks/useAuth";
import { getContacts } from "../../../services/contactService";

const links = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/dashboard/sos', icon: '🚨', label: 'Emergency SOS', badge: true },
  { to: '/dashboard/safe-route', icon: '🛣️', label: 'Safe Route' },
  { to: '/dashboard/danger-map', icon: '🗺️', label: 'Danger Map' },
  { to: '/dashboard/trip-tracker', icon: '🚗', label: 'Trip Tracker' },
  { to: '/dashboard/report', icon: '📝', label: 'Report Incident' },
  { to: '/dashboard/contacts', icon: '👥', label: 'Emergency Contacts' },
  { to: '/dashboard/profile', icon: '👤', label: 'Profile' },
  { to: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [contactCount, setContactCount] = useState(0);

  useEffect(() => {
    getContacts().then((c) => setContactCount(c.length)).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-logo">HerGod</div>
      <div className="sidebar-user">
        <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <div className="sidebar-user-info">
          <span>{user?.name}</span>
          <small>{contactCount} contacts saved</small>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/dashboard'}
            className="nav-item"
            onClick={onClose}
          >
            <span>{l.icon}</span> {l.label}
            {l.badge && <span className="nav-badge">!</span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button type="button" className="logout-btn" onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
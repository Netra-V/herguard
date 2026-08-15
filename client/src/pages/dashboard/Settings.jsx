import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import useAuth from '../../hooks/useAuth';
import { updateSettings } from '../../services/authService';
import { ToastContext } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import '../../styles/pages/settings.css';

function Toggle({ on, onToggle }) {
  return <button type="button" className={`toggle ${on ? 'on' : ''}`} onClick={onToggle} aria-pressed={on} />;
}

export default function Settings() {
  const { user } = useAuth();
  const { dark, setDark } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    privacy: true,
    language: 'en',
    locationSharing: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings);
      setDark(user.settings.darkMode);
    }
    setLoading(false);
  }, [user]);

  const save = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    if (key === 'darkMode') setDark(value);
    try {
      await updateSettings({ [key]: value });
      showToast('Settings saved', 'success');
    } catch {
      showToast('Failed to save', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Customize your HerGod experience.</p>

      <div className="settings-grid">
        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Appearance</h3>
          <div className="setting-row">
            <div>
              <strong>Dark Mode</strong>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>Switch to dark theme</p>
            </div>
            <Toggle on={settings.darkMode || dark} onToggle={() => save('darkMode', !settings.darkMode)} />
          </div>
          <div className="setting-row">
            <div>
              <strong>Language</strong>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>App display language</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => save('language', e.target.value)}
              style={{ padding: '.4rem .75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
            </select>
          </div>
        </Card>

        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Notifications</h3>
          <div className="setting-row">
            <div>
              <strong>Push Notifications</strong>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>SOS, trip & incident alerts</p>
            </div>
            <Toggle on={settings.notifications} onToggle={() => save('notifications', !settings.notifications)} />
          </div>
        </Card>

        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Privacy</h3>
          <div className="setting-row">
            <div>
              <strong>Location Sharing</strong>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>Share GPS during SOS & trips</p>
            </div>
            <Toggle on={settings.locationSharing} onToggle={() => save('locationSharing', !settings.locationSharing)} />
          </div>
          <div className="setting-row">
            <div>
              <strong>Profile Privacy</strong>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>Hide profile from community</p>
            </div>
            <Toggle on={settings.privacy} onToggle={() => save('privacy', !settings.privacy)} />
          </div>
        </Card>

        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Account</h3>
          <div className="setting-row">
            <div>
              <strong>Email</strong>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{user?.email}</p>
            </div>
          </div>
          <div className="setting-row">
            <div>
              <strong>Account Status</strong>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>Active & Verified</p>
            </div>
            <span className="badge badge-green">Active</span>
          </div>
          <div className="setting-row">
            <div>
              <strong>App Version</strong>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>HerGod v1.0.0</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
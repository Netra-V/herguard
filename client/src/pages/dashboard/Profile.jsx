import { useState, useEffect, useContext } from 'react';
import useAuth from '../../hooks/useAuth';
import { getProfile, updateProfile, changePassword } from '../../services/authService';
import { ToastContext } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import '../../styles/pages/profile.css';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then(({ user: u, contacts: c }) => {
        setForm({ name: u.name, email: u.email, phone: u.phone || '', address: u.address || '' });
        setContacts(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      setUser((prev) => ({ ...prev, ...updated }));
      localStorage.setItem('hergod_user', JSON.stringify({ ...user, ...updated }));
      showToast('Profile saved!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    try {
      await changePassword(pwForm);
      showToast('Password changed!', 'success');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Password change failed', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">My Profile</h1>
      <p className="page-sub">Manage your account and emergency contacts.</p>

      <div className="profile-grid">
        <Card>
          <h3 style={{ marginBottom: '.25rem' }}>Personal Information</h3>
          <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '1.25rem' }}>
            Update your account details.
          </p>

          <div className="profile-header">
            <div className="profile-avatar-lg">{form.name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <h3>{form.name}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{form.email}</p>
              <span className="badge badge-blue" style={{ marginTop: '.35rem' }}>Verified</span>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <Input label="Full Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email Address" type="email" value={form.email} disabled />
            <Input label="Phone Number" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Address" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Button type="submit" disabled={saving} style={{ marginTop: '.5rem' }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </Card>

        <Card>
          <h3 style={{ marginBottom: '.25rem' }}>Emergency Contacts</h3>
          <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '1.25rem' }}>
            These people will be alerted when you trigger SOS.
          </p>
          {contacts.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No contacts yet.</p>
          ) : contacts.map((c) => (
            <div key={c._id} style={{ padding: '.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <strong>{c.name}</strong>
              {c.isPrimary && <span className="badge badge-blue" style={{ marginLeft: '.5rem' }}>Primary</span>}
              <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{c.phone} · {c.relation}</p>
            </div>
          ))}
          <a href="/dashboard/contacts" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--blue)', fontSize: '.85rem' }}>
            Manage contacts →
          </a>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(79,70,229,.06)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
              🛡️ SOS alerts are sent via SMS with your live GPS coordinates.
            </p>
          </div>
        </Card>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Change Password</h3>
        <form onSubmit={handlePassword} style={{ maxWidth: 400 }}>
          <Input label="Current Password" type="password" required
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          <Input label="New Password" type="password" required
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          <Button type="submit">Update Password</Button>
        </form>
      </Card>

      <div className="summary-grid">
        {[
          { icon: '👥', val: contacts.length, lbl: 'Emergency Contacts' },
          { icon: '✅', val: 'Active', lbl: 'Account Status' },
          { icon: '📍', val: 'Enabled', lbl: 'Location Sharing' },
          { icon: '🚨', val: 'Ready', lbl: 'SOS System' },
        ].map((s) => (
          <Card key={s.lbl} className="summary-card">
            <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
            <div className="num">{s.val}</div>
            <div className="lbl">{s.lbl}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
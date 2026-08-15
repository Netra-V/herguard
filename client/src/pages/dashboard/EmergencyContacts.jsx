import { useState, useEffect, useContext } from 'react';
import {
  getContacts, addContact, updateContact, deleteContact, setPrimary,
} from '../../services/contactService';
import { ToastContext } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import '../../styles/pages/contacts.css';

const emptyForm = { name: '', phone: '', relation: 'Friend' };


export default function EmergencyContacts() {
  const { showToast } = useContext(ToastContext);
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => getContacts().then(setContacts).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateContact(editId, form);
        showToast('Contact updated', 'success');
      } else {
        await addContact(form);
        showToast('Contact added', 'success');
      }
      setForm(emptyForm);
      setEditId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    await deleteContact(id);
    showToast('Contact deleted', 'info');
    load();
  };

  const handlePrimary = async (id) => {
    await setPrimary(id);
    showToast('Primary contact updated', 'success');
    load();
  };

  const startEdit = (c) => {
    setEditId(c._id);
    setForm({ name: c.name, phone: c.phone, relation: c.relation });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">Emergency Contacts</h1>
      <p className="page-sub">These people will be alerted by SMS when you trigger SOS. You can also call any saved contact.</p>

      <Card style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{editId ? 'Edit Contact' : 'Add New Contact'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="contact-form-grid">
            <Input label="Name" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Phone" required value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Relation" value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1rem' }}>
            <Button type="submit">{editId ? 'Update Contact' : '+ Add Contact'}</Button>
            {editId && (
              <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm(emptyForm); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {contacts.length === 0 ? (
        <Card><p className="empty-state">No emergency contacts yet. Add one above.</p></Card>
      ) : contacts.map((c) => (
        <Card key={c._id} className="contact-card">
          <div className="contact-info">
            <div className="contact-avatar">{c.name[0]}</div>
            <div>
              <strong>{c.name}</strong>
              {c.isPrimary && <span className="primary-tag" style={{ marginLeft: '.5rem' }}>Primary</span>}
              <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{c.phone} · {c.relation}</p>
            </div>
          </div>
          <div className="contact-actions">
            <a href={`tel:${c.phone}`} aria-label={`Call ${c.name}`}><Button type="button" className="btn-sm" variant="outline">📞 Call</Button></a>
            {!c.isPrimary && (
              <Button className="btn-sm" variant="outline" onClick={() => handlePrimary(c._id)}>⭐ Primary</Button>
            )}
            <Button className="btn-sm" variant="outline" onClick={() => startEdit(c)}>✏️ Edit</Button>
            <Button className="btn-sm" variant="danger" onClick={() => handleDelete(c._id)}>🗑</Button>
          </div>
        </Card>
      ))}

      <Card style={{ marginTop: '1.5rem', background: 'rgba(79,70,229,.06)' }}>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
          🛡️ When you trigger SOS, all saved contacts receive an SMS with your live GPS location. Use the Call button for immediate voice contact.
        </p>
      </Card>
    </div>
  );
}
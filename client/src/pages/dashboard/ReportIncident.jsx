import { useState, useEffect, useContext } from 'react';
import useGeolocation from '../../hooks/useGeolocation';
import { submitReport, getMyReports, deleteIncident } from '../../services/incidentService';
import { ToastContext } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { incidentTypes, fmtDate } from '../../utils/formatters';
import '../../styles/pages/report.css';

export default function ReportIncident() {
  const { position, refresh } = useGeolocation();
  const { showToast } = useContext(ToastContext);
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [severity, setSeverity] = useState(3);
  const [anonymous, setAnonymous] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [myReports, setMyReports] = useState([]);

  useEffect(() => {
    getMyReports().then(setMyReports).catch(() => {});
  }, []);

  useEffect(() => {
    if (position) {
      setLat(position.lat.toFixed(6));
      setLng(position.lng.toFixed(6));
    }
  }, [position]);

  const addMyLocation = () => {
    refresh();
    if (position) {
      setLat(position.lat.toFixed(6));
      setLng(position.lng.toFixed(6));
      showToast('Location added', 'success');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    try {
      await deleteIncident(id);
      setMyReports((reports) => reports.filter((report) => report._id !== id));
      showToast('Report deleted', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete report', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !description) return showToast('Fill all required fields', 'error');

    setLoading(true);
    const fd = new FormData();
    fd.append('type', type);
    fd.append('description', description);
    fd.append('latitude', lat || '13.0827');
    fd.append('longitude', lng || '80.2707');
    fd.append('address', address);
    fd.append('severity', severity);
    fd.append('anonymous', anonymous);
    if (photo) fd.append('photo', photo);

    try {
      const report = await submitReport(fd);
      setMyReports((r) => [report, ...r]);
      showToast('Report submitted successfully!', 'success');
      setDescription('');
      setType('');
      setPhoto(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Submit failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Report Unsafe Area</h1>
      <p className="page-sub">Your contribution helps others stay safe in this area.</p>

      <div className="report-grid">
        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Submit a Report</h3>
          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: '.5rem' }}>
              Incident Type
            </label>
            <div className="type-grid">
              {incidentTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`type-btn ${type === t.id ? 'selected' : ''}`}
                  onClick={() => setType(t.id)}
                >
                  <span className="icon">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="required">Description</label>
              <textarea
                rows={4}
                placeholder="Describe what happened and any details that could help others..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <Button type="button" onClick={addMyLocation} className="btn-sm" style={{ marginBottom: '1rem' }}>
              📍 Add My Location
            </Button>

            <div className="form-row">
              <Input label="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
              <Input label="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
            <div className="form-row">
              <Input label="Area / Locality" placeholder="T Nagar, Chennai"
                value={address} onChange={(e) => setAddress(e.target.value)} />
              <Input label="Time of Incident" placeholder="9 PM"
                onChange={() => {}} />
            </div>

            <div className="form-group">
              <label>Severity: {severity}/5</label>
              <input
                type="range" min={1} max={5} value={severity}
                className="severity-slider"
                onChange={(e) => setSeverity(+e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--muted)' }}>
                <span>Low</span><span>High</span>
              </div>
            </div>

            <div className="form-group">
              <label>Photo (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.85rem', marginBottom: '1rem' }}>
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
              Submit anonymously
            </label>

            <Button type="submit" className="btn-block" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </Card>

        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Your Reports</h3>
          {myReports.length === 0 ? (
            <p className="empty-state">No reports yet.</p>
          ) : myReports.map((r) => (
            <div key={r._id} className="report-card glass-sm">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4>{r.type.replace(/_/g, ' ')}</h4>
                <span className="badge badge-yellow">{r.status?.replace(/_/g, ' ')}</span>
              </div>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.35rem' }}>
                {r.description?.slice(0, 80)}...
              </p>
              <div className="report-meta">
                📍 {r.location?.address || 'Unknown'} · 📅 {fmtDate(r.createdAt)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '.75rem' }}>
                <Button type="button" variant="danger" className="btn-sm" onClick={() => handleDelete(r._id)}>
                  🗑 Delete Report
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
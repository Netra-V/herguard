import { useState, useEffect, useRef, useContext } from 'react';
import useGeolocation from '../../hooks/useGeolocation';
import { triggerSOS, resolveSOS, getActiveSOS } from '../../services/sosService';
import { getContacts } from '../../services/contactService';
import { ToastContext } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { fmtDate } from '../../utils/formatters';
import '../../styles/pages/sos.css';

export default function EmergencySOS() {
  const { position, loading: gpsLoading, refresh } = useGeolocation();
  const { showToast } = useContext(ToastContext);
  const [activeSOS, setActiveSOS] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [sending, setSending] = useState(false);
  const timerRef = useRef(null);
  const holdRef = useRef(null);

  useEffect(() => {
    getActiveSOS().then(setActiveSOS).catch(() => {});
    getContacts().then(setContacts).catch(() => {});
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(holdRef.current);
    };
  }, []);

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    timerRef.current = setInterval(() => {
      count -= 1;

      if (count <= 0) {
        clearInterval(timerRef.current);
        setCountdown(null);
        sendSOS();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const cancelCountdown = () => {
    clearInterval(timerRef.current);
    setCountdown(null);
    showToast('SOS cancelled', 'info');
  };

  const sendSOS = async () => {
    if (!position) {
      showToast('Waiting for a precise GPS location...', 'error');
      await refresh();
      return;
    }

    setSending(true);

    try {
      const res = await triggerSOS({
        latitude: position.lat,
        longitude: position.lng,
      });

      setActiveSOS(res.log);
      showToast(res.message, 'success');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'SOS notification failed',
        'error'
      );
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async (status) => {
    try {
      await resolveSOS(status);
      setActiveSOS(null);
      showToast(
        status === 'safe' ? 'Marked as safe' : 'False alarm recorded',
        'info'
      );
    } catch {
      showToast('Unable to update SOS status', 'error');
    }
  };

  if (gpsLoading) return <Spinner />;

  return (
    <div className="sos-page">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 className="page-title">SOS Emergency System</h1>
          <p className="page-sub">
            One-tap SMS alerts your location to all emergency contacts.
          </p>
        </div>
        <span className="gps-badge">📍 GPS Active</span>
      </div>

      {activeSOS && (
        <div className="active-banner">
          <div>
            <strong>🚨 SOS ALERT ACTIVE</strong>
            <p style={{ fontSize: '.85rem', marginTop: '.25rem' }}>
              Location sent to {activeSOS.contactsNotified?.length || 0} contacts.
              Triggered at: {fmtDate(activeSOS.triggeredAt || activeSOS.createdAt)}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '.75rem' }}>
            <Button
              onClick={() => handleResolve('safe')}
              style={{ background: '#fff', color: '#ef4444' }}
            >
              I'm Safe Now
            </Button>

            <Button
              variant="outline"
              onClick={() => handleResolve('false_alarm')}
              style={{ borderColor: '#fff', color: '#fff' }}
            >
              False Alarm
            </Button>
          </div>
        </div>
      )}

      <div className="sos-grid">
        <Card>
          <h3 style={{ marginBottom: '.5rem' }}>Emergency SOS</h3>

          <p
            style={{
              color: 'var(--muted)',
              fontSize: '.85rem',
              marginBottom: '1rem',
            }}
          >
            Hold to send an SMS alert to all emergency contacts.
          </p>

          <div className="sos-btn-wrap">
            {countdown !== null ? (
              <>
                <div className="countdown">{countdown}</div>
                <Button variant="outline" onClick={cancelCountdown}>
                  Cancel
                </Button>
              </>
            ) : (
              <button
                className={`sos-circle ${sending ? 'counting' : ''}`}
                onMouseDown={() => {
                  holdRef.current = setTimeout(startCountdown, 500);
                }}
                onMouseUp={() => clearTimeout(holdRef.current)}
                onMouseLeave={() => clearTimeout(holdRef.current)}
                onTouchStart={() => {
                  holdRef.current = setTimeout(startCountdown, 500);
                }}
                onTouchEnd={() => clearTimeout(holdRef.current)}
                disabled={sending || !!activeSOS}
              >
                SOS
              </button>
            )}

            <p
              style={{
                color: 'var(--muted)',
                fontSize: '.8rem',
                marginTop: '1rem',
              }}
            >
              A 3-second countdown gives you time to cancel accidental presses.
            </p>

            {position && (
              <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                📍 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                {position.accuracy
                  ? ` · Accuracy ±${Math.round(position.accuracy)} m`
                  : ''}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h3 style={{ marginBottom: '1rem' }}>
            What happens when you press SOS?
          </h3>

          <div className="steps-list">
            {[
              ['Location Captured', 'GPS coordinates are recorded instantly.'],
              ['Contacts Alerted', 'SMS is sent to all saved emergency contacts.'],
              ['Alert Logged', 'The SOS is saved in MongoDB for records.'],
              ['Stay on Screen', 'Keep the app open until you reach safety.'],
            ].map(([title, desc], i) => (
              <div key={title} className="step-item">
                <div className="step-num">{i + 1}</div>
                <div>
                  <strong style={{ fontSize: '.9rem' }}>{title}</strong>
                  <p style={{ color: 'var(--muted)', fontSize: '.82rem' }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Your Emergency Contacts</h3>

        {contacts.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>
            No contacts added. Go to Emergency Contacts page.
          </p>
        ) : (
          contacts.map((c) => (
            <div
              key={c._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '.75rem 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <strong>{c.name}</strong>
                <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
                  {c.phone} · {c.relation}
                </p>
              </div>

              <a href={`tel:${c.phone}`} aria-label={`Call ${c.name}`}>
                <Button type="button" className="btn-sm" variant="outline">
                  📞 Call
                </Button>
              </a>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

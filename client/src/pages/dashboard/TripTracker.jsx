import { useState, useEffect, useRef, useContext } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import useGeolocation from '../../hooks/useGeolocation';
import {
  startTrip, getTrips, getActiveTrip, updateLocation,
  pauseTrip, endTrip, emergencyStop, deleteTrip,
} from '../../services/tripService';
import { ToastContext } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { fmtDate, fmtDist } from '../../utils/formatters';
import '../../styles/pages/trip.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 14); }, [center, map]);
  return null;
}

export default function TripTracker() {
  const { position } = useGeolocation();
  const { showToast } = useContext(ToastContext);
  const [form, setForm] = useState({ origin: '', destination: '', estimatedTime: 30, checkInInterval: 10 });
  const [activeTrip, setActiveTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState([]);
  const [remaining, setRemaining] = useState(null);
  const watchRef = useRef(null);

  useEffect(() => {
    Promise.all([getActiveTrip(), getTrips()])
      .then(([active, all]) => {
        setActiveTrip(active);
        setTrips(all);
        if (active?.travelledRoute?.length) {
          setRoute(active.travelledRoute.map((p) => [p.lat, p.lng]));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (position && !form.origin) {
      setForm((f) => ({ ...f, origin: `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` }));
    }
  }, [position]);

  useEffect(() => {
    if (!activeTrip || activeTrip.status !== 'active') {
      if (watchRef.current) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
      return;
    }

    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setRoute((r) => [...r, [lat, lng]]);
        try {
          const updated = await updateLocation(activeTrip._id, { lat, lng, remainingDistance: remaining });
          setActiveTrip(updated);
        } catch {}
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, [activeTrip?._id, activeTrip?.status]);

  const handleStart = async (e) => {
    e.preventDefault();
    try {
      const trip = await startTrip({
        ...form,
        originCoords: position ? { lat: position.lat, lng: position.lng } : undefined,
        travelledRoute: position ? [{ lat: position.lat, lng: position.lng }] : [],
        liveLocation: position ? { lat: position.lat, lng: position.lng } : undefined,
      });
      setActiveTrip(trip);
      setRoute(position ? [[position.lat, position.lng]] : []);
      showToast('Trip started! Live location sharing active.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start trip', 'error');
    }
  };

  const handlePause = async () => {
    const t = await pauseTrip(activeTrip._id);
    setActiveTrip(t);
    showToast('Trip paused', 'info');
  };

  const handleEnd = async () => {
    const t = await endTrip(activeTrip._id);
    setActiveTrip(null);
    setTrips((prev) => [t, ...prev]);
    setRoute([]);
    showToast('Trip completed!', 'success');
  };

  const handleEmergency = async () => {
    await emergencyStop(activeTrip._id);
    showToast('Emergency stop triggered! SOS contacts notified.', 'error');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this completed trip? This cannot be undone.')) return;
    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((trip) => trip._id !== id));
      showToast('Completed trip deleted', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete trip', 'error');
    }
  };

  if (loading) return <Spinner />;

  const mapCenter = route.length ? route[route.length - 1] : position ? [position.lat, position.lng] : [13.0827, 80.2707];

  return (
    <div>
      <h1 className="page-title">Trip Safety Tracker</h1>
      <p className="page-sub">Share live location and get safety check-ins during your journey.</p>

      {activeTrip && (
        <div className="trip-active-banner">
          <div>
            <strong>🚗 Trip Active</strong>
            <p style={{ fontSize: '.85rem', opacity: .9 }}>
              {activeTrip.origin} → {activeTrip.destination}
            </p>
          </div>
          <div className="trip-controls">
            {activeTrip.status === 'active' ? (
              <Button onClick={handlePause} style={{ background: '#fff', color: 'var(--blue)' }}>⏸ Pause</Button>
            ) : (
              <Button onClick={() => setActiveTrip({ ...activeTrip, status: 'active' })} style={{ background: '#fff', color: 'var(--blue)' }}>▶ Resume</Button>
            )}
            <Button onClick={handleEnd} style={{ background: '#22c55e', color: '#fff' }}>✅ End Trip</Button>
            <Button variant="danger" onClick={handleEmergency}>🚨 Emergency Stop</Button>
          </div>
        </div>
      )}

      <div className="trip-grid">
        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Start a New Trip</h3>
          <form onSubmit={handleStart}>
            <Input label="Origin" value={form.origin} required
              onChange={(e) => setForm({ ...form, origin: e.target.value })} />
            <Input label="Destination" value={form.destination} required
              placeholder="Enter destination..."
              onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            <div className="form-row">
              <Input label="Estimated Travel Time (min)" type="number" value={form.estimatedTime}
                onChange={(e) => setForm({ ...form, estimatedTime: +e.target.value })} />
              <Input label="Check-in Every (min)" type="number" value={form.checkInInterval}
                onChange={(e) => setForm({ ...form, checkInInterval: +e.target.value })} />
            </div>
            <Button type="submit" className="btn-block" disabled={!!activeTrip} style={{ marginTop: '.5rem' }}>
              🚗 Start Safe Trip
            </Button>
          </form>

          {activeTrip && (
            <div style={{ marginTop: '1.25rem', fontSize: '.85rem', color: 'var(--muted)' }}>
              <p>📍 Live tracking: {activeTrip.status === 'active' ? 'Active' : 'Paused'}</p>
              <p>⏱ Est. arrival: ~{activeTrip.estimatedTime} min</p>
              {remaining != null && <p>📏 Remaining: {fmtDist(remaining)}</p>}
            </div>
          )}
        </Card>

        <Card>
          <h3 style={{ marginBottom: '1rem' }}>Recent Trips</h3>
          {trips.length === 0 ? (
            <p className="empty-state">No trips yet.</p>
          ) : trips.map((t) => (
            <div key={t._id} className="trip-item">
              <div>
                <div className="trip-route">{t.origin} → {t.destination}</div>
                <div className="trip-meta">{fmtDate(t.startedAt || t.createdAt)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span className={`badge ${t.status === 'completed' ? 'badge-green' : t.status === 'emergency' ? 'badge-red' : 'badge-blue'}`}>
                  {t.status}
                </span>
                {t.status === 'completed' && (
                  <Button
                    type="button"
                    variant="danger"
                    className="btn-sm"
                    onClick={() => handleDelete(t._id)}
                    title="Delete completed trip"
                  >
                    🗑 Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {(activeTrip || route.length > 0) && (
        <div className="map-box" style={{ marginTop: '1.5rem' }}>
          <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors" />
            <MapUpdater center={mapCenter} />
            {route.length > 1 && <Polyline positions={route} color="#7c3aed" weight={4} />}
            {route.length > 0 && (
              <Marker position={route[route.length - 1]}>
                <Popup>Current position</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
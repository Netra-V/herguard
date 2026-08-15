import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import useGeolocation from '../../hooks/useGeolocation';
import { getIncidents, getNearby } from '../../services/incidentService';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { severityColor, severityLabel, incidentTypes } from '../../utils/formatters';
import { fmtDate } from '../../utils/formatters';
import '../../styles/pages/maps.css';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 14); }, [center, map]);
  return null;
}

export default function DangerMap() {
  const { position, loading } = useGeolocation();
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (position) setMapCenter([position.lat, position.lng]);
  }, [position]);

  useEffect(() => {
    setLoadingData(true);
    const fetchData = position
      ? getNearby({ lat: position.lat, lng: position.lng, radius: 15000 })
      : getIncidents({ type: filter }).then((r) => r.incidents);

    fetchData
      .then((data) => setIncidents(Array.isArray(data) ? data : []))
      .catch(() => setIncidents([]))
      .finally(() => setLoadingData(false));
  }, [position, filter]);

  const filtered = filter === 'all'
    ? incidents
    : incidents.filter((i) => i.type === filter);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="map-header">
        <div>
          <h1 className="page-title">Live Danger Map</h1>
          <p className="page-sub">Community reported alerts within 5 miles radius</p>
        </div>
        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Reports</option>
          {incidentTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      <Card className="severity-bar glass-sm">
        <span>SEVERITY:</span>
        {[5, 4, 3, 2, 1].map((s) => (
          <span key={s} style={{ fontSize: '.78rem' }}>
            <span className="sev-dot" style={{ backgroundColor: severityColor(s), border: `1px solid ${severityColor(s)}` }} />
            {severityLabel(s)}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '.78rem', color: 'var(--blue)' }}>
          📍 Your Location
        </span>
      </Card>

      <div className="map-box">
        <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <MapUpdater center={mapCenter} />

          {position && (
            <CircleMarker
              center={[position.lat, position.lng]}
              radius={10}
              pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.6 }}
            >
              <Popup>You are here</Popup>
            </CircleMarker>
          )}

          {filtered.map((inc) => {
            const [lng, lat] = inc.location.coordinates;
            const severity = Math.min(5, Math.max(1, Number(inc.severity) || 3));
            const color = severityColor(severity);
            return (
              <CircleMarker
                key={inc._id}
                center={[lat, lng]}
                radius={8 + severity * 2}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.9,
                  opacity: 1,
                  weight: 2,
                }}
                eventHandlers={{ click: () => setSelected(inc) }}
              >
                <Popup>
                  <div className="incident-popup">
                    <h4>{inc.type.replace(/_/g, ' ')}</h4>
                    <p>{inc.description?.slice(0, 80)}</p>
                    <small>Severity: {severityLabel(severity)}</small>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Recent Community Reports</h3>
        {loadingData ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <p className="empty-state">No incidents reported nearby yet.</p>
        ) : (
          filtered.slice(0, 8).map((inc) => (
            <div
              key={inc._id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '.85rem 0', borderBottom: '1px solid var(--border)', cursor: 'pointer',
              }}
              onClick={() => setSelected(inc)}
            >
              <div>
                <strong style={{ textTransform: 'capitalize' }}>
                  {inc.type.replace(/_/g, ' ')}
                </strong>
                <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
                  {inc.location?.address || 'Unknown area'} · {fmtDate(inc.createdAt)}
                </p>
              </div>
              <span
                className="sev-dot"
                style={{ backgroundColor: severityColor(Math.min(5, Math.max(1, Number(inc.severity) || 3))), border: `2px solid ${severityColor(Math.min(5, Math.max(1, Number(inc.severity) || 3)))}`, width: 16, height: 16 }}
              />
            </div>
          ))
        )}
      </Card>

      {selected && (
        <Card style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ textTransform: 'capitalize' }}>{selected.type.replace(/_/g, ' ')}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginTop: '.5rem' }}>
                {selected.description}
              </p>
              <p style={{ fontSize: '.82rem', marginTop: '.5rem' }}>
                📍 {selected.location?.address || 'No address'} ·
                Severity: {severityLabel(Number(selected.severity) || 3)} ·
                {fmtDate(selected.createdAt)}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
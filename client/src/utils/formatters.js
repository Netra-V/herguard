export const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const fmtDate = (d) => new Date(d).toLocaleString();

export const fmtDist = (km) =>
  km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;

export const severityColor = (s) =>
  ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'][s - 1] || '#eab308';

export const severityLabel = (s) =>
  ['Very Low', 'Low', 'Medium', 'High', 'Very High'][s - 1] || 'Medium';

export const incidentTypes = [
  { id: 'harassment', label: 'Harassment', icon: '😠' },
  { id: 'theft', label: 'Theft', icon: '💰' },
  { id: 'assault', label: 'Assault', icon: '⚠️' },
  { id: 'unsafe_area', label: 'Unsafe Area', icon: '🚫' },
  { id: 'road_issue', label: 'Road Issue', icon: '🛣️' },
  { id: 'poor_lighting', label: 'Poor Lighting', icon: '💡' },
  { id: 'suspicious', label: 'Suspicious', icon: '👁️' },
  { id: 'other', label: 'Other', icon: '📝' },
];
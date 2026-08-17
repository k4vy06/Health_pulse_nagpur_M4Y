export const RISK_COLORS = {
  LOW: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', hex: '#22c55e', light: '#dcfce7' },
  MODERATE: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', hex: '#f59e0b', light: '#fef3c7' },
  HIGH: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', hex: '#f97316', light: '#ffedd5' },
  CRITICAL: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', hex: '#ef4444', light: '#fee2e2' },
};

export const DISEASE_COLORS = {
  'Dengue': '#ef4444',
  'Malaria': '#f97316',
  'Chikungunya': '#eab308',
  'Typhoid': '#8b5cf6',
  'Influenza': '#3b82f6',
  'Diarrheal Disease': '#06b6d4',
};

export const DISEASE_ICONS = {
  'Dengue': '🦟',
  'Malaria': '🦟',
  'Chikungunya': '🦟',
  'Typhoid': '💧',
  'Influenza': '🫁',
  'Diarrheal Disease': '💧',
};

export const STATUS_COLORS = {
  ACTIVE: 'text-red-400 bg-red-500/10 border-red-500/30',
  ACKNOWLEDGED: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  RESOLVED: 'text-green-400 bg-green-500/10 border-green-500/30',
  ASSIGNED: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  IN_PROGRESS: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  COMPLETED: 'text-green-400 bg-green-500/10 border-green-500/30',
  CANCELLED: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  NORMAL: 'text-green-400 bg-green-500/10 border-green-500/30',
  PRESSURE: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
};

export const PRIORITY_COLORS = {
  URGENT: 'text-red-400 bg-red-500/10 border-red-500/30',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  ROUTINE: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

export function getRiskColor(level) {
  return RISK_COLORS[level] || RISK_COLORS.LOW;
}

export function getMapColor(riskScore) {
  if (riskScore >= 81) return '#ef4444';
  if (riskScore >= 61) return '#f97316';
  if (riskScore >= 31) return '#f59e0b';
  return '#22c55e';
}

export function formatNumber(n) {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString('en-IN');
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}

export function calculateBedOccupancy(beds, availableBeds) {
  if (!beds || beds === 0) return 0;
  return Math.round(((beds - availableBeds) / beds) * 100);
}

export function generateWardPolygon(lat, lng, sizeKm = 0.7) {
  const offset = sizeKm / 111;
  return [[
    [lng - offset, lat - offset],
    [lng + offset, lat - offset],
    [lng + offset, lat + offset],
    [lng - offset, lat + offset],
    [lng - offset, lat - offset]
  ]];
}

export function getRiskLabel(score) {
  if (score >= 81) return 'CRITICAL';
  if (score >= 61) return 'HIGH';
  if (score >= 31) return 'MODERATE';
  return 'LOW';
}

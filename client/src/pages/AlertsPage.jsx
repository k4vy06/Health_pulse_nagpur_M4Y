import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { alertsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function AlertsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertsAPI.getAll();
      setAlerts(data || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (e, id) => {
    e.stopPropagation();
    try {
      await alertsAPI.acknowledge(id, { acknowledgedBy: user?.name || 'Dr. Priya Sharma' });
      fetchAlerts();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const handleResolve = async (e, id) => {
    e.stopPropagation();
    try {
      await alertsAPI.resolve(id);
      fetchAlerts();
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      (a.wardName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.disease || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.reason || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || a.riskLevel === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  if (loading) {
    return <LoadingSpinner message="Querying Outbreak Early Warning Alarms..." fullPage />;
  }

  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const ackCount = alerts.filter(a => a.status === 'ACKNOWLEDGED').length;
  const criticalCount = alerts.filter(a => a.riskLevel === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Early Warning Outbreak Alarms
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              {activeCount} Active Outbreaks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Automated outbreak triggers generated when case growth, density, baseline deviations, or neighboring spread exceed municipal thresholds.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-red-400 uppercase">Active Alerts</span>
            <div className="text-lg font-bold text-red-400">{activeCount}</div>
          </div>
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase">Acknowledged</span>
            <div className="text-lg font-bold text-amber-400">{ackCount}</div>
          </div>
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Critical Severity</span>
            <div className="text-lg font-bold text-white">{criticalCount}</div>
          </div>
          <ShieldAlert className="w-5 h-5 text-red-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Resolved</span>
            <div className="text-lg font-bold text-emerald-400">{alerts.filter(a => a.status === 'RESOLVED').length}</div>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by ward, pathogen, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-700 border border-surface-600 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Status:</span>
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Risk Level Filters */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Risk:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                riskFilter === r
                  ? 'bg-red-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3.5">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert._id}
              onClick={() => navigate(`/alerts/${alert._id}`)}
              className="group bg-surface-800/90 hover:bg-surface-800 border border-surface-600/80 hover:border-primary-500/50 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Alert Left Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-700 text-gray-300 border border-surface-600">
                    {alert.wardId || 'W01'}
                  </span>
                  <h3 className="text-base font-extrabold text-white group-hover:text-primary-400 transition-colors">
                    {alert.wardName || 'Sakkardara'}
                  </h3>
                  <span className="text-gray-400 font-semibold">•</span>
                  <span className="text-sm font-bold text-primary-400">{alert.disease}</span>
                  <RiskBadge level={alert.riskLevel} size="xs" />
                  <StatusBadge status={alert.status} size="xs" />
                </div>

                <p className="text-xs text-gray-300 leading-relaxed font-normal">
                  {alert.reason}
                </p>

                {/* Caseload Metrics & Relative Time */}
                <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400 pt-1">
                  <span>Current: <strong className="text-white font-mono">{alert.currentCases || 49}</strong></span>
                  <span>Previous: <strong className="text-gray-300 font-mono">{alert.previousCases || 31}</strong></span>
                  <span className="inline-flex items-center gap-1 text-red-400 font-bold bg-red-500/10 px-1.5 py-0.2 rounded">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{alert.growthPercent || 58}% surge
                  </span>
                  <span>•</span>
                  <span>Triggered {formatRelativeTime(alert.createdAt)}</span>
                </div>
              </div>

              {/* Alert Right Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-surface-700/80">
                {alert.status === 'ACTIVE' && (
                  <button
                    onClick={(e) => handleAcknowledge(e, alert._id)}
                    className="btn-primary text-xs py-2 bg-surface-700 hover:bg-primary-600 text-gray-200 hover:text-white"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.status === 'ACKNOWLEDGED' && (
                  <button
                    onClick={(e) => handleResolve(e, alert._id)}
                    className="btn-primary text-xs py-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Mark Resolved
                  </button>
                )}

                <Link
                  to={`/alerts/${alert._id}`}
                  className="btn-primary text-xs py-2 flex items-center gap-1.5"
                >
                  <span>Investigate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-surface-800/40 border border-dashed border-surface-700 rounded-2xl text-xs text-gray-400">
            No outbreak alerts match your active filters.
          </div>
        )}
      </div>
    </div>
  );
}

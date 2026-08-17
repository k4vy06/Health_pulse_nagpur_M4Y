import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  Building2,
  ClipboardList,
  Hospital,
  Sparkles,
  MapPin,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Zap,
  CheckCircle2,
  Radio
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { RiskBadge, StatusBadge, PriorityBadge } from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NagpurMap from '../components/map/NagpurMap';
import AIPlanModal from '../components/ai/AIPlanModal';
import { dashboardAPI, alertsAPI, riskAPI, facilitiesAPI } from '../services/api';
import { DISEASE_COLORS, DISEASE_ICONS, formatNumber, formatRelativeTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState('All');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsData, facData] = await Promise.all([
        dashboardAPI.getStats(),
        facilitiesAPI.getAll()
      ]);
      setStats(statsData);
      setFacilities(facData || []);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAcknowledge = async (e, alertId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await alertsAPI.acknowledge(alertId, { acknowledgedBy: user?.name || 'Health Officer' });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleGenerateAiPlan = async (wardName, disease, riskScore) => {
    try {
      const plan = await riskAPI.getAIPlan({
        wardName: wardName || 'Sakkardara',
        disease: disease || 'Dengue',
        currentCases: 49,
        previousCases: 31,
        growthPercent: 58,
        riskScore: riskScore || 87,
        nearbyHighRiskWards: 2,
        facilityPressure: true
      });
      setAiPlan(plan);
      setAiModalOpen(true);
    } catch (err) {
      console.error('Failed to generate AI plan:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating City-Wide Epidemic Telemetry..." fullPage />;
  }

  const highRiskWards = (stats?.wards || []).filter(
    w => w.currentRiskLevel === 'CRITICAL' || w.currentRiskLevel === 'HIGH'
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Surveillance Command Center
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Real-time municipal disease surveillance, 4-factor outbreak detection, and emergency containment operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="btn-ghost flex items-center gap-1.5 text-xs"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary-400' : ''}`} />
            <span>Sync</span>
          </button>

          <Link
            to="/simulator"
            className="btn-primary flex items-center gap-1.5 text-xs bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-md shadow-primary-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch Outbreak Simulator</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Weekly Cases"
          value={stats?.totalCases || 1284}
          subtitle="cases this week"
          trend={24}
          trendLabel="vs prev week"
          icon={Activity}
          color="red"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          title="Active Alerts"
          value={stats?.activeAlerts || 7}
          subtitle="outbreak triggers"
          badge="4 Critical"
          icon={AlertTriangle}
          color="amber"
          onClick={() => navigate('/alerts')}
        />
        <StatCard
          title="High Risk Wards"
          value={stats?.highRiskWards || 6}
          subtitle="of 22 municipal wards"
          icon={ShieldAlert}
          color="red"
          onClick={() => navigate('/wards')}
        />
        <StatCard
          title="Interventions"
          value={stats?.activeInterventions || 12}
          subtitle="containment teams active"
          icon={ClipboardList}
          color="emerald"
          onClick={() => navigate('/interventions')}
        />
        <StatCard
          title="Hospital Pressure"
          value={stats?.facilitiesUnderPressure || 3}
          subtitle="facilities near capacity"
          icon={Hospital}
          color="purple"
          onClick={() => navigate('/facilities')}
        />
        <StatCard
          title="Monitored Pathogens"
          value={stats?.diseasesMonitored || 6}
          subtitle="vector & water-borne"
          icon={Zap}
          color="cyan"
          onClick={() => navigate('/analytics')}
        />
      </div>

      {/* Main Grid: Outbreak Map & Disease Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Outbreak Map Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Geospatial Outbreak Heat & Ward Contagion
              </h3>
            </div>
            <Link
              to="/map"
              className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              <span>Full Screen GIS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="relative">
            <NagpurMap
              wards={stats?.wards || []}
              facilities={facilities}
              height="380px"
              showFacilities={true}
              showWardCentroids={true}
            />
          </div>
        </div>

        {/* Right Col: Disease Breakdown & Fast Actions */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-5 space-y-4 flex-1">
            <div className="flex items-center justify-between border-b border-surface-700 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary-400" />
                Active Pathogen Caseload
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">Past 7 Days</span>
            </div>

            <div className="space-y-3">
              {(stats?.diseaseBreakdown || []).map((item) => {
                const icon = DISEASE_ICONS[item.disease] || '🔬';
                const color = DISEASE_COLORS[item.disease] || '#3b82f6';
                const totalCases = stats?.totalCases || 1284;
                const percent = Math.round((item.cases / totalCases) * 100) || 10;

                return (
                  <div key={item.disease} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-gray-200">
                        <span>{icon}</span>
                        {item.disease}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-white">{formatNumber(item.cases)}</span>
                        <span className="text-[10px] text-gray-400">({percent}%)</span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick AI Action Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-900/40 via-surface-800 to-indigo-950/40 border border-primary-500/30 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-primary-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              PulseAI Decision Support
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Immediate outbreak containment protocols tailored for Nagpur's municipal epidemiology.
            </p>
            <button
              onClick={() => handleGenerateAiPlan('Sakkardara', 'Dengue', 87)}
              className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 shadow-md"
            >
              <span>Generate Sakkardara Dengue Protocol</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Live Alerts & High Risk Wards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Critical & High Priority Alerts Feed */}
        <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-700 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Early Warning Outbreak Alerts
              </h3>
            </div>
            <Link to="/alerts" className="text-xs font-semibold text-primary-400 hover:text-primary-300">
              View All (7) →
            </Link>
          </div>

          <div className="space-y-3">
            {(stats?.recentAlerts || []).slice(0, 4).map((alert) => (
              <div
                key={alert._id}
                onClick={() => navigate(`/alerts/${alert._id}`)}
                className="group p-3.5 rounded-xl bg-surface-700/40 hover:bg-surface-700 border border-surface-600 hover:border-primary-500/40 transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {alert.wardName || alert.wardId}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-semibold text-primary-400">
                      {alert.disease}
                    </span>
                    <RiskBadge level={alert.riskLevel} size="xs" />
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-1">
                    Risk score <strong>{alert.riskScore}/100</strong> • Rapid case increase triggering municipal threshold
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={alert.status} size="xs" />
                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={(e) => handleQuickAcknowledge(e, alert._id)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-surface-600 hover:bg-primary-600 text-gray-200 hover:text-white transition-colors"
                    >
                      Ack
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: High Risk Wards Leaderboard */}
        <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-700 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Priority Ward Surveillance Ranking
              </h3>
            </div>
            <Link to="/wards" className="text-xs font-semibold text-primary-400 hover:text-primary-300">
              All 22 Wards →
            </Link>
          </div>

          <div className="space-y-3">
            {highRiskWards.slice(0, 4).map((ward) => (
              <div
                key={ward.wardId}
                onClick={() => navigate(`/wards/${ward.wardId}`)}
                className="group p-3.5 rounded-xl bg-surface-700/40 hover:bg-surface-700 border border-surface-600 hover:border-primary-500/40 transition-all duration-150 cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">{ward.wardId}</span>
                    <span className="font-bold text-white text-xs sm:text-sm truncate">
                      {ward.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-800 text-gray-400 border border-surface-600">
                      {ward.zone || 'East'} Zone
                    </span>
                  </div>

                  {/* Risk Progress Bar */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-full h-2 rounded-full bg-surface-800 overflow-hidden flex-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          ward.currentRiskLevel === 'CRITICAL'
                            ? 'bg-red-500'
                            : ward.currentRiskLevel === 'HIGH'
                            ? 'bg-orange-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${ward.currentRiskScore}%` }}
                      />
                    </div>
                    <span className="font-mono font-extrabold text-xs text-white">
                      {ward.currentRiskScore}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <RiskBadge level={ward.currentRiskLevel} size="xs" />
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-primary-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Plan Modal */}
      <AIPlanModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        plan={aiPlan}
        wardName={aiPlan?.wardName || 'Sakkardara'}
        disease={aiPlan?.disease || 'Dengue'}
        onInterventionCreated={() => fetchDashboardData()}
      />
    </div>
  );
}

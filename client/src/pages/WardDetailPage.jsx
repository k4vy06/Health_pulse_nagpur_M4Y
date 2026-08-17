import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { wardsAPI, riskAPI, interventionsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { RiskBadge, StatusBadge, PriorityBadge } from '../components/common/Badge';
import RiskScoreRadar from '../components/ai/RiskScoreRadar';
import BedCapacityMeter from '../components/charts/BedCapacityMeter';
import AIPlanModal from '../components/ai/AIPlanModal';
import {
  ShieldAlert,
  Activity,
  Hospital,
  ClipboardList,
  Sparkles,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { formatNumber, DISEASE_COLORS, DISEASE_ICONS } from '../utils/helpers';

export default function WardDetailPage() {
  const { id } = useParams();
  const [ward, setWard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);
  const [interventions, setInterventions] = useState([]);

  useEffect(() => {
    const loadWardData = async () => {
      try {
        setLoading(true);
        const [wardData, , intData] = await Promise.all([
          wardsAPI.getById(id),
          wardsAPI.getAnalytics(id),
          interventionsAPI.getAll({ wardId: id })
        ]);
        setWard(wardData);
        setInterventions(intData || wardData?.interventions || []);
      } catch (err) {
        console.error('Failed to fetch ward detail:', err);
      } finally {
        setLoading(false);
      }
    };
    loadWardData();
  }, [id]);

  const handleTaskToggle = async (interventionId, taskIndex, currentStatus) => {
    try {
      await interventionsAPI.updateTask(interventionId, taskIndex, !currentStatus);
      // update local state
      setInterventions(prev =>
        prev.map(item => {
          if (item._id === interventionId && item.tasks) {
            const updated = [...item.tasks];
            updated[taskIndex] = { ...updated[taskIndex], completed: !currentStatus };
            return { ...item, tasks: updated };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleGenerateAI = async () => {
    try {
      const plan = await riskAPI.getAIPlan({
        wardName: ward?.name || 'Sakkardara',
        disease: 'Dengue',
        currentCases: ward?.activeAlert?.currentCases || 49,
        previousCases: ward?.activeAlert?.previousCases || 31,
        growthPercent: ward?.activeAlert?.growthPercent || 58,
        riskScore: ward?.currentRiskScore || 87,
        nearbyHighRiskWards: ward?.neighbors?.filter(n => n.currentRiskLevel === 'HIGH' || n.currentRiskLevel === 'CRITICAL').length || 2,
        facilityPressure: true
      });
      setAiPlan(plan);
      setAiModalOpen(true);
    } catch (err) {
      console.error('Error generating AI plan:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner message={`Loading Epidemiological Dossier for Ward ${id}...`} fullPage />;
  }

  if (!ward) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-lg font-bold text-white">Ward {id} Not Found</h3>
        <Link to="/wards" className="btn-primary inline-flex items-center gap-2 text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Ward List
        </Link>
      </div>
    );
  }

  const weeklyTotals = ward.weeklyTotals || [23, 34, 52, 79];
  const latestWeekTotal = weeklyTotals[weeklyTotals.length - 1];
  const prevWeekTotal = weeklyTotals[weeklyTotals.length - 2];
  const weekSurgePercent = Math.round(((latestWeekTotal - prevWeekTotal) / prevWeekTotal) * 100) || 52;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/wards"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Wards</span>
        </Link>

        <button
          onClick={handleGenerateAI}
          className="btn-primary flex items-center gap-2 text-xs bg-gradient-to-r from-primary-600 to-indigo-600 shadow-lg shadow-primary-500/20"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Generate PulseAI Response Protocol</span>
        </button>
      </div>

      {/* Ward Header Banner */}
      <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-surface-700 text-gray-300 border border-surface-600">
                {ward.wardId}
              </span>
              <span className="text-xs font-semibold text-gray-400">
                {ward.zone} Zone • Nagpur Municipal Corporation
              </span>
              <RiskBadge level={ward.currentRiskLevel} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {ward.name} Ward Dossier
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-4 flex-wrap">
              <span>👥 Population: <strong className="text-gray-200">{formatNumber(ward.population)}</strong></span>
              <span>📍 Centroid: <strong className="text-gray-200 font-mono">{ward.centroid?.lat?.toFixed(4)}, {ward.centroid?.lng?.toFixed(4)}</strong></span>
              <span>⚠️ Weekly Surge: <strong className="text-red-400">+{weekSurgePercent}%</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface-700/60 p-4 rounded-xl border border-surface-600">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Current Risk Score</span>
              <span className="text-3xl font-black text-white font-mono">
                {ward.currentRiskScore}
                <span className="text-sm font-normal text-gray-400">/100</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Alert Notification Card if any */}
      {ward.activeAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600/20 via-surface-800 to-amber-600/20 border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-400 uppercase">Active Outbreak Alert</span>
                <RiskBadge level={ward.activeAlert.riskLevel} size="xs" />
                <StatusBadge status={ward.activeAlert.status} size="xs" />
              </div>
              <p className="text-xs text-gray-200 font-medium mt-1 leading-relaxed">
                {ward.activeAlert.reason || `Severe ${ward.activeAlert.disease} surge in ${ward.name}. Immediate containment activated.`}
              </p>
            </div>
          </div>

          <Link
            to={`/alerts/${ward.activeAlert._id || 'a1'}`}
            className="btn-primary text-xs whitespace-nowrap bg-red-600 hover:bg-red-700 self-start sm:self-center"
          >
            Investigate Alert →
          </Link>
        </div>
      )}

      {/* Grid: 4-Factor Radar & 4-Week Disease Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 4-Factor Outbreak Breakdown */}
        <RiskScoreRadar
          score={ward.currentRiskScore}
          level={ward.currentRiskLevel}
          breakdown={ward.activeAlert?.riskBreakdown || { caseGrowth: 92, caseDensity: 76, historicalPattern: 84, neighborRisk: 72 }}
          growthPercent={ward.activeAlert?.growthPercent || weekSurgePercent}
        />

        {/* Right: 4-Week Disease Trajectory Table/Breakdown */}
        <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-700 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                4-Week Pathogen Evolution
              </h3>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Week 1 → Week 4</span>
          </div>

          <div className="space-y-3">
            {Object.entries(ward.diseaseWeekly || {}).map(([disease, weeklyCases]) => {
              const icon = DISEASE_ICONS[disease] || '🔬';
              const color = DISEASE_COLORS[disease] || '#3b82f6';
              const currentCases = weeklyCases[weeklyCases.length - 1];
              const prevCases = weeklyCases[weeklyCases.length - 2];
              const diff = currentCases - prevCases;

              return (
                <div key={disease} className="p-3 rounded-xl bg-surface-700/40 border border-surface-600/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-white">
                      <span>{icon}</span>
                      {disease}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-extrabold text-sm text-white">{currentCases} cases</span>
                      {diff > 0 && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded">
                          +{diff}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4-Week Sparkline Bars */}
                  <div className="grid grid-cols-4 gap-1.5 items-end h-8 pt-1">
                    {weeklyCases.map((c, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                        <div
                          className="w-full rounded-sm transition-all duration-300"
                          style={{
                            height: `${Math.min(100, Math.max(15, (c / (Math.max(...weeklyCases) || 1)) * 100))}%`,
                            backgroundColor: color,
                            opacity: idx === 3 ? 1 : 0.4 + idx * 0.2
                          }}
                        />
                        <span className="text-[9px] font-mono text-gray-400">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Neighbor Wards Contagion & Local Healthcare Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Neighbor Wards Contagion Risk */}
        <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-700 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Neighboring Wards Contagion Matrix
              </h3>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Adjacent Borders</span>
          </div>

          <div className="space-y-2.5">
            {(ward.neighbors || []).map((neighbor) => (
              <Link
                key={neighbor.wardId}
                to={`/wards/${neighbor.wardId}`}
                className="group flex items-center justify-between p-3 rounded-xl bg-surface-700/40 hover:bg-surface-700 border border-surface-600 hover:border-primary-500/40 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-gray-400 font-bold">{neighbor.wardId}</span>
                  <span className="font-bold text-white group-hover:text-primary-400">{neighbor.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-gray-300">{neighbor.currentRiskScore}/100</span>
                  <RiskBadge level={neighbor.currentRiskLevel} size="xs" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Local Healthcare Capacity */}
        <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-700 pb-3">
            <div className="flex items-center gap-2">
              <Hospital className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Local Primary Health Centers & Capacity
              </h3>
            </div>
            <Link to="/facilities" className="text-xs font-semibold text-primary-400 hover:text-primary-300">
              City Facilities →
            </Link>
          </div>

          <div className="space-y-3">
            {(ward.facilities || []).map((fac, idx) => (
              <BedCapacityMeter
                key={idx}
                title={fac.name}
                type={fac.type}
                beds={fac.beds}
                availableBeds={fac.availableBeds}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Ward Active Containment Interventions Checklist */}
      <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-700 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Municipal Containment Operations
            </h3>
          </div>
          <Link to="/interventions" className="text-xs font-semibold text-primary-400 hover:text-primary-300">
            Manage All Interventions →
          </Link>
        </div>

        {interventions.length > 0 ? (
          <div className="space-y-4">
            {interventions.map((intv) => (
              <div
                key={intv._id}
                className="p-4 rounded-xl bg-surface-700/40 border border-surface-600 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{intv.title}</h4>
                    <p className="text-xs text-gray-400">
                      Assigned Team: <strong className="text-gray-200">{intv.assignedTeam}</strong> • Disease: <strong className="text-primary-400">{intv.disease}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={intv.priority} size="xs" />
                    <StatusBadge status={intv.status} size="xs" />
                  </div>
                </div>

                {/* Tasks Checklist */}
                <div className="space-y-2 pt-2 border-t border-surface-700">
                  {(intv.tasks || []).map((task, taskIdx) => (
                    <label
                      key={taskIdx}
                      className="flex items-center gap-3 p-2 rounded-lg bg-surface-800/60 hover:bg-surface-800 border border-surface-700/60 cursor-pointer transition-colors text-xs text-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleTaskToggle(intv._id, taskIdx, task.completed)}
                        className="rounded bg-surface-700 border-surface-500 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <span className={task.completed ? 'line-through text-gray-400' : 'font-medium'}>
                        {task.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-gray-400">
            No active field interventions logged for {ward.name}.
          </div>
        )}
      </div>

      {/* AI Plan Modal */}
      <AIPlanModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        plan={aiPlan}
        wardId={ward.wardId}
        wardName={ward.name}
        disease="Dengue"
        onInterventionCreated={() => {
          interventionsAPI.getAll({ wardId: id }).then(setInterventions);
        }}
      />
    </div>
  );
}

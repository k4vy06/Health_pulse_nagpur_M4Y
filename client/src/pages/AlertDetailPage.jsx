import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { alertsAPI, riskAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import RiskScoreRadar from '../components/ai/RiskScoreRadar';
import AIPlanModal from '../components/ai/AIPlanModal';
import {
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/helpers';

export default function AlertDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiPlan, setAiPlan] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    const fetchAlertDetail = async () => {
      try {
        setLoading(true);
        const alertData = await alertsAPI.getById(id);
        setAlert(alertData);

        if (alertData) {
          const plan = await riskAPI.getAIPlan({
            wardName: alertData.wardName || 'Sakkardara',
            disease: alertData.disease || 'Dengue',
            currentCases: alertData.currentCases || 49,
            previousCases: alertData.previousCases || 31,
            growthPercent: alertData.growthPercent || 58,
            riskScore: alertData.riskScore || 87,
            nearbyHighRiskWards: 2,
            facilityPressure: true
          });
          setAiPlan(plan);
        }
      } catch (err) {
        console.error('Failed to load alert details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlertDetail();
  }, [id]);

  const handleAcknowledge = async () => {
    try {
      const updated = await alertsAPI.acknowledge(id, { acknowledgedBy: user?.name || 'Dr. Priya Sharma' });
      setAlert(updated);
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleResolve = async () => {
    try {
      const updated = await alertsAPI.resolve(id);
      setAlert(updated);
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving Epidemiological Outbreak Alert..." fullPage />;
  }

  if (!alert) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-lg font-bold text-white">Alert Not Found</h3>
        <Link to="/alerts" className="btn-primary inline-flex items-center gap-2 text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Alerts List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/alerts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Alerts</span>
        </Link>

        <div className="flex items-center gap-2">
          {alert.status === 'ACTIVE' && (
            <button
              onClick={handleAcknowledge}
              className="btn-primary text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              Acknowledge Outbreak
            </button>
          )}

          {alert.status === 'ACKNOWLEDGED' && (
            <button
              onClick={handleResolve}
              className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Mark Outbreak Resolved
            </button>
          )}

          <button
            onClick={() => setAiModalOpen(true)}
            className="btn-primary text-xs bg-gradient-to-r from-primary-600 to-indigo-600 flex items-center gap-1.5 shadow-lg shadow-primary-500/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Deploy Containment Protocol</span>
          </button>
        </div>
      </div>

      {/* Main Alert Banner */}
      <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-surface-700 text-gray-300 border border-surface-600">
                {alert.wardId || 'W01'}
              </span>
              <RiskBadge level={alert.riskLevel} size="sm" />
              <StatusBadge status={alert.status} size="sm" />
              <span className="text-xs text-gray-400">
                Triggered {formatRelativeTime(alert.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {alert.disease} Outbreak Surge • {alert.wardName || 'Ward'}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed max-w-3xl">
              {alert.reason}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface-700/60 p-4 rounded-xl border border-surface-600 flex-shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Risk Score</span>
              <span className="text-3xl font-black text-white font-mono">
                {alert.riskScore}
                <span className="text-sm font-normal text-gray-400">/100</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Caseload Stat Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-surface-700">
          <div className="p-3 rounded-xl bg-surface-700/40 border border-surface-600/70">
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Current Cases (7d)</span>
            <span className="text-xl font-mono font-extrabold text-white">{alert.currentCases || 49}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-700/40 border border-surface-600/70">
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Previous Week</span>
            <span className="text-xl font-mono font-extrabold text-gray-300">{alert.previousCases || 31}</span>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-[10px] uppercase text-red-400 font-bold block">Growth Velocity</span>
            <span className="text-xl font-mono font-extrabold text-red-400">+{alert.growthPercent || 58}%</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-700/40 border border-surface-600/70">
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Historical Baseline</span>
            <span className="text-xl font-mono font-extrabold text-gray-300">12 cases/wk</span>
          </div>
        </div>
      </div>

      {/* Grid: 4-Factor Radar & PulseAI Containment Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4-Factor Outbreak Breakdown */}
        <RiskScoreRadar
          score={alert.riskScore}
          level={alert.riskLevel}
          breakdown={alert.riskBreakdown || { caseGrowth: 92, caseDensity: 76, historicalPattern: 84, neighborRisk: 72 }}
          growthPercent={alert.growthPercent || 58}
        />

        {/* PulseAI Outbreak Response Plan Card */}
        <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-surface-700 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Automated PulseAI Containment Plan
                </h3>
              </div>
              <span className="text-xs font-bold text-red-400 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                {aiPlan?.priority || 'URGENT'}
              </span>
            </div>

            {aiPlan ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-surface-700/50 border border-surface-600 text-xs text-gray-200">
                  <strong>Epidemic Summary:</strong> {aiPlan.summary}
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block">
                    Immediate Containment Actions (0-24h):
                  </span>
                  {(aiPlan.recommendedActions || []).slice(0, 3).map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                Generating PulseAI response protocol...
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-surface-700 flex items-center justify-between gap-3">
            <Link
              to={`/wards/${alert.wardId || 'W01'}`}
              className="text-xs font-semibold text-primary-400 hover:text-primary-300"
            >
              View Ward GIS Dossier →
            </Link>

            <button
              onClick={() => setAiModalOpen(true)}
              className="btn-primary text-xs py-2 flex items-center gap-1.5"
            >
              <span>Review & Deploy Plan</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Plan Modal */}
      <AIPlanModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        plan={aiPlan}
        wardId={alert.wardId}
        wardName={alert.wardName}
        disease={alert.disease}
        onInterventionCreated={() => {
          alertsAPI.getById(id).then(setAlert);
        }}
      />
    </div>
  );
}

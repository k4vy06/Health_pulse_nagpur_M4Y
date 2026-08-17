import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Sparkles, CheckCircle2, ShieldAlert, Users, Activity, PlusCircle, Check, Printer } from 'lucide-react';
import { PriorityBadge, RiskBadge } from '../common/Badge';
import { interventionsAPI } from '../../services/api';

export default function AIPlanModal({
  isOpen,
  onClose,
  plan,
  wardId,
  wardName,
  disease,
  onInterventionCreated
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  if (!plan) return null;

  const handleCreateIntervention = async () => {
    try {
      setIsCreating(true);
      const tasks = (plan.recommendedActions || []).map(action => ({
        label: action,
        completed: false
      }));

      await interventionsAPI.create({
        wardId: wardId || 'W01',
        wardName: wardName || plan.wardName || 'Sakkardara',
        disease: disease || plan.disease || 'Dengue',
        title: `PulseAI Response: ${disease || plan.disease || 'Dengue'} Containment`,
        priority: plan.priority || 'URGENT',
        assignedTeam: disease === 'Dengue' || disease === 'Malaria' 
          ? 'Vector Control Rapid Response Team' 
          : 'Sanitation & Health Surveillance Cell',
        tasks: tasks.length > 0 ? tasks : [
          { label: 'Field inspection of breeding/source zones', completed: false },
          { label: 'Immediate chemical/fogging containment', completed: false },
          { label: 'Community advisory distribution', completed: false },
          { label: 'Fever surveillance follow-up at PHC', completed: false }
        ],
        notes: plan.priorityReasoning || 'Generated via PulseAI Outbreak Response Engine'
      });

      setCreatedSuccess(true);
      if (onInterventionCreated) onInterventionCreated();
      setTimeout(() => {
        setCreatedSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to create intervention:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span>PulseAI Outbreak Response Protocol</span>
        </div>
      }
      subtitle={`AI-assisted epidemic control protocol for ${wardName || plan.wardName || 'Ward'} • ${disease || plan.disease || 'Pathogen'}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 text-gray-200">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-xl bg-surface-700/60 border border-surface-600 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-gray-400">Response Priority:</span>
              <PriorityBadge priority={plan.priority || 'URGENT'} size="md" />
              {plan.riskLevel && <RiskBadge level={plan.riskLevel} size="md" />}
            </div>
            <span className="text-xs font-mono text-gray-400 bg-surface-800 px-2.5 py-1 rounded-md border border-surface-600">
              Engine: {plan.generatedBy || 'PulseAI GenAI'}
            </span>
          </div>

          {plan.priorityReasoning && (
            <p className="text-xs text-gray-300 italic border-l-2 border-primary-500 pl-3">
              "{plan.priorityReasoning}"
            </p>
          )}
        </div>

        {/* Key Epidemiological Insights */}
        {plan.keyInsights && plan.keyInsights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Epidemiological Risk Insights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {plan.keyInsights.map((insight, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-surface-700/40 border border-surface-600/70 text-xs text-gray-200 leading-relaxed">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Recommended Containment Actions */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            Mandated Containment Operations (0 - 48 Hours)
          </h4>
          <div className="space-y-2">
            {(plan.recommendedActions || []).map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-surface-700/50 border border-surface-600 text-xs text-gray-100"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 font-bold flex items-center justify-center text-[11px]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Community & Monitoring Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Community Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Community & ASHA Mobilization
            </h4>
            <div className="p-3.5 rounded-xl bg-surface-700/40 border border-surface-600/80 space-y-2">
              {(plan.communityActions || []).map((ca, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{ca}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Surveillance & Monitoring */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Surveillance Protocol
            </h4>
            <div className="p-3.5 rounded-xl bg-surface-700/40 border border-surface-600/80 space-y-2">
              {(plan.monitoringPlan || []).map((mp, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{mp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-[11px] text-gray-400 border-t border-surface-700 pt-3">
          ⚕️ <em>{plan.disclaimer || 'This is AI-assisted decision support. All interventions must be validated by qualified public health officers.'}</em>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="btn-ghost flex items-center gap-2 text-xs w-full sm:w-auto justify-center"
          >
            <Printer className="w-4 h-4" />
            Print / Export Brief
          </button>

          <button
            onClick={handleCreateIntervention}
            disabled={isCreating || createdSuccess}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
              createdSuccess
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white shadow-primary-500/20'
            }`}
          >
            {createdSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Intervention Dispatched to Teams!
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                {isCreating ? 'Deploying...' : 'Deploy as Official Intervention'}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

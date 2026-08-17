import React, { useState, useEffect } from 'react';
import { riskAPI, wardsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import OutbreakSimChart from '../components/charts/OutbreakSimChart';
import RiskScoreRadar from '../components/ai/RiskScoreRadar';
import AIPlanModal from '../components/ai/AIPlanModal';
import {
  Sparkles,
  Sliders,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { formatNumber } from '../utils/helpers';

export default function SimulatorPage() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulator Param State
  const [currentCases, setCurrentCases] = useState(49);
  const [growthRate, setGrowthRate] = useState(58);
  const [simDays, setSimDays] = useState(30);
  const [bedCapacity, setBedCapacity] = useState(120);
  const [simData, setSimData] = useState({ withoutIntervention: [], withIntervention: [] });

  // Risk Assessment Generator State
  const [selectedWardId, setSelectedWardId] = useState('W01');
  const [selectedDisease, setSelectedDisease] = useState('Dengue');
  const [inputCurrent, setInputCurrent] = useState(49);
  const [inputPrevious, setInputPrevious] = useState(31);
  const [analyzingRisk, setAnalyzingRisk] = useState(false);
  const [riskResult, setRiskResult] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const runSimulation = async (cases, rate, days) => {
    try {
      const res = await riskAPI.getSimulation({
        currentCases: cases,
        growthRate: rate,
        days: days
      });
      setSimData(res);
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const wardsData = await wardsAPI.getAll();
        setWards(wardsData || []);
        await runSimulation(49, 58, 30);
      } catch (err) {
        console.error('Simulator init error:', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleSliderChange = (cases, rate, days) => {
    setCurrentCases(cases);
    setGrowthRate(rate);
    setSimDays(days);
    runSimulation(cases, rate, days);
  };

  const handleRunRiskAnalysis = async (e) => {
    e.preventDefault();
    try {
      setAnalyzingRisk(true);
      const selWard = wards.find((w) => w.wardId === selectedWardId);
      const analysis = await riskAPI.analyze({
        wardId: selectedWardId,
        disease: selectedDisease,
        currentCases: parseInt(inputCurrent),
        previousCases: parseInt(inputPrevious)
      });
      setRiskResult(analysis);

      // Generate AI response plan
      const plan = await riskAPI.getAIPlan({
        wardName: selWard?.name || 'Sakkardara',
        disease: selectedDisease,
        currentCases: parseInt(inputCurrent),
        previousCases: parseInt(inputPrevious),
        growthPercent: analysis.growthPercent,
        riskScore: analysis.score,
        nearbyHighRiskWards: 2,
        facilityPressure: true
      });
      setAiPlan(plan);
    } catch (err) {
      console.error('Error running risk analysis:', err);
    } finally {
      setAnalyzingRisk(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Initializing PulseAI Outbreak Simulator..." fullPage />;
  }

  const withoutPeak = simData?.withoutIntervention?.slice(-1)[0]?.cases || 0;
  const withPeak = simData?.withIntervention?.slice(-1)[0]?.cases || 0;
  const casesPrevented = Math.max(0, withoutPeak - withPeak);
  const percentAverted = withoutPeak > 0 ? Math.round((casesPrevented / withoutPeak) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              PulseAI Predictive Outbreak Simulator
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              SEIR / Transmission Model
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Simulate epidemic trajectory curves, measure the impact of NMC containment interventions, and evaluate hospital capacity thresholds.
          </p>
        </div>
      </div>

      {/* SECTION 1: Interactive Outbreak Curve Simulator */}
      <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-surface-700 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Outbreak Trajectory & Flattening Curve Simulation
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400">Interactive Model</span>
        </div>

        {/* Sliders Control Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 bg-surface-700/40 p-4 rounded-xl border border-surface-600/70">
          {/* Current Weekly Cases */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-gray-300">Initial Active Cases:</span>
              <span className="font-mono font-bold text-white">{currentCases} cases</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={currentCases}
              onChange={(e) => handleSliderChange(parseInt(e.target.value), growthRate, simDays)}
              className="w-full h-1.5 bg-surface-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>10</span>
              <span>100</span>
              <span>200</span>
            </div>
          </div>

          {/* Weekly Growth Rate % */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-gray-300">Weekly Growth Rate:</span>
              <span className="font-mono font-bold text-red-400">+{growthRate}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={growthRate}
              onChange={(e) => handleSliderChange(currentCases, parseInt(e.target.value), simDays)}
              className="w-full h-1.5 bg-surface-600 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>+10%</span>
              <span>+75%</span>
              <span>+150%</span>
            </div>
          </div>

          {/* Simulation Horizon */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-gray-300">Projection Horizon:</span>
              <span className="font-mono font-bold text-cyan-400">{simDays} Days</span>
            </div>
            <input
              type="range"
              min="14"
              max="60"
              step="7"
              value={simDays}
              onChange={(e) => handleSliderChange(currentCases, growthRate, parseInt(e.target.value))}
              className="w-full h-1.5 bg-surface-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>14d</span>
              <span>30d</span>
              <span>60d</span>
            </div>
          </div>

          {/* Hospital Bed Surge Capacity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-gray-300">Ward Hospital Bed Limit:</span>
              <span className="font-mono font-bold text-purple-400">{bedCapacity} Beds</span>
            </div>
            <input
              type="range"
              min="40"
              max="300"
              step="10"
              value={bedCapacity}
              onChange={(e) => setBedCapacity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-surface-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>40</span>
              <span>150</span>
              <span>300</span>
            </div>
          </div>
        </div>

        {/* Projection KPI Summary Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-[10px] font-bold text-red-400 uppercase block">
              Projected Peak (No Action)
            </span>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">
              {formatNumber(withoutPeak)} Cases
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {withoutPeak > bedCapacity ? '⚠️ Exceeds healthcare bed capacity threshold' : 'Within bed capacity'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">
              Peak with PulseAI Intervention
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {formatNumber(withPeak)} Cases
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              ✅ Flattened curve within manageable limits
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <span className="text-[10px] font-bold text-cyan-400 uppercase block">
              Estimated Infections Prevented
            </span>
            <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
              +{formatNumber(casesPrevented)} ({percentAverted}%)
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Caseload reduction through rapid containment
            </p>
          </div>
        </div>

        {/* Outbreak Simulation Chart */}
        <div className="pt-2">
          <OutbreakSimChart
            withoutIntervention={simData?.withoutIntervention}
            withIntervention={simData?.withIntervention}
            capacityThreshold={bedCapacity}
            height={360}
          />
        </div>
      </div>

      {/* SECTION 2: PulseAI Risk Scoring & On-Demand Action Protocol Generator */}
      <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-surface-700 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              PulseAI On-Demand Ward Outbreak Risk Assessment
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400">4-Factor Engine</span>
        </div>

        {/* Input Parameters Form */}
        <form onSubmit={handleRunRiskAnalysis} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Target Ward</label>
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              className="w-full bg-surface-700 border border-surface-600 rounded-xl p-2.5 text-xs text-white"
            >
              {wards.map((w) => (
                <option key={w.wardId} value={w.wardId}>
                  {w.wardId} - {w.name} ({w.zone} Zone)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Pathogen</label>
            <select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full bg-surface-700 border border-surface-600 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="Dengue">Dengue</option>
              <option value="Malaria">Malaria</option>
              <option value="Chikungunya">Chikungunya</option>
              <option value="Typhoid">Typhoid</option>
              <option value="Influenza">Influenza</option>
              <option value="Diarrheal Disease">Diarrheal Disease</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Current Week Cases</label>
            <input
              type="number"
              min="1"
              required
              value={inputCurrent}
              onChange={(e) => setInputCurrent(e.target.value)}
              className="w-full bg-surface-700 border border-surface-600 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Previous Week Cases</label>
            <input
              type="number"
              min="0"
              required
              value={inputPrevious}
              onChange={(e) => setInputPrevious(e.target.value)}
              className="w-full bg-surface-700 border border-surface-600 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={analyzingRisk}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-primary-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{analyzingRisk ? 'Analyzing...' : 'Run PulseAI'}</span>
            </button>
          </div>
        </form>

        {/* Results Display */}
        {riskResult && (
          <div className="pt-4 border-t border-surface-700/80 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Risk Breakdown Radar */}
            <RiskScoreRadar
              score={riskResult.score}
              level={riskResult.level}
              breakdown={riskResult.breakdown}
              growthPercent={riskResult.growthPercent}
            />

            {/* Generated AI Plan Summary Card */}
            {aiPlan && (
              <div className="bg-surface-700/50 border border-surface-600 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-surface-600 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase block">Generated Action Protocol</span>
                      <h4 className="text-base font-bold text-white">{aiPlan.summary}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-800 text-primary-400 border border-surface-600">
                      {aiPlan.priority}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase text-red-400 block">
                      Priority Immediate Tasks:
                    </span>
                    {(aiPlan.recommendedActions || []).slice(0, 3).map((act, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-400 flex-shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-600 flex justify-end">
                  <button
                    onClick={() => setAiModalOpen(true)}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <span>View & Deploy Full Protocol</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Plan Modal */}
      <AIPlanModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        plan={aiPlan}
        wardId={selectedWardId}
        wardName={wards.find((w) => w.wardId === selectedWardId)?.name}
        disease={selectedDisease}
      />
    </div>
  );
}

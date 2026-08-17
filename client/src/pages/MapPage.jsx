import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NagpurMap from '../components/map/NagpurMap';
import MapLegend from '../components/map/MapLegend';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { wardsAPI, facilitiesAPI, alertsAPI, riskAPI } from '../services/api';
import AIPlanModal from '../components/ai/AIPlanModal';
import {
  MapPin,
  Search,
  Filter,
  ShieldAlert,
  Building2,
  Hospital,
  ArrowRight,
  Sparkles,
  Layers,
  Users,
  Activity
} from 'lucide-react';
import { formatNumber } from '../utils/helpers';

export default function MapPage() {
  const [wards, setWards] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedWard, setSelectedWard] = useState(null);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showWardCentroids, setShowWardCentroids] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wardsData, facData] = await Promise.all([
          wardsAPI.getAll(),
          facilitiesAPI.getAll()
        ]);
        setWards(wardsData || []);
        setFacilities(facData || []);
        if (wardsData && wardsData.length > 0) {
          setSelectedWard(wardsData[0]); // Sakkardara default
        }
      } catch (err) {
        console.error('Error loading map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerateAI = async (ward) => {
    try {
      const plan = await riskAPI.getAIPlan({
        wardName: ward.name,
        disease: 'Dengue',
        currentCases: 49,
        previousCases: 31,
        growthPercent: 58,
        riskScore: ward.currentRiskScore || 80,
        nearbyHighRiskWards: 2,
        facilityPressure: true
      });
      setAiPlan(plan);
      setAiModalOpen(true);
    } catch (err) {
      console.error('AI plan generation error:', err);
    }
  };

  const zones = ['ALL', 'East', 'West', 'Central', 'North', 'South', 'Periphery'];
  const riskLevels = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

  const filteredWards = wards.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.wardId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'ALL' || w.zone === selectedZone;
    const matchesRisk = selectedRisk === 'ALL' || w.currentRiskLevel === selectedRisk;
    return matchesSearch && matchesZone && matchesRisk;
  });

  if (loading) {
    return <LoadingSpinner message="Rendering Nagpur Geospatial Outbreak GIS Layers..." fullPage />;
  }

  return (
    <div className="space-y-5">
      {/* Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Geospatial Epidemic Intelligence
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 border border-primary-500/30">
              GIS Matrix 22 Wards
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Real-time ward transmission hotspots, boundary contagion, and healthcare facility capacity across Nagpur.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ward by name or ID (e.g. Sakkardara, W01)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-700 border border-surface-600 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Zone Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Zone:</span>
          {zones.map((z) => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedZone === z
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:text-white'
              }`}
            >
              {z}
            </button>
          ))}
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Risk:</span>
          {riskLevels.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRisk(r)}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedRisk === r
                  ? 'bg-red-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Leaflet GIS Map */}
        <div className="lg:col-span-3 space-y-4">
          <NagpurMap
            wards={filteredWards}
            facilities={facilities}
            selectedWardId={selectedWard?.wardId}
            onSelectWard={(ward) => setSelectedWard(ward)}
            height="620px"
            showFacilities={showFacilities}
            showWardCentroids={showWardCentroids}
          />
        </div>

        {/* Right 1 Col: Selected Ward Inspector & Map Legend */}
        <div className="space-y-4 flex flex-col">
          {/* Selected Ward Inspection Card */}
          {selectedWard ? (
            <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-2 border-b border-surface-700 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-400 font-bold">{selectedWard.wardId}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-700 text-gray-300">
                      {selectedWard.zone} Zone
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedWard.name}</h3>
                </div>
                <RiskBadge level={selectedWard.currentRiskLevel} size="sm" />
              </div>

              {/* Risk Score Meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 uppercase font-semibold text-[10px]">Composite Outbreak Index</span>
                  <span className="font-mono font-extrabold text-sm text-white">
                    {selectedWard.currentRiskScore}/100
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedWard.currentRiskLevel === 'CRITICAL'
                        ? 'bg-red-500'
                        : selectedWard.currentRiskLevel === 'HIGH'
                        ? 'bg-orange-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${selectedWard.currentRiskScore}%` }}
                  />
                </div>
              </div>

              {/* Ward Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-surface-700/40 p-3 rounded-xl border border-surface-600/60">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase block">Population</span>
                  <span className="font-bold text-white">{formatNumber(selectedWard.population)}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase block">Surveillance</span>
                  <span className="font-semibold text-emerald-400">Active</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase block">Coordinates</span>
                  <span className="font-mono text-[11px] text-gray-300">
                    {selectedWard.centroid?.lat?.toFixed(3)}, {selectedWard.centroid?.lng?.toFixed(3)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase block">Primary Threat</span>
                  <span className="font-semibold text-red-400">Dengue / Vector</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Link
                  to={`/wards/${selectedWard.wardId}`}
                  className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Open Full Ward Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => handleGenerateAI(selectedWard)}
                  className="w-full py-2 text-xs font-bold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate PulseAI Plan</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-surface-800/80 border border-surface-600 text-center text-xs text-gray-400">
              Click any ward on the map to inspect telemetry
            </div>
          )}

          {/* Map Legend */}
          <MapLegend
            showFacilities={showFacilities}
            onToggleFacilities={setShowFacilities}
            showWardCentroids={showWardCentroids}
            onToggleWardCentroids={setShowWardCentroids}
          />
        </div>
      </div>

      {/* AI Plan Modal */}
      <AIPlanModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        plan={aiPlan}
        wardName={selectedWard?.name}
        disease="Dengue"
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { wardsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { RiskBadge } from '../components/common/Badge';
import {
  Building2,
  Search,
  Filter,
  ArrowUpDown,
  Users,
  ShieldAlert,
  ArrowRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { formatNumber } from '../utils/helpers';

export default function WardsPage() {
  const navigate = useNavigate();
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [sortBy, setSortBy] = useState('riskScore'); // 'riskScore', 'population', 'name'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const data = await wardsAPI.getAll();
        setWards(data || []);
      } catch (err) {
        console.error('Failed to load wards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWards();
  }, []);

  const zones = ['ALL', 'East', 'West', 'Central', 'North', 'South', 'Periphery'];
  const riskLevels = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

  const filteredWards = wards
    .filter((w) => {
      const matchesSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.wardId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZone = selectedZone === 'ALL' || w.zone === selectedZone;
      const matchesRisk = selectedRisk === 'ALL' || w.currentRiskLevel === selectedRisk;
      return matchesSearch && matchesZone && matchesRisk;
    })
    .sort((a, b) => {
      if (sortBy === 'riskScore') return (b.currentRiskScore || 0) - (a.currentRiskScore || 0);
      if (sortBy === 'population') return (b.population || 0) - (a.population || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  if (loading) {
    return <LoadingSpinner message="Loading Ward Surveillance Dossiers..." fullPage />;
  }

  const criticalCount = wards.filter(w => w.currentRiskLevel === 'CRITICAL').length;
  const highCount = wards.filter(w => w.currentRiskLevel === 'HIGH').length;
  const totalPop = wards.reduce((sum, w) => sum + (w.population || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Municipal Ward Surveillance
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 border border-primary-500/30">
              22 Wards
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Micro-level epidemiological monitoring, population vulnerability indices, and containment readiness across Nagpur.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-surface-800 border border-surface-700 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'table' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Total Wards</span>
            <div className="text-lg font-bold text-white">22</div>
          </div>
          <Building2 className="w-5 h-5 text-primary-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-red-400 uppercase">Critical Outbreaks</span>
            <div className="text-lg font-bold text-red-400">{criticalCount} Wards</div>
          </div>
          <ShieldAlert className="w-5 h-5 text-red-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-orange-400 uppercase">High Risk</span>
            <div className="text-lg font-bold text-orange-400">{highCount} Wards</div>
          </div>
          <ShieldAlert className="w-5 h-5 text-orange-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Population Monitored</span>
            <div className="text-lg font-bold text-white">{formatNumber(totalPop)}</div>
          </div>
          <Users className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      {/* Filters & Sorting Bar */}
      <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ward name (e.g. Sakkardara, Indora, W01)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-700 border border-surface-600 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Zone:</span>
          {zones.map((z) => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedZone === z
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:text-white'
              }`}
            >
              {z}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-surface-700 border border-surface-600 text-xs text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary-500"
          >
            <option value="riskScore">Highest Risk Score</option>
            <option value="population">Highest Population</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredWards.map((ward) => (
            <div
              key={ward.wardId}
              onClick={() => navigate(`/wards/${ward.wardId}`)}
              className="group bg-surface-800/90 hover:bg-surface-800 border border-surface-600/80 hover:border-primary-500/50 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-gray-400">{ward.wardId}</span>
                    <h3 className="text-base font-bold text-white group-hover:text-primary-400 transition-colors">
                      {ward.name}
                    </h3>
                  </div>
                  <RiskBadge level={ward.currentRiskLevel} size="xs" />
                </div>

                {/* Risk Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 text-[10px] uppercase font-semibold">Risk Index</span>
                    <span className="font-mono font-extrabold text-white">{ward.currentRiskScore}/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ward.currentRiskLevel === 'CRITICAL'
                          ? 'bg-red-500'
                          : ward.currentRiskLevel === 'HIGH'
                          ? 'bg-orange-500'
                          : ward.currentRiskLevel === 'MODERATE'
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${ward.currentRiskScore}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="pt-2 border-t border-surface-700/60 grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase block">Zone</span>
                    <span className="font-semibold">{ward.zone || 'Central'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase block">Population</span>
                    <span className="font-semibold">{formatNumber(ward.population)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2 flex items-center justify-between text-xs font-semibold text-primary-400 group-hover:text-primary-300">
                <span>View Ward Dossier</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-surface-800 border border-surface-600 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-700/60 text-gray-400 uppercase font-bold border-b border-surface-600">
                <tr>
                  <th className="py-3.5 px-4">Ward ID & Name</th>
                  <th className="py-3.5 px-4">Zone</th>
                  <th className="py-3.5 px-4">Population</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Threat Level</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/80">
                {filteredWards.map((ward) => (
                  <tr
                    key={ward.wardId}
                    onClick={() => navigate(`/wards/${ward.wardId}`)}
                    className="hover:bg-surface-700/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-gray-400 font-bold mr-2">{ward.wardId}</span>
                      <strong className="text-white font-bold">{ward.name}</strong>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-300">{ward.zone}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">{formatNumber(ward.population)}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              ward.currentRiskLevel === 'CRITICAL'
                                ? 'bg-red-500'
                                : ward.currentRiskLevel === 'HIGH'
                                ? 'bg-orange-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${ward.currentRiskScore}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-white">{ward.currentRiskScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={ward.currentRiskLevel} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/wards/${ward.wardId}`}
                        className="text-primary-400 hover:text-primary-300 font-semibold"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { analyticsAPI, dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DiseaseTrendChart from '../components/charts/DiseaseTrendChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Download,
  Calendar,
  ShieldAlert,
  Hospital,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { DISEASE_COLORS, formatNumber } from '../utils/helpers';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsAPI.getAll();
        setAnalytics(data);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating Epidemiological Surveillance Intelligence..." fullPage />;
  }

  const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#3b82f6', '#06b6d4'];

  const diseaseDistribution = [
    { name: 'Dengue', value: 487 },
    { name: 'Diarrheal Disease', value: 312 },
    { name: 'Malaria', value: 198 },
    { name: 'Influenza', value: 143 },
    { name: 'Typhoid', value: 97 },
    { name: 'Chikungunya', value: 47 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Epidemiological Intelligence & Macro Analytics
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 border border-primary-500/30">
              City Surveillance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Macro-level multi-pathogen longitudinal trends, municipal ward risk ranking, and epidemic intervention efficacy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="btn-ghost flex items-center gap-1.5 text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Surveillance Brief</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">30-Day City Cases</span>
            <div className="text-lg font-bold text-white">4,812</div>
          </div>
          <Activity className="w-5 h-5 text-primary-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-red-400 uppercase">Vector-Borne Share</span>
            <div className="text-lg font-bold text-red-400">58%</div>
          </div>
          <TrendingUp className="w-5 h-5 text-red-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-purple-400 uppercase">Water-Borne Share</span>
            <div className="text-lg font-bold text-purple-400">32%</div>
          </div>
          <ShieldAlert className="w-5 h-5 text-purple-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Avg Containment Speed</span>
            <div className="text-lg font-bold text-emerald-400">3.2 Days</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Main Longitudinal Trend Area Chart */}
      <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-surface-700 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              30-Day Multi-Pathogen Incidence Trajectory
            </h3>
            <p className="text-xs text-gray-400">Daily confirmed caseload across all 6 monitored pathogens</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-surface-700 px-2.5 py-1 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-primary-400" />
            <span>Last 30 Days</span>
          </div>
        </div>

        <DiseaseTrendChart
          data={analytics?.diseaseTrend}
          diseases={['Dengue', 'Malaria', 'Typhoid', 'Diarrheal Disease']}
          height={320}
        />
      </div>

      {/* Grid: Top 10 Wards Risk Ranking & Pathogen Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Wards Risk Bar Chart */}
        <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-surface-700 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Top 10 Wards by Outbreak Risk Index
            </h3>
            <span className="text-[10px] font-mono text-gray-400">Ranked Score</span>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.wardComparison || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151c2e', borderColor: '#1e2a45', borderRadius: '8px' }}
                />
                <Bar
                  dataKey="riskScore"
                  name="Risk Score"
                  fill="#ef4444"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pathogen Proportions Doughnut / Pie Chart */}
        <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-surface-700 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Pathogen Caseload Share
            </h3>
            <span className="text-[10px] font-mono text-gray-400">Proportions</span>
          </div>

          <div style={{ width: '100%', height: 280 }} className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diseaseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {diseaseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#151c2e', borderColor: '#1e2a45', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

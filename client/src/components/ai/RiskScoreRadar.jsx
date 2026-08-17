import React from 'react';
import { ShieldAlert, TrendingUp, Users, History, Share2 } from 'lucide-react';
import { getRiskColor } from '../../utils/helpers';
import { RiskBadge } from '../common/Badge';

export default function RiskScoreRadar({
  score = 87,
  level = 'CRITICAL',
  breakdown = { caseGrowth: 92, caseDensity: 76, historicalPattern: 84, neighborRisk: 72 },
  growthPercent = 58
}) {
  const factors = [
    {
      name: 'Case Growth Rate',
      weight: '40% Weight',
      score: breakdown?.caseGrowth || 90,
      icon: TrendingUp,
      desc: `${growthPercent > 0 ? '+' : ''}${growthPercent}% surge over past 7-day period`,
      color: 'bg-red-500'
    },
    {
      name: 'Case Density',
      weight: '25% Weight',
      score: breakdown?.caseDensity || 75,
      icon: Users,
      desc: 'Active disease cases normalized per 10,000 ward population',
      color: 'bg-orange-500'
    },
    {
      name: 'Historical Baseline Deviation',
      weight: '20% Weight',
      score: breakdown?.historicalPattern || 80,
      icon: History,
      desc: 'Deviation compared to 5-year seasonal average baseline',
      color: 'bg-amber-500'
    },
    {
      name: 'Neighbor Ward Contagion',
      weight: '15% Weight',
      score: breakdown?.neighborRisk || 70,
      icon: Share2,
      desc: 'Spatial epidemiological transmission from adjacent high-risk wards',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-5 space-y-5">
      {/* Overall Score Header */}
      <div className="flex items-center justify-between gap-4 border-b border-surface-700 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Composite Outbreak Index
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {score}
              <span className="text-sm font-normal text-gray-400">/100</span>
            </span>
            <RiskBadge level={level} size="md" />
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-gray-400 block">Calculation Model:</span>
          <span className="text-xs font-mono font-semibold text-primary-400">PulseRisk Multi-Factor</span>
        </div>
      </div>

      {/* 4 Factor Breakdown Bars */}
      <div className="space-y-3.5">
        {factors.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-semibold text-white">{f.name}</span>
                  <span className="text-[10px] text-gray-500 font-mono">({f.weight})</span>
                </div>
                <span className="font-mono font-bold text-gray-200">{f.score}/100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-surface-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${f.color}`}
                  style={{ width: `${Math.min(100, Math.max(5, f.score))}%` }}
                />
              </div>

              <div className="text-[11px] text-gray-400">{f.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

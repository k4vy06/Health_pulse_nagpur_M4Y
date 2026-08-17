import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber } from '../../utils/helpers';

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel = 'vs last week',
  icon: Icon,
  color = 'primary',
  onClick,
  badge,
  className = ''
}) {
  const colorStyles = {
    primary: {
      border: 'hover:border-primary-500/40',
      iconBg: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
      glow: 'group-hover:shadow-primary-500/10'
    },
    red: {
      border: 'hover:border-red-500/40',
      iconBg: 'bg-red-500/10 text-red-400 border-red-500/20',
      glow: 'group-hover:shadow-red-500/10'
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:shadow-amber-500/10'
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:shadow-emerald-500/10'
    },
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'group-hover:shadow-purple-500/10'
    },
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'group-hover:shadow-cyan-500/10'
    }
  };

  const style = colorStyles[color] || colorStyles.primary;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-surface-800/90 backdrop-blur border border-surface-600/80 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${style.border} ${style.glow} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {title}
            </span>
            {badge && (
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-700 text-gray-300">
                {badge}
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
            {typeof value === 'number' ? formatNumber(value) : value}
            {subtitle && (
              <span className="text-xs font-normal text-gray-400">{subtitle}</span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border flex-shrink-0 ${style.iconBg} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-4 pt-3 border-t border-surface-700/60 flex items-center gap-2 text-xs">
          {trend > 0 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3.5 h-3.5" />
              +{trend}%
            </span>
          ) : trend < 0 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
              <TrendingDown className="w-3.5 h-3.5" />
              {trend}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-gray-400 bg-surface-700 px-1.5 py-0.5 rounded">
              <Minus className="w-3.5 h-3.5" />
              0%
            </span>
          )}
          <span className="text-gray-400">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

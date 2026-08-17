import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { DISEASE_COLORS } from '../../utils/helpers';

export default function DiseaseTrendChart({
  data = [],
  height = 320,
  diseases = ['Dengue', 'Malaria', 'Typhoid', 'Diarrheal Disease']
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-gray-500">
        No epidemiological trend data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[150px]">
          <div className="font-semibold text-gray-300 border-b border-surface-700 pb-1">
            {label}
          </div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">{entry.value} cases</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {diseases.map((d) => {
              const color = DISEASE_COLORS[d] || '#3b82f6';
              return (
                <linearGradient key={d} id={`grad-${d}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => {
              if (!val) return '';
              const parts = val.split('-');
              return parts.length === 3 ? `${parts[2]}/${parts[1]}` : val;
            }}
          />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
            iconType="circle"
          />
          {diseases.map((d) => {
            const color = DISEASE_COLORS[d] || '#3b82f6';
            return (
              <Area
                key={d}
                type="monotone"
                dataKey={d}
                name={d}
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#grad-${d})`}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

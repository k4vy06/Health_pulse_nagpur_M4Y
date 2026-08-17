import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { formatNumber } from '../../utils/helpers';

export default function OutbreakSimChart({
  withoutIntervention = [],
  withIntervention = [],
  capacityThreshold = 120,
  height = 340
}) {
  // Merge both arrays by day/label
  const chartData = withoutIntervention.map((item, idx) => {
    const withItem = withIntervention[idx] || {};
    return {
      day: item.label || `Day ${item.day}`,
      uncontrolled: item.cases,
      controlled: withItem.cases || item.cases,
      prevented: Math.max(0, item.cases - (withItem.cases || item.cases))
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const unctrl = payload.find(p => p.dataKey === 'uncontrolled')?.value || 0;
      const ctrl = payload.find(p => p.dataKey === 'controlled')?.value || 0;
      const prevented = Math.max(0, unctrl - ctrl);

      return (
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-3 shadow-2xl text-xs space-y-2 min-w-[200px]">
          <div className="font-bold text-white border-b border-surface-700 pb-1 flex justify-between">
            <span>{label}</span>
            <span className="text-primary-400 font-mono">Projection</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-red-400 font-medium">
              <span>Without Containment:</span>
              <span className="font-bold">{formatNumber(unctrl)} cases</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-medium">
              <span>With NMC Intervention:</span>
              <span className="font-bold">{formatNumber(ctrl)} cases</span>
            </div>
            <div className="flex justify-between text-cyan-300 font-bold pt-1 border-t border-surface-700">
              <span>Cases Averted:</span>
              <span>+{formatNumber(prevented)} prevented</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" vertical={false} />
          <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />

          {capacityThreshold && (
            <ReferenceLine
              y={capacityThreshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{
                value: `Ward Healthcare Surge Threshold (${capacityThreshold} beds)`,
                fill: '#f87171',
                fontSize: 10,
                position: 'top'
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="uncontrolled"
            name="Uncontrolled Outbreak (No Action)"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />

          <Line
            type="monotone"
            dataKey="controlled"
            name="With PulseAI Containment Protocol"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

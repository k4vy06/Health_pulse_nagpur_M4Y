import React from 'react';
import { Layers, Hospital, ShieldAlert, Circle } from 'lucide-react';

export default function MapLegend({
  showFacilities,
  onToggleFacilities,
  showWardCentroids,
  onToggleWardCentroids
}) {
  const riskLevels = [
    { label: 'Critical (81-100)', color: 'bg-red-500', count: '2 Wards' },
    { label: 'High (61-80)', color: 'bg-orange-500', count: '4 Wards' },
    { label: 'Moderate (31-60)', color: 'bg-amber-500', count: '6 Wards' },
    { label: 'Low (0-30)', color: 'bg-green-500', count: '10 Wards' },
  ];

  return (
    <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-4 space-y-4 shadow-xl">
      {/* Risk Color Legend */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-primary-400" />
          Outbreak Risk Thresholds
        </h4>
        <div className="space-y-2">
          {riskLevels.map((lvl) => (
            <div key={lvl.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${lvl.color} shadow-sm`}></span>
                <span className="text-gray-300 font-medium">{lvl.label}</span>
              </div>
              <span className="text-gray-500 font-mono text-[11px]">{lvl.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="pt-3 border-t border-surface-700 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary-400" />
          Map Layers
        </h4>

        <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer p-1.5 rounded-lg hover:bg-surface-700/50 transition-colors">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
            Ward Risk Hotspots
          </span>
          <input
            type="checkbox"
            checked={showWardCentroids}
            onChange={(e) => onToggleWardCentroids && onToggleWardCentroids(e.target.checked)}
            className="rounded bg-surface-700 border-surface-500 text-primary-500 focus:ring-0 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer p-1.5 rounded-lg hover:bg-surface-700/50 transition-colors">
          <span className="flex items-center gap-2">
            <span>🏥</span>
            Healthcare Facilities (PHC / CHC)
          </span>
          <input
            type="checkbox"
            checked={showFacilities}
            onChange={(e) => onToggleFacilities && onToggleFacilities(e.target.checked)}
            className="rounded bg-surface-700 border-surface-500 text-primary-500 focus:ring-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}

import React from 'react';
import { calculateBedOccupancy } from '../../utils/helpers';

export default function BedCapacityMeter({
  beds = 50,
  availableBeds = 12,
  title,
  type = 'PHC',
  showDetails = true,
  className = ''
}) {
  const occupancyPercent = calculateBedOccupancy(beds, availableBeds);
  const occupiedBeds = beds - availableBeds;

  const isCritical = occupancyPercent >= 90;
  const isPressure = occupancyPercent >= 75 && occupancyPercent < 90;

  const barColor = isCritical 
    ? 'bg-red-500' 
    : isPressure 
    ? 'bg-amber-500' 
    : 'bg-emerald-500';

  const statusText = isCritical
    ? 'Critical Pressure'
    : isPressure
    ? 'High Occupancy'
    : 'Normal Capacity';

  return (
    <div className={`p-4 rounded-xl bg-surface-700/50 border border-surface-600 space-y-2.5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          {title && <h5 className="text-xs font-bold text-white">{title}</h5>}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-surface-800 text-gray-400 border border-surface-600">
              {type}
            </span>
            <span className={`text-[10px] font-bold ${isCritical ? 'text-red-400' : isPressure ? 'text-amber-400' : 'text-emerald-400'}`}>
              {statusText}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-extrabold text-white font-mono">{occupancyPercent}%</span>
          <span className="text-[10px] text-gray-400 block">Occupancy</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-surface-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(2, occupancyPercent))}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
          <span>Occupied: <strong className="text-gray-200">{occupiedBeds}</strong></span>
          <span>Available: <strong className="text-emerald-400 font-bold">{availableBeds}</strong> / {beds}</span>
        </div>
      )}
    </div>
  );
}

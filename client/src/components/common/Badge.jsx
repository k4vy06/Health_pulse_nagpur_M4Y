import React from 'react';
import { RISK_COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../../utils/helpers';

export function RiskBadge({ level = 'LOW', size = 'sm', showDot = true, className = '' }) {
  const normalized = (level || 'LOW').toUpperCase();
  const style = RISK_COLORS[normalized] || RISK_COLORS.LOW;
  
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base font-semibold',
  };

  const dotColors = {
    LOW: 'bg-green-400 animate-pulse',
    MODERATE: 'bg-amber-400 animate-pulse',
    HIGH: 'bg-orange-400 animate-pulse',
    CRITICAL: 'bg-red-400 animate-ping',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size] || sizeClasses.sm} ${className}`}>
      {showDot && (
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[normalized] || 'bg-green-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${normalized === 'CRITICAL' ? 'bg-red-500' : normalized === 'HIGH' ? 'bg-orange-500' : normalized === 'MODERATE' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
        </span>
      )}
      {normalized}
    </span>
  );
}

export function StatusBadge({ status = 'ACTIVE', size = 'sm', className = '' }) {
  const normalized = (status || 'ACTIVE').toUpperCase();
  const colorClass = STATUS_COLORS[normalized] || 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${colorClass} ${sizeClasses[size] || sizeClasses.sm} ${className}`}>
      {normalized.replace('_', ' ')}
    </span>
  );
}

export function PriorityBadge({ priority = 'ROUTINE', size = 'sm', className = '' }) {
  const normalized = (priority || 'ROUTINE').toUpperCase();
  const colorClass = PRIORITY_COLORS[normalized] || 'text-blue-400 bg-blue-500/10 border-blue-500/30';

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-md border ${colorClass} ${sizeClasses[size] || sizeClasses.sm} ${className}`}>
      {normalized}
    </span>
  );
}

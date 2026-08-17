import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function EmptyState({
  icon: Icon = AlertCircle,
  title = 'No Data Found',
  description = 'No records match your active filters or selection.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-surface-800/40 border border-dashed border-surface-600/70 rounded-2xl ${className}`}>
      <div className="p-4 rounded-full bg-surface-700/60 text-gray-400 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-400 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary flex items-center gap-2 text-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

import React from 'react';
import { Activity } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading surveillance data...', fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin"></div>
        <Activity className="w-5 h-5 text-primary-400 absolute animate-pulse" />
      </div>
      <p className="text-xs font-medium text-gray-400 animate-pulse tracking-wide uppercase">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

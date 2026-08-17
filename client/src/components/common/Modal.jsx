import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  showClose = true
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-900/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full ${maxWidth} bg-surface-800 border border-surface-600 rounded-2xl shadow-2xl overflow-hidden z-10 animate-slide-up my-8`}>
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-surface-700/80 bg-surface-800/50">
            <div>
              {title && <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs sm:text-sm text-gray-400 mt-1">{subtitle}</p>}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-surface-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[calc(85vh-8rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

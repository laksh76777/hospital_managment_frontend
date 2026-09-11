import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Loader component for async operations and data fetching
 * @param {string} message - Optional loading message to display beneath or beside the spinner
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} fullScreen - Centers loader across viewport
 * @param {boolean} inline - Renders as compact inline flex
 * @param {string} className - Additional CSS classes
 */
export default function Loader({
  message = 'Loading data...',
  size = 'md',
  fullScreen = false,
  inline = false,
  className = '',
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-2 text-slate-500 text-xs font-medium ${className}`}>
        <Loader2 className={`${spinnerSize} animate-spin text-indigo-600 shrink-0`} />
        {message && <span>{message}</span>}
      </span>
    );
  }

  if (fullScreen) {
    return (
      <div
        id="global-fullscreen-loader"
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 transition-all"
      >
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center max-w-sm text-center">
          <Loader2 className={`${spinnerSize} animate-spin text-indigo-600 mb-3`} />
          <p className="text-sm font-semibold text-slate-800">{message}</p>
          <span className="text-xs text-slate-400 mt-1">Please wait a moment</span>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-12 text-center flex flex-col items-center justify-center ${className}`}
    >
      <Loader2 className={`${spinnerSize} animate-spin text-indigo-600 mb-3`} />
      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
      <span className="sr-only">{message}</span>
    </div>
  );
}

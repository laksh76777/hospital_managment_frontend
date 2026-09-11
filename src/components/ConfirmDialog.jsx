import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

/**
 * Custom ConfirmDialog component replacing browser window.confirm
 * Provides an accessible, styled modal for destructive or confirming operations.
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you wish to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false,
  onConfirm,
  onClose,
}) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 border-rose-100 text-rose-600',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus:ring-rose-500',
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-amber-50 border-amber-100 text-amber-600',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-xs focus:ring-amber-500',
    },
    primary: {
      icon: Info,
      iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
      confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs focus:ring-indigo-500',
    },
  };

  const currentVariant = variantConfig[variant] || variantConfig.danger;
  const Icon = currentVariant.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transform transition-all duration-200 p-6 space-y-5 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${currentVariant.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-900">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p id="confirm-dialog-description" className="text-xs text-slate-600 leading-relaxed">
          {message}
        </p>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentVariant.confirmBtn}`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{loading ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

/**
 * Reusable EmptyState component for empty lists, search results, and registries
 */
export default function EmptyState({
  icon: Icon = FileQuestion,
  title = 'No items found',
  description = 'There are no records matching your current selection.',
  actionText,
  actionLink,
  onAction,
  actionIcon: ActionIcon,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) {
  return (
    <div
      role="region"
      aria-label={title}
      className={`p-12 text-center max-w-md mx-auto flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-base font-bold text-slate-800 tracking-tight mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-6">
          {description}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && actionLink && (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-xs"
          >
            {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
            <span>{actionText}</span>
          </Link>
        )}

        {actionText && !actionLink && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
            <span>{actionText}</span>
          </button>
        )}

        {secondaryActionText && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            <span>{secondaryActionText}</span>
          </button>
        )}
      </div>
    </div>
  );
}

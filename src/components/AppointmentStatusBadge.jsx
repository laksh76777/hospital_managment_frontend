import React from 'react';
import { Clock, Check, CheckCircle2, XCircle } from 'lucide-react';

export const AppointmentStatusBadge = ({ status }) => {
  const normalized = (status || 'pending').toLowerCase();

  switch (normalized) {
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Check className="w-3 h-3 text-blue-600" />
          Confirmed
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Completed
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          Cancelled
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          Pending
        </span>
      );
  }
};

export default AppointmentStatusBadge;

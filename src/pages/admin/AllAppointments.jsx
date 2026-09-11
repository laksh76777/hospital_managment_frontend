import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllAppointments, updateAppointmentStatus } from '../../api/appointmentApi';
import AppointmentStatusBadge from '../../components/AppointmentStatusBadge';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { format, startOfDay, endOfDay, addDays } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Filter,
  Search,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  FileText,
  CalendarDays,
  Check,
  X,
  CheckCircle,
} from 'lucide-react';

const STATUSES = ['All', 'pending', 'confirmed', 'completed', 'cancelled'];
const DATE_RANGES = [
  { label: 'All Dates', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'Next 7 Days', value: '7days' },
  { label: 'Custom Date', value: 'custom' },
];

export default function AllAppointments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get('status');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(urlStatus || 'All');
  const [dateRangePreset, setDateRangePreset] = useState('all');
  const [customDate, setCustomDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setUpdatingId(appointmentId);
      const res = await updateAppointmentStatus(appointmentId, { status: newStatus });
      if (res.success) {
        toast.success(`Appointment status updated to ${newStatus}`);
        setAppointments((prev) =>
          prev.map((a) =>
            (a._id || a.id) === appointmentId ? { ...a, status: newStatus } : a
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update appointment status');
    } finally {
      setUpdatingId(null);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = {};

      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }

      const today = startOfDay(new Date());

      if (dateRangePreset === 'today') {
        params.date = today.toISOString();
      } else if (dateRangePreset === 'tomorrow') {
        params.date = addDays(today, 1).toISOString();
      } else if (dateRangePreset === '7days') {
        params.from = today.toISOString();
        params.to = addDays(today, 7).toISOString();
      } else if (dateRangePreset === 'custom' && customDate) {
        params.date = new Date(customDate).toISOString();
      }

      const res = await getAllAppointments(params);
      if (res.success && Array.isArray(res.data)) {
        setAppointments(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch hospital appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, dateRangePreset, customDate]);

  const filteredList = appointments.filter((appt) => {
    const pName = appt.patientName || appt.patientRef?.name || '';
    const dName = appt.doctorRef?.name || appt.doctorName || '';
    const notes = appt.notes || '';
    const q = searchQuery.toLowerCase();
    return (
      pName.toLowerCase().includes(q) ||
      dName.toLowerCase().includes(q) ||
      notes.toLowerCase().includes(q)
    );
  });

  return (
    <div id="admin-all-appointments-container" className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      {/* Indian Hospital Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 text-white text-xs py-2.5 px-4 border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold tracking-wide">Sanjeevani Multi-Speciality Hospital & Research Institute</span>
            <span className="hidden md:inline text-emerald-300/80">• Sector 62, Institutional Area, Noida, Delhi NCR - 201309</span>
          </div>
          <div className="text-emerald-300 font-mono text-[11px]">
            IST (UTC+5:30) • Hospital Administration
          </div>
        </div>
      </div>

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <Link to="/admin/dashboard" className="hover:underline">Admin Central</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Hospital-Wide Records</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Hospital Consultation Registry
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/doctors"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              <span>Manage Doctors</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search & Filter Bar */}
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full md:col-span-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-admin-appointments"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, doctor, diagnosis..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
              <select
                id="select-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Statuses' : st.charAt(0).toUpperCase() + st.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Date Range:</span>
              <select
                id="select-date-range"
                value={dateRangePreset}
                onChange={(e) => setDateRangePreset(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {DATE_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Input if custom selected */}
          {dateRangePreset === 'custom' && (
            <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">Select Date:</span>
              <input
                type="date"
                id="input-custom-date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </section>

        {/* Table View */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hospital Consultation Appointments ({filteredList.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized register of all outpatient bookings across hospital medical departments
              </p>
            </div>

            <button
              type="button"
              onClick={loadAppointments}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Refresh Records
            </button>
          </div>

          {loading ? (
            <div className="p-12">
              <Loader message="Fetching hospital records & OPD logs..." />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Calendar}
                title="No appointments match your filters"
                description="Try adjusting your search query, status filter, or consultation date range."
                actionText={statusFilter !== 'All' || searchQuery || dateRangePreset !== 'all' ? 'Reset Filters' : undefined}
                onAction={
                  statusFilter !== 'All' || searchQuery || dateRangePreset !== 'all'
                    ? () => {
                        setStatusFilter('All');
                        setDateRangePreset('all');
                        setCustomDate('');
                        setSearchQuery('');
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Attending Doctor</th>
                    <th className="py-3.5 px-4">Patient Name & Contact</th>
                    <th className="py-3.5 px-4">Consultation Date</th>
                    <th className="py-3.5 px-4">Time Slot (IST)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Notes / Diagnosis</th>
                    <th className="py-3.5 px-4 text-center">Admin Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredList.map((appt) => {
                    const apptId = appt._id || appt.id;
                    const doctor = appt.doctorRef || {};
                    const doctorName = doctor.name || appt.doctorName || 'Doctor';
                    const doctorSpec = doctor.specialization || 'Clinical';
                    const patient = appt.patientRef || {};
                    const patientName = appt.patientName || patient.name || 'Patient';
                    const patientEmail = appt.patientEmail || patient.email || '';
                    const patientPhone = appt.patientPhone || patient.phone || '';

                    // Format date using date-fns
                    let formattedDate = 'N/A';
                    try {
                      if (appt.appointmentDate) {
                        formattedDate = format(new Date(appt.appointmentDate), 'EEE, MMM d, yyyy');
                      } else if (appt.day) {
                        formattedDate = appt.day;
                      }
                    } catch (e) {
                      formattedDate = String(appt.appointmentDate || appt.day);
                    }

                    return (
                      <tr
                        key={apptId}
                        id={`admin-appointment-row-${apptId}`}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Doctor */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{doctorName}</div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 mt-0.5">
                            {doctorSpec}
                          </span>
                        </td>

                        {/* Patient */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{patientName}</div>
                          {patientEmail && <div className="text-slate-500 text-[11px]">{patientEmail}</div>}
                          {patientPhone && (
                            <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="font-mono text-slate-700 font-medium">{patientPhone}</span>
                            </div>
                          )}
                        </td>

                        {/* Formatted Date */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* Time slot */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                          {appt.time}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <AppointmentStatusBadge status={appt.status} />
                        </td>

                        {/* Clinical notes */}
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {appt.notes ? (
                            <span className="italic">"{appt.notes}"</span>
                          ) : (
                            <span className="text-slate-400 italic">No notes</span>
                          )}
                        </td>

                        {/* Admin Approval Actions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {appt.status === 'pending' && (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                id={`confirm-btn-${apptId}`}
                                disabled={updatingId === apptId}
                                onClick={() => handleStatusChange(apptId, 'confirmed')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                                title="Approve and confirm this consultation"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Confirm</span>
                              </button>
                              <button
                                type="button"
                                id={`cancel-btn-${apptId}`}
                                disabled={updatingId === apptId}
                                onClick={() => handleStatusChange(apptId, 'cancelled')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-xl border border-rose-200 transition disabled:opacity-50 cursor-pointer"
                                title="Reject/Cancel appointment"
                              >
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}
                          {appt.status === 'confirmed' && (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                id={`complete-btn-${apptId}`}
                                disabled={updatingId === apptId}
                                onClick={() => handleStatusChange(apptId, 'completed')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                                title="Mark consultation completed"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Complete</span>
                              </button>
                              <button
                                type="button"
                                id={`cancel-btn-${apptId}`}
                                disabled={updatingId === apptId}
                                onClick={() => handleStatusChange(apptId, 'cancelled')}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition disabled:opacity-50 cursor-pointer"
                                title="Cancel appointment"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}
                          {appt.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle className="w-3 h-3" />
                              <span>Completed</span>
                            </span>
                          )}
                          {appt.status === 'cancelled' && (
                            <span className="text-xs font-medium text-slate-400">
                              Cancelled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorAppointments, updateAppointmentStatus } from '../../api/appointmentApi';
import AppointmentStatusBadge from '../../components/AppointmentStatusBadge';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Stethoscope,
  ChevronRight,
  Filter,
  Check,
  Ban,
  CalendarDays,
  Building2,
  FileText,
  Save,
} from 'lucide-react';

const STATUS_FILTERS = ['All', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function DoctorAppointments() {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Notes editing state per appointment
  const [editingNotes, setEditingNotes] = useState({});
  const [savingNotesId, setSavingNotesId] = useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = statusFilter === 'All' ? {} : { status: statusFilter };
      const res = await getDoctorAppointments(params);
      if (res.success && Array.isArray(res.data)) {
        setAppointments(res.data);
        // Initialize editing notes map
        const initialNotes = {};
        res.data.forEach((a) => {
          initialNotes[a._id || a.id] = a.notes || '';
        });
        setEditingNotes(initialNotes);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch doctor appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  // Handle doctor status change with transition enforcement
  const handleStatusChange = async (appointmentId, newStatus) => {
    const currentNotes = editingNotes[appointmentId] || '';
    const toastId = toast.loading(`Updating consultation to ${newStatus}...`);
    try {
      await updateAppointmentStatus(appointmentId, {
        status: newStatus,
        notes: currentNotes,
      });
      toast.success(`Consultation marked as ${newStatus}`, { id: toastId });
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update status', { id: toastId });
    }
  };

  // Handle saving clinical notes
  const handleSaveNotes = async (appointmentId, currentStatus) => {
    setSavingNotesId(appointmentId);
    const toastId = toast.loading('Saving clinical notes...');
    try {
      await updateAppointmentStatus(appointmentId, {
        status: currentStatus,
        notes: editingNotes[appointmentId] || '',
      });
      toast.success('Clinical notes saved successfully', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save notes', { id: toastId });
    } finally {
      setSavingNotesId(null);
    }
  };

  return (
    <div id="doctor-appointments-page" className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      {/* Indian Hospital Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 text-white text-xs py-2 px-4 border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold tracking-wide">Sanjeevani Multi-Speciality Hospital & Research Institute</span>
            <span className="hidden md:inline text-emerald-300/80">• Sector 62, Institutional Area, Noida, Delhi NCR - 201309</span>
          </div>
          <div className="text-emerald-300 font-mono text-[11px]">
            IST (UTC+5:30) • Doctor Consultation Portal
          </div>
        </div>
      </div>

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <span>Physician OPD Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Patient Consultations</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Dr. {userProfile?.name?.replace('Dr.', '').trim() || 'Physician'} — Appointment Roster
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/doctor/schedule"
              id="btn-nav-doctor-schedule"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              <span>Weekly Template</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status Filter Tabs */}
        <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Filter by Status:
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((st) => {
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  id={`tab-status-${st}`}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Appointments Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Consultation Appointments ({appointments.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage appointment statuses following valid transitions (Pending → Confirmed → Completed)
              </p>
            </div>

            <button
              type="button"
              onClick={loadAppointments}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Refresh Table
            </button>
          </div>

          {loading ? (
            <div className="p-12">
              <Loader message="Fetching patient appointments..." />
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Calendar}
                title="No appointments found"
                description={
                  statusFilter === 'All'
                    ? 'No consultation appointments are booked with you yet.'
                    : `No appointments currently match the "${statusFilter}" status filter.`
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Patient Information</th>
                    <th className="py-3.5 px-4">Consultation Date</th>
                    <th className="py-3.5 px-4">Slot (IST)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Clinical / OPD Notes</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {appointments.map((appt) => {
                    const apptId = appt._id || appt.id;
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

                    const status = (appt.status || 'pending').toLowerCase();
                    const isTerminal = status === 'completed' || status === 'cancelled';

                    return (
                      <tr
                        key={apptId}
                        id={`doctor-appointment-row-${apptId}`}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Patient info */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{patientName}</div>
                          {patientEmail && <div className="text-slate-500 text-[11px]">{patientEmail}</div>}
                          {patientPhone && (
                            <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{patientPhone}</span>
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

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <AppointmentStatusBadge status={status} />
                        </td>

                        {/* Notes input */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              id={`input-notes-${apptId}`}
                              value={editingNotes[apptId] !== undefined ? editingNotes[apptId] : ''}
                              onChange={(e) =>
                                setEditingNotes({ ...editingNotes, [apptId]: e.target.value })
                              }
                              placeholder="Clinical diagnosis or note..."
                              disabled={isTerminal}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 disabled:bg-slate-100"
                            />
                            {!isTerminal && (
                              <button
                                type="button"
                                id={`btn-save-notes-${apptId}`}
                                onClick={() => handleSaveNotes(apptId, status)}
                                disabled={savingNotesId === apptId}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                title="Save Notes"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Action Buttons: ONLY show valid next-status options */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {status === 'pending' && (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                id={`btn-confirm-${apptId}`}
                                type="button"
                                onClick={() => handleStatusChange(apptId, 'confirmed')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
                                title="Confirm Appointment"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Confirm</span>
                              </button>
                              <button
                                id={`btn-decline-${apptId}`}
                                type="button"
                                onClick={() => handleStatusChange(apptId, 'cancelled')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Cancel / Decline"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                            </div>
                          )}

                          {status === 'confirmed' && (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                id={`btn-complete-${apptId}`}
                                type="button"
                                onClick={() => handleStatusChange(apptId, 'completed')}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                                title="Mark Consultation Completed"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Complete</span>
                              </button>
                              <button
                                id={`btn-cancel-${apptId}`}
                                type="button"
                                onClick={() => handleStatusChange(apptId, 'cancelled')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Cancel Consultation"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}

                          {/* Completed or Cancelled: show NO action buttons at all */}
                          {isTerminal && (
                            <span className="text-slate-400 italic text-[11px] pr-2">
                              {status === 'completed' ? 'Completed' : 'Cancelled'}
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

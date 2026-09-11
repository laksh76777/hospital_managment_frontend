import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointments, cancelAppointment } from '../../api/appointmentApi';
import AppointmentStatusBadge from '../../components/AppointmentStatusBadge';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { format, isPast, startOfDay } from 'date-fns';
import {
  Calendar,
  Clock,
  Stethoscope,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Plus,
  X,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export default function MyAppointments() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // In-app cancel dialog state
  const [cancelModalData, setCancelModalData] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await getMyAppointments();
      if (res.success && Array.isArray(res.data)) {
        setAppointments(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load your medical appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Open custom in-app cancellation modal
  const handleOpenCancelDialog = (appointment) => {
    setCancelModalData(appointment);
  };

  // Confirm cancel action
  const handleConfirmCancel = async () => {
    if (!cancelModalData) return;
    setCancelLoading(true);

    const toastId = toast.loading('Cancelling appointment and releasing time slot...');
    try {
      const res = await cancelAppointment(cancelModalData._id || cancelModalData.id);
      toast.success(res.message || 'Appointment cancelled successfully', { id: toastId });
      setCancelModalData(null);
      await loadAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment', { id: toastId });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div id="my-appointments-page" className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      {/* Indian Hospital Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 text-white text-xs py-2 px-4 border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold tracking-wide">Sanjeevani Multi-Speciality Hospital & Research Institute</span>
            <span className="hidden md:inline text-emerald-300/80">• Sector 62, Institutional Area, Noida, Delhi NCR - 201309</span>
          </div>
          <div className="text-emerald-300 font-mono text-[11px]">
            IST (UTC+5:30) • Patient Appointments Desk
          </div>
        </div>
      </div>

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/patient/doctors"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Back to doctor directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Patient Dashboard</span>
              <h1 className="text-xl font-bold text-slate-900">My Consultation Schedule</h1>
            </div>
          </div>

          <Link
            to="/patient/doctors"
            id="btn-book-another-doctor"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            Consultations booked for <span className="font-bold text-slate-900">{userProfile?.name || 'you'}</span>
          </p>
          <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            Total Records: {appointments.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Loader message="Retrieving medical appointment records..." />
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-xl mx-auto">
            <EmptyState
              icon={Calendar}
              title="No Scheduled Consultations"
              description="You currently have no active appointments reserved with Sanjeevani hospital doctors."
              actionText="Browse Specialist Doctors"
              onAction={() => navigate('/patient/doctors')}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => {
              const apptId = appt._id || appt.id;
              const doctor = appt.doctorRef || {};
              const doctorName = doctor.name || appt.doctorName || 'Specialist Doctor';
              const specialization = doctor.specialization || 'General Consultation';
              const department = doctor.department || 'Clinical OPD';
              const fee = doctor.fees || 500;

              // Date formatting with date-fns
              let formattedDate = 'Scheduled Date';
              try {
                if (appt.appointmentDate) {
                  formattedDate = format(new Date(appt.appointmentDate), 'EEEE, MMMM d, yyyy');
                } else if (appt.day) {
                  formattedDate = `Consultation Day: ${appt.day}`;
                }
              } catch (e) {
                formattedDate = String(appt.appointmentDate || appt.day);
              }

              const canCancel = appt.status === 'pending' || appt.status === 'confirmed';

              return (
                <div
                  key={apptId}
                  id={`appointment-card-${apptId}`}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-200 transition-all space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Doctor Details */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-200 shrink-0">
                        {doctorName.replace('Dr.', '').trim().charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{doctorName}</h3>
                          <span className="text-xs text-indigo-700 font-semibold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100">
                            {specialization}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{department}</span>
                          <span>•</span>
                          <span>Sanjeevani Multi-Speciality Hospital</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <AppointmentStatusBadge status={appt.status} />
                    </div>
                  </div>

                  {/* Date, Time & Fee Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Consultation Date</span>
                        <span className="font-semibold text-slate-900">{formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Scheduled Slot</span>
                        <span className="font-semibold text-slate-900">{appt.time} (IST)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="w-4 h-4 text-emerald-600 font-bold flex items-center justify-center shrink-0">₹</div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Consultation Fee</span>
                        <span className="font-bold text-slate-900">₹{fee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Reason / Notes if provided */}
                  {appt.notes && (
                    <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs text-slate-600 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800">Reason / Clinical Symptoms:</span>
                        <p className="mt-0.5 text-slate-700 italic">"{appt.notes}"</p>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-[11px] text-slate-400">
                      Booking ID: <span className="font-mono text-slate-600">{apptId}</span>
                    </div>

                    {canCancel ? (
                      <button
                        id={`btn-cancel-${apptId}`}
                        type="button"
                        onClick={() => handleOpenCancelDialog(appt)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Consultation</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {appt.status === 'completed'
                          ? 'Consultation Completed'
                          : 'Consultation Cancelled'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* In-App Cancellation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelModalData}
        title="Cancel Consultation?"
        message={
          cancelModalData
            ? `Are you sure you want to cancel your consultation with ${
                cancelModalData.doctorRef?.name || cancelModalData.doctorName || 'the specialist'
              } scheduled for ${
                cancelModalData.appointmentDate
                  ? format(new Date(cancelModalData.appointmentDate), 'EEEE, MMMM d, yyyy')
                  : cancelModalData.day
              } at ${cancelModalData.time} (IST)? This slot will be released for other patients.`
            : ''
        }
        confirmText="Yes, Cancel Consultation"
        cancelText="Keep Appointment"
        type="danger"
        loading={cancelLoading}
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelModalData(null)}
      />
    </div>
  );
}

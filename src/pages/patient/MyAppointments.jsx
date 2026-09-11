import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointments, cancelAppointment } from '../../api/appointmentApi';
import AppointmentStatusBadge from '../../components/AppointmentStatusBadge';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import PatientLayout from '../../components/layout/PatientLayout';
import toast from 'react-hot-toast';
import { format, isPast, startOfDay } from 'date-fns';
import {
  Calendar,
  Clock,
  Stethoscope,
  XCircle,
  AlertCircle,
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

  const handleOpenCancelDialog = (appointment) => {
    setCancelModalData(appointment);
  };

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
    <PatientLayout
      title="My Consultation Schedule"
      breadcrumbs={[{ label: 'My Appointments' }]}
    >
      <div id="my-appointments-content" className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Outpatient Consultations ({appointments.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultations scheduled for <span className="font-bold text-slate-800">{userProfile?.name || 'you'}</span>
            </p>
          </div>

          <Link
            to="/appointments/book"
            id="btn-book-another-doctor"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs flex justify-center">
            <Loader message="Loading your consultation records..." />
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No Scheduled Consultations</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You currently have no active appointments reserved with Sanjeevani hospital doctors.
              </p>
            </div>
            <Link
              to="/patient/doctors"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Browse Specialist Doctors</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => {
              const doc = appt.doctorRef || {};
              const docName = doc.name || appt.doctorName || 'Doctor';
              const specialization = doc.specialization || 'Super-Specialist';
              const dept = doc.department || 'Hospital OPD';

              let formattedDate = 'N/A';
              let isAppointmentPast = false;
              try {
                if (appt.appointmentDate) {
                  const d = new Date(appt.appointmentDate);
                  formattedDate = format(d, 'EEEE, MMMM d, yyyy');
                  isAppointmentPast = isPast(d) && !appt.appointmentDate.startsWith(format(new Date(), 'yyyy-MM-dd'));
                } else if (appt.day) {
                  formattedDate = appt.day;
                }
              } catch (e) {
                formattedDate = String(appt.appointmentDate || appt.day);
              }

              const canCancel = appt.status === 'pending' || appt.status === 'confirmed';

              return (
                <div
                  key={appt._id || appt.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900">{docName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {specialization}
                      </span>
                      <AppointmentStatusBadge status={appt.status} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono text-emerald-700 font-bold">{appt.time} (IST)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{dept}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Hospital OPD Desk: Ext 4050</span>
                      </div>
                    </div>

                    {appt.status === 'pending' && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Awaiting administrator confirmation. You will receive an SMS upon approval.</span>
                      </div>
                    )}

                    {appt.notes && (
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>Clinical Notes: "{appt.notes}"</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {canCancel && (
                      <button
                        onClick={() => handleOpenCancelDialog(appt)}
                        className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition cursor-pointer"
                      >
                        Cancel Consultation
                      </button>
                    )}
                    {appt.status === 'cancelled' && (
                      <span className="text-xs font-medium text-slate-400">Cancelled</span>
                    )}
                    {appt.status === 'completed' && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                        Consultation Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
    </PatientLayout>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Activity,
  Users,
  Calendar,
  Building2,
  ShieldCheck,
  UserCheck,
  Clock,
  Plus,
  ArrowRight,
  AlertCircle,
  Stethoscope,
  Check,
  X,
  Phone,
  CheckCircle,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getAllAppointments, updateAppointmentStatus } from '../api/appointmentApi';
import AdminLayout from '../components/layout/AdminLayout';

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todaysAppointments: 0,
    pendingAppointments: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [pendingList, setPendingList] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Passkey Modal for Protected Registered Patients Directory
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);

  const loadData = async () => {
    try {
      setStatsLoading(true);
      const res = await getAdminStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Failed to load admin stats:', err);
    } finally {
      setStatsLoading(false);
    }

    try {
      setLoadingPending(true);
      const apptRes = await getAllAppointments({ status: 'pending' });
      if (apptRes.success && Array.isArray(apptRes.data)) {
        setPendingList(apptRes.data);
      }
    } catch (err) {
      console.warn('Failed to load pending appointments:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setUpdatingId(appointmentId);
      const res = await updateAppointmentStatus(appointmentId, { status: newStatus });
      if (res.success) {
        toast.success(`Appointment marked as ${newStatus}`);
        setPendingList((prev) => prev.filter((a) => (a._id || a.id) !== appointmentId));
        setStats((prev) => ({
          ...prev,
          pendingAppointments: Math.max(0, (prev.pendingAppointments || 1) - 1),
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenPatientsModal = () => {
    if (sessionStorage.getItem('healthdesk_admin_patients_unlocked') === 'laksh97') {
      navigate('/admin/patients');
    } else {
      setPasskeyInput('');
      setPasskeyError('');
      setShowPasskeyModal(true);
    }
  };

  const handleVerifyPasskey = (e) => {
    e.preventDefault();
    const trimmed = passkeyInput.trim();
    if (trimmed === 'laksh97') {
      sessionStorage.setItem('healthdesk_admin_patients_unlocked', 'laksh97');
      setShowPasskeyModal(false);
      toast.success('Access Granted: Opening Registered Patients Directory', { icon: '🔓' });
      navigate('/admin/patients');
    } else {
      setPasskeyError('Access Denied: Incorrect administrative passkey. Please enter "laksh97".');
      toast.error('Incorrect passkey (laksh97 required)');
    }
  };

  return (
    <AdminLayout
      title="Hospital Administrative Overview"
      breadcrumbs={[{ label: 'Dashboard Overview' }]}
    >
      <div id="admin-dashboard-content" className="p-4 sm:p-8 space-y-6">
        {/* Row of 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Patients - Clickable with laksh97 Passkey Protection */}
          <div
            id="stat-total-patients"
            onClick={handleOpenPatientsModal}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            title="Click to access Registered Patients Directory (Passkey: laksh97)"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
                Total Patients
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold text-slate-900">
                  {statsLoading ? '...' : stats.totalPatients}
                </span>
                <span className="ml-2 text-xs font-semibold text-emerald-600">Registered</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1 group-hover:underline">
                <span>Directory</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-mono">🔒</span>
              </span>
            </div>
          </div>

          {/* 2. Total Doctors */}
          <Link
            to="/admin/doctors"
            id="stat-total-doctors"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medical Faculty</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {statsLoading ? '...' : stats.totalDoctors}
              </span>
              <span className="text-xs font-semibold text-indigo-600 group-hover:underline">
                Manage Roster &rarr;
              </span>
            </div>
          </Link>

          {/* 3. Today's Appointments */}
          <Link
            to="/admin/appointments?date=today"
            id="stat-today-appointments"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's OPD</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {statsLoading ? '...' : stats.todaysAppointments ?? stats.todayAppointments ?? 0}
              </span>
              <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                Consultations &rarr;
              </span>
            </div>
          </Link>

          {/* 4. Pending Appointments */}
          <Link
            to="/admin/appointments?status=pending"
            id="stat-pending-appointments"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Confirmation</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-600">
                {statsLoading ? '...' : stats.pendingAppointments ?? 0}
              </span>
              <span className="text-xs font-semibold text-amber-700 group-hover:underline">
                Action Queue &rarr;
              </span>
            </div>
          </Link>
        </div>

        {/* Pending Appointments Action Queue */}
        <div className="bg-white rounded-2xl border border-amber-200/80 shadow-xs overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-amber-50/60 to-white border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Appointments Awaiting Admin Confirmation
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {pendingList.length} Pending
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  New patient bookings require hospital administration review before confirmation
                </p>
              </div>
            </div>

            <Link
              to="/admin/appointments?status=pending"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0"
            >
              <span>Open Consultation Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingPending ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Checking for pending appointment bookings...
            </div>
          ) : pendingList.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">All Consultation Bookings Are Confirmed</p>
              <p className="text-xs text-slate-400 mt-1">
                Zero patient appointments currently awaiting administrative action.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Patient & Phone</th>
                    <th className="py-3 px-4">Doctor & Specialty</th>
                    <th className="py-3 px-4">Date & Slot (IST)</th>
                    <th className="py-3 px-4">Clinical Notes</th>
                    <th className="py-3 px-4 text-center">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pendingList.slice(0, 6).map((appt) => {
                    const apptId = appt._id || appt.id;
                    const doc = appt.doctorRef || {};
                    const pat = appt.patientRef || {};
                    const pName = appt.patientName || pat.name || 'Patient';
                    const pPhone = appt.patientPhone || pat.phone || 'N/A';
                    const dName = doc.name || appt.doctorName || 'Doctor';
                    const dSpec = doc.specialization || 'Clinical';

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
                      <tr key={apptId} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{pName}</div>
                          {pPhone && (
                            <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="font-mono text-slate-700 font-medium">{pPhone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{dName}</div>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 mt-0.5">
                            {dSpec}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800">{formattedDate}</div>
                          <div className="font-mono text-[11px] text-emerald-700 font-bold">{appt.time}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate italic">
                          {appt.notes || 'Routine consultation'}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              id={`dashboard-confirm-${apptId}`}
                              disabled={updatingId === apptId}
                              onClick={() => handleStatusChange(apptId, 'confirmed')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                              title="Confirm this appointment"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Confirm</span>
                            </button>
                            <button
                              type="button"
                              id={`dashboard-cancel-${apptId}`}
                              disabled={updatingId === apptId}
                              onClick={() => handleStatusChange(apptId, 'cancelled')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-xl border border-rose-200 transition disabled:opacity-50 cursor-pointer"
                              title="Cancel this appointment"
                            >
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Management Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                Medical Faculty & Doctors Roster
              </h3>
              <Link
                to="/admin/doctors"
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                View Roster &rarr;
              </Link>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Onboard specialist doctors, assign clinical departments, configure consultation fees, and set up OPD timetables.
            </p>
            <Link
              to="/admin/doctors"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manage Doctors & Timetables</span>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-700" />
                Hospital-Wide Consultation Registry
              </h3>
              <Link
                to="/admin/appointments"
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Open Registry &rarr;
              </Link>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect outpatient bookings across all hospital departments with instant search, status filtering, and action workflows.
            </p>
            <Link
              to="/admin/appointments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs rounded-xl transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Browse All Consultations</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Passkey Verification Modal for Registered Patients */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-center text-white relative">
              <button
                onClick={() => setShowPasskeyModal(false)}
                className="absolute top-4 right-4 p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md text-emerald-300">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">
                Security Passkey Required
              </h3>
              <p className="text-xs text-emerald-200/80 mt-1">
                Enter administrative passkey to unlock confidential registered patient dossiers.
              </p>
            </div>

            <form onSubmit={handleVerifyPasskey} className="p-6 space-y-4">
              {passkeyError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="font-medium">{passkeyError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="dashboard-passkey-input"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Master Passkey
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="dashboard-passkey-input"
                    type={showPasskey ? 'text' : 'password'}
                    value={passkeyInput}
                    onChange={(e) => {
                      setPasskeyInput(e.target.value);
                      setPasskeyError('');
                    }}
                    placeholder="Enter password (laksh97)"
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                    tabIndex="-1"
                  >
                    {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500">
                  <span>Required Passkey:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    laksh97
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasskeyModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  id="submit-dashboard-passkey-btn"
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Directory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
export { AdminDashboard };

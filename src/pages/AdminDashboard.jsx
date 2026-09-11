import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Activity,
  Users,
  Calendar,
  Building2,
  LogOut,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Clock,
  Plus,
  Search,
  Filter,
  ArrowRight,
  AlertCircle,
  Stethoscope,
  Check,
  X,
  Phone,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getAllAppointments, updateAppointmentStatus } from '../api/appointmentApi';

export default function AdminDashboard() {
  const { userProfile, logout } = useAuth();
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

  const adminName = userProfile?.name || 'Administrator';
  const adminEmail = userProfile?.email || 'admin@healthdesk.org';

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

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div id="admin-dashboard" className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Indian Hospital Executive Banner - Top on Admin Screen */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 text-white text-xs py-2.5 px-6 border-b border-emerald-700/50 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold tracking-wide text-sm">
              Sanjeevani Multi-Speciality Hospital & Research Institute
            </span>
            <span className="hidden md:inline text-emerald-300/80">
              • Sector 62, Institutional Area, Noida, Delhi NCR - 201309
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-emerald-300">
            <span>IST (UTC+5:30)</span>
            <span>•</span>
            <span className="bg-emerald-800/80 px-2 py-0.5 rounded border border-emerald-600/60">
              Admin Terminal
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200">
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Health<span className="text-indigo-600">Desk</span>
              </span>
            </Link>
          </div>

          {/* Admin Portal Badge */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Hospital Administration</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1.5">
            <Link
              to="/admin/dashboard"
              id="admin-nav-dashboard"
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white shadow-xs"
            >
              <Activity className="w-4 h-4 text-white" />
              <span>Dashboard Overview</span>
            </Link>

            <Link
              to="/admin/doctors"
              id="admin-nav-doctors"
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Manage Doctors</span>
            </Link>

            <Link
              to="/admin/appointments"
              id="admin-nav-appointments"
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>All Appointments</span>
            </Link>

            <Link
              to="/patient/doctors"
              id="admin-nav-patient-preview"
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Patient Booking View</span>
            </Link>
          </nav>

          {/* System Status */}
          <div className="p-4 mx-4 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800">Hospital Engine</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-slate-500">Atomic Booking & Compound Index Active</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold text-slate-900 truncate">
                Hospital Administrative Overview
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-slate-900 leading-tight">{adminName}</p>
                  <p className="text-slate-500 leading-tight">{adminEmail}</p>
                </div>
              </div>

              <button
                id="admin-topbar-logout-btn"
                onClick={handleLogout}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-medium transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
            {/* Row of 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Total Patients */}
              <div id="stat-total-patients" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</span>
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-slate-900">
                    {statsLoading ? '...' : stats.totalPatients}
                  </span>
                  <span className="ml-2 text-xs font-semibold text-emerald-600">Registered</span>
                </div>
              </div>

              {/* 2. Total Doctors */}
              <Link
                to="/admin/doctors"
                id="stat-total-doctors"
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Doctors</span>
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
                to="/admin/appointments"
                id="stat-today-appointments"
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Appointments</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">
                    {statsLoading ? '...' : stats.todaysAppointments ?? stats.todayAppointments ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                    View &rarr;
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
                      New patient bookings require administrator approval before consultation confirmation
                    </p>
                  </div>
                </div>

                <Link
                  to="/admin/appointments?status=pending"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
                >
                  <span>Open Full Registry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingPending ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Checking for pending appointment bookings...
                </div>
              ) : pendingList.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">All Appointment Bookings Are Up To Date</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No bookings currently awaiting administrative confirmation.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Patient & Phone</th>
                        <th className="py-3 px-4">Doctor & Department</th>
                        <th className="py-3 px-4">Date & Slot (IST)</th>
                        <th className="py-3 px-4">Notes</th>
                        <th className="py-3 px-4 text-center">Confirm / Reject</th>
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
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 mt-0.5">
                                {dSpec}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-medium text-slate-800">{formattedDate}</div>
                              <div className="font-mono text-[11px] text-indigo-600 font-bold">{appt.time}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-500 max-w-xs truncate italic">
                              {appt.notes || 'No symptoms noted'}
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
                                  title="Reject this appointment"
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

            {/* Quick Actions & Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-indigo-600" />
                    Doctor Faculty Management
                  </h3>
                  <Link
                    to="/admin/doctors"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View All
                  </Link>
                </div>
                <p className="text-xs text-slate-500">
                  Onboard medical faculty, configure specialized departments, assign temporary credentials, and edit weekly availability timetables.
                </p>
                <Link
                  to="/admin/doctors"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard New Doctor or Edit Timetable</span>
                </Link>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Consultation Registry
                  </h3>
                  <Link
                    to="/admin/appointments"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Open Registry
                  </Link>
                </div>
                <p className="text-xs text-slate-500">
                  Inspect outpatient appointments hospital-wide with real-time status filtering and date range tracking.
                </p>
                <Link
                  to="/admin/appointments"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Browse Consultation Records</span>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
export { AdminDashboard };

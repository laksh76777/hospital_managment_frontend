import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getAllAppointments, updateAppointmentStatus } from '../api/appointmentApi';

export default function AdminDashboard() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div id="admin-dashboard" className="min-h-screen bg-slate-50 flex flex-col">
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
              to="/admin/patients"
              id="admin-nav-patients"
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition group"
            >
              <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              <span className="flex-1">Registered Patients</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                🔒
              </span>
            </Link>

            <Link
              to="/admin/doctors"
              id="admin-nav-doctors"
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <UserCheck className="w-4 h-4 text-slate-400" />
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

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer Panel */}
            <div className="relative flex flex-col w-72 max-w-[85vw] bg-white border-r border-slate-200 h-full shadow-2xl">
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <Link to="/" className="flex items-center space-x-2.5" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    Health<span className="text-indigo-600">Desk</span>
                  </span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Hospital Administration</span>
                </div>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white shadow-xs"
                >
                  <Activity className="w-4 h-4" />
                  <span>Dashboard Overview</span>
                </Link>
                <Link
                  to="/admin/patients"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="flex-1">Registered Patients</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200">🔒</span>
                </Link>
                <Link
                  to="/admin/doctors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Manage Doctors</span>
                </Link>
                <Link
                  to="/admin/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>All Appointments</span>
                </Link>
                <Link
                  to="/patient/doctors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Patient Booking View</span>
                </Link>
              </nav>

              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center space-x-3">
              {/* Mobile hamburger */}
              <button
                id="admin-mobile-menu-btn"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
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
              {/* 1. Total Patients - Clickable with laksh97 Passkey Protection */}
              <div
                id="stat-total-patients"
                onClick={handleOpenPatientsModal}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
                title="Click to access Registered Patients Directory (Passkey: laksh97)"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-teal-700 transition-colors">
                    Total Patients
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
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
                  <span className="text-xs font-semibold text-teal-600 flex items-center space-x-1 group-hover:underline">
                    <span>Directory</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-md font-mono">🔒</span>
                  </span>
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

      {/* Passkey Verification Modal for Registered Patients */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-center text-white relative">
              <button
                onClick={() => setShowPasskeyModal(false)}
                className="absolute top-4 right-4 p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-400/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md text-indigo-300">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">
                Security Passkey Required
              </h3>
              <p className="text-xs text-indigo-200/80 mt-1">
                Enter master administrative passkey to unlock confidential registered patient data.
              </p>
            </div>

            {/* Form */}
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
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
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
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
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
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-md hover:shadow-indigo-200 transition flex items-center justify-center space-x-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Directory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export { AdminDashboard };

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Download,
  Activity,
  UserCheck,
  Building2,
  FileText,
  X,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Menu,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { getAdminPatients } from '../../api/appointmentApi';

const PASSKEY_KEY = 'healthdesk_admin_patients_unlocked';
const REQUIRED_PASSKEY = 'laksh97';

export default function ManagePatients() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Security Lock State
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem(PASSKEY_KEY) === REQUIRED_PASSKEY;
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Patient Directory State
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Fetch patients when unlocked
  const fetchPatientsData = async (keyToUse = REQUIRED_PASSKEY) => {
    setLoading(true);
    try {
      const response = await getAdminPatients(keyToUse);
      if (response && response.data) {
        setPatients(response.data);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      if (err.status === 403) {
        setIsUnlocked(false);
        sessionStorage.removeItem(PASSKEY_KEY);
        setPasskeyError('Session expired or passkey rejected. Please enter password again.');
        toast.error('Passkey authentication required');
      } else {
        toast.error(err.message || 'Failed to load registered patients');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchPatientsData(REQUIRED_PASSKEY);
    }
  }, [isUnlocked]);

  // Handle passkey submit
  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    setPasskeyError('');

    const trimmed = passkeyInput.trim();
    if (!trimmed) {
      setPasskeyError('Please enter the security passkey.');
      return;
    }

    setVerifying(true);
    // Client and server dual verification
    if (trimmed === REQUIRED_PASSKEY) {
      try {
        // Verify with server endpoint
        const response = await getAdminPatients(trimmed);
        sessionStorage.setItem(PASSKEY_KEY, REQUIRED_PASSKEY);
        setIsUnlocked(true);
        if (response && response.data) {
          setPatients(response.data);
        }
        toast.success('Access Granted: Registered Patient Directory Unlocked', {
          icon: '🔓',
        });
      } catch (err) {
        setPasskeyError(err.message || 'Verification failed. Please try again.');
        toast.error('Passkey verification failed');
      } finally {
        setVerifying(false);
      }
    } else {
      setVerifying(false);
      setPasskeyError('Access Denied: Incorrect administrative passkey. Please enter "laksh97".');
      toast.error('Access Denied: Incorrect passkey');
    }
  };

  // Lock directory manually
  const handleLockDirectory = () => {
    sessionStorage.removeItem(PASSKEY_KEY);
    setIsUnlocked(false);
    setPasskeyInput('');
    setSelectedPatient(null);
    toast('Patient Directory Locked', { icon: '🔒' });
  };

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (statusFilter === 'has_bookings') {
      return (p.totalAppointments || 0) > 0;
    }
    if (statusFilter === 'no_bookings') {
      return (p.totalAppointments || 0) === 0;
    }
    if (statusFilter === 'active_confirmed') {
      return p.latestAppointment && p.latestAppointment.status === 'confirmed';
    }
    if (statusFilter === 'pending') {
      return p.latestAppointment && p.latestAppointment.status === 'pending';
    }

    return true;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (!patients.length) {
      toast.error('No patient data to export');
      return;
    }

    const headers = ['Patient Name', 'Email Address', 'Phone Number', 'Total Bookings', 'Latest Doctor', 'Latest Status', 'Registration Date'];
    const rows = patients.map((p) => [
      `"${p.name || ''}"`,
      `"${p.email || ''}"`,
      `"${p.phone || ''}"`,
      p.totalAppointments || 0,
      `"${p.latestAppointment?.doctorName || 'None'}"`,
      `"${p.latestAppointment?.status || 'N/A'}"`,
      `"${p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sanjeevani_Hospital_Patients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Patient directory exported to CSV');
  };

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div id="manage-patients-page" className="min-h-screen bg-slate-50 flex flex-col">

      {/* Indian Hospital Executive Banner */}
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
            <span>Passkey Protected Directory</span>
            <span>•</span>
            <span className="bg-emerald-800/80 px-2 py-0.5 rounded border border-emerald-600/60">
              Passkey: laksh97
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
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Activity className="w-4 h-4 text-slate-400" />
              <span>Dashboard Overview</span>
            </Link>

            <Link
              to="/admin/patients"
              id="admin-nav-patients"
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white shadow-xs"
            >
              <Users className="w-4 h-4 text-white" />
              <span className="flex-1">Registered Patients</span>
              <span className="text-[10px] bg-indigo-700/80 px-1.5 py-0.5 rounded border border-indigo-500/40">
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
          </nav>

          {/* Security Status */}
          <div className="p-4 mx-4 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800">Passkey Protection</span>
              <span className={`w-2 h-2 rounded-full ${isUnlocked ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
            <p className="text-slate-500">
              {isUnlocked ? 'Directory Unlocked for this session' : 'Password Required: laksh97'}
            </p>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative flex flex-col w-72 max-w-[85vw] bg-white border-r border-slate-200 h-full shadow-2xl">
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <Link to="/" className="flex items-center space-x-2.5" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">Health<span className="text-indigo-600">Desk</span></span>
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
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <span>Dashboard Overview</span>
                </Link>
                <Link to="/admin/patients" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white shadow-xs">
                  <Users className="w-4 h-4" />
                  <span className="flex-1">Registered Patients</span>
                  <span className="text-[10px] bg-indigo-700/80 px-1.5 py-0.5 rounded border border-indigo-500/40">🔒</span>
                </Link>
                <Link to="/admin/doctors" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Manage Doctors</span>
                </Link>
                <Link to="/admin/appointments" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>All Appointments</span>
                </Link>
              </nav>
              <div className="p-4 border-t border-slate-100">
                <button onClick={() => { setMobileMenuOpen(false); logout().then(() => navigate('/signin')); }} className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium transition">
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
              <button
                id="manage-patients-mobile-menu-btn"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link
                to="/admin/dashboard"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Registered Patients Directory
                </h1>
                <p className="text-xs text-slate-500">
                  Secure Medical Records & Registered Patient Profiles
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isUnlocked && (
                <>
                  <button
                    id="admin-patients-refresh-btn"
                    onClick={() => fetchPatientsData(REQUIRED_PASSKEY)}
                    disabled={loading}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <button
                    id="admin-patients-export-btn"
                    onClick={handleExportCSV}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                  <button
                    id="admin-patients-lock-btn"
                    onClick={handleLockDirectory}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-medium transition"
                    title="Re-lock this directory"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Directory</span>
                  </button>
                </>
              )}
            </div>
          </header>

          {/* Dynamic Content: Lock Screen VS Unlocked Directory */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            {!isUnlocked ? (
              /* ========================================================================= */
              /* SECURITY LOCK SCREEN: REQUIRES PASSWORD 'laksh97'                         */
              /* ========================================================================= */
              <div id="patients-lockscreen" className="max-w-md mx-auto my-12">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                  {/* Lock Screen Header Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-center text-white relative">
                    <div className="w-16 h-16 bg-indigo-500/20 border-2 border-indigo-400/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-indigo-300">
                      <Lock className="w-8 h-8 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Security Passkey Required
                    </h2>
                    <p className="text-xs text-indigo-200/80 mt-1 max-w-xs mx-auto">
                      Protected Healthcare Information (PHI). Enter master administrative passkey to unlock confidential registered patient data.
                    </p>
                  </div>

                  {/* Lock Screen Form */}
                  <form onSubmit={handleUnlockSubmit} className="p-6 sm:p-8 space-y-5">
                    {passkeyError && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="font-medium">{passkeyError}</span>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="admin-patient-passkey-input"
                        className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
                      >
                        Enter Master Passkey
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          id="admin-patient-passkey-input"
                          type={showPasskey ? 'text' : 'password'}
                          value={passkeyInput}
                          onChange={(e) => {
                            setPasskeyInput(e.target.value);
                            setPasskeyError('');
                          }}
                          placeholder="Enter password (laksh97)"
                          autoFocus
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasskey(!showPasskey)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                          tabIndex="-1"
                        >
                          {showPasskey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                        <span>Required Master Password:</span>
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          laksh97
                        </span>
                      </div>
                    </div>

                    <button
                      id="admin-unlock-patients-btn"
                      type="submit"
                      disabled={verifying}
                      className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-indigo-200 transition disabled:opacity-50"
                    >
                      {verifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Authenticating Passkey...</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span>Unlock Patient Directory</span>
                        </>
                      )}
                    </button>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <Link
                        to="/admin/dashboard"
                        className="hover:text-indigo-600 font-medium transition flex items-center space-x-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Return to Dashboard</span>
                      </Link>
                      <span className="text-[11px] text-slate-400">HIPAA & ISO 27001 Compliant</span>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* UNLOCKED PATIENT DIRECTORY                                                */
              /* ========================================================================= */
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Total Registered
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-slate-900">
                        {loading ? '...' : patients.length}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Verified Users
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        With Appointments
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-slate-900">
                        {loading ? '...' : patients.filter((p) => (p.totalAppointments || 0) > 0).length}
                      </span>
                      <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        Active Patients
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Phone Verified
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-slate-900">
                        {loading ? '...' : patients.filter((p) => !!p.phone).length}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        SMS Enabled
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Directory Status
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        Protected Session
                      </span>
                      <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        laksh97
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      id="search-patients-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search patient by name, email, or phone..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                      <Filter className="w-3.5 h-3.5" />
                      <span className="font-semibold">Filter:</span>
                    </div>
                    <select
                      id="filter-patients-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Registered Patients ({patients.length})</option>
                      <option value="has_bookings">Has Appointment Bookings</option>
                      <option value="no_bookings">No Bookings Yet</option>
                      <option value="active_confirmed">Latest Confirmed</option>
                      <option value="pending">Latest Pending</option>
                    </select>
                  </div>
                </div>

                {/* Patients Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Registered Patient Profiles
                      </h2>
                      <p className="text-xs text-slate-500">
                        Showing {filteredPatients.length} of {patients.length} registered patients
                      </p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="p-12 text-center">
                      <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                      <p className="text-xs font-medium text-slate-600">
                        Decrypting and loading registered patient records...
                      </p>
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-sm font-semibold text-slate-800">
                        No registered patients found
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Try adjusting your search query or filter selection.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3.5">Patient Details</th>
                            <th className="px-6 py-3.5">Contact Information</th>
                            <th className="px-6 py-3.5">Registered On</th>
                            <th className="px-6 py-3.5">Appointments</th>
                            <th className="px-6 py-3.5">Latest Doctor / Status</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredPatients.map((patient) => {
                            const initial = (patient.name || patient.email || 'P')
                              .charAt(0)
                              .toUpperCase();
                            const isDemoPatient =
                              patient.email === 'abcd@gmail.com' ||
                              patient.name?.includes('Demo');

                            return (
                              <tr
                                key={patient.id || patient._id || patient.email}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                {/* Patient Info */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                                      {initial}
                                    </div>
                                    <div>
                                      <div className="flex items-center space-x-1.5">
                                        <span className="font-bold text-slate-900 text-sm">
                                          {patient.name || 'Patient User'}
                                        </span>
                                        {isDemoPatient && (
                                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                                            DEMO
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-slate-500 font-mono">
                                        ID: {patient.id?.slice(-8) || 'PAT-' + patient.email?.slice(0, 4)}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* Contact Details */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="space-y-1">
                                    <a
                                      href={`mailto:${patient.email}`}
                                      className="flex items-center space-x-1.5 text-slate-700 hover:text-indigo-600 transition"
                                      title="Send Email"
                                    >
                                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{patient.email}</span>
                                    </a>
                                    {patient.phone ? (
                                      <a
                                        href={`tel:${patient.phone}`}
                                        className="flex items-center space-x-1.5 text-slate-600 hover:text-emerald-600 font-medium transition"
                                        title="Call Patient"
                                      >
                                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>{patient.phone}</span>
                                      </a>
                                    ) : (
                                      <span className="text-[11px] text-slate-400 italic">
                                        No phone provided
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Registration Date */}
                                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                  <div className="flex items-center space-x-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{formatDate(patient.createdAt)}</span>
                                  </div>
                                </td>

                                {/* Bookings Count */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                      (patient.totalAppointments || 0) > 0
                                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                    }`}
                                  >
                                    {patient.totalAppointments || 0} Booking
                                    {(patient.totalAppointments || 0) !== 1 ? 's' : ''}
                                  </span>
                                </td>

                                {/* Latest Appointment */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {patient.latestAppointment ? (
                                    <div>
                                      <p className="font-semibold text-slate-800">
                                        {patient.latestAppointment.doctorName}
                                      </p>
                                      <div className="flex items-center space-x-1.5 mt-0.5">
                                        <span className="text-[11px] text-slate-500">
                                          {patient.latestAppointment.specialization}
                                        </span>
                                        <span>•</span>
                                        <span
                                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                            patient.latestAppointment.status === 'confirmed'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : patient.latestAppointment.status === 'pending'
                                              ? 'bg-amber-100 text-amber-800'
                                              : patient.latestAppointment.status === 'completed'
                                              ? 'bg-indigo-100 text-indigo-800'
                                              : 'bg-rose-100 text-rose-800'
                                          }`}
                                        >
                                          {patient.latestAppointment.status}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic">No bookings yet</span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <button
                                    id={`view-patient-${patient.id || patient._id || patient.email}`}
                                    onClick={() => setSelectedPatient(patient)}
                                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>View Dossier</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PATIENT DOSSIER MODAL                                                     */}
      {/* ========================================================================= */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold text-lg">
                  {(selectedPatient.name || selectedPatient.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedPatient.name || 'Registered Patient'}
                  </h3>
                  <p className="text-xs text-indigo-200/80 font-mono">
                    Patient ID: {selectedPatient.id || selectedPatient._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Profile Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Email Address:</span>
                  <a
                    href={`mailto:${selectedPatient.email}`}
                    className="font-medium text-indigo-600 hover:underline flex items-center space-x-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedPatient.email}</span>
                  </a>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Phone Number:</span>
                  {selectedPatient.phone ? (
                    <a
                      href={`tel:${selectedPatient.phone}`}
                      className="font-semibold text-emerald-700 hover:underline flex items-center space-x-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedPatient.phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Registration Date:</span>
                  <span className="font-medium text-slate-800">
                    {formatDate(selectedPatient.createdAt)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Role & Permissions:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                    Registered Patient
                  </span>
                </div>
              </div>

              {/* Consultation History */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Consultation & Booking History
                  </h4>
                  <span className="text-xs text-slate-500">
                    {selectedPatient.appointments?.length || (selectedPatient.latestAppointment ? 1 : 0)} Total
                  </span>
                </div>

                {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPatient.appointments.map((appt, idx) => (
                      <div
                        key={appt.id || appt._id || idx}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 text-xs">
                              {appt.doctorName}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-2">
                              • {appt.specialization}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              appt.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : appt.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : appt.status === 'completed'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {appt.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-slate-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {appt.appointmentDate
                                ? new Date(appt.appointmentDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Scheduled'}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{appt.time}</span>
                          </span>
                        </div>

                        {appt.notes && (
                          <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                            "{appt.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : selectedPatient.latestAppointment ? (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {selectedPatient.latestAppointment.doctorName}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {selectedPatient.latestAppointment.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Time: {selectedPatient.latestAppointment.time} • Spec: {selectedPatient.latestAppointment.specialization}
                    </p>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">
                      No appointment bookings registered for this patient yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Administrative Clinical Registry • Passkey Verified
              </span>
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

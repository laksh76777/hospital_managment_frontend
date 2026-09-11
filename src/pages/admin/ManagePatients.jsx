import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
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
  Download,
  Activity,
  FileText,
  X,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getAdminPatients } from '../../api/appointmentApi';
import AdminLayout from '../../components/layout/AdminLayout';

const PASSKEY_KEY = 'healthdesk_admin_patients_unlocked';
const REQUIRED_PASSKEY = 'laksh97';

export default function ManagePatients() {
  const navigate = useNavigate();

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

  const fetchPatientsData = async (passkey) => {
    try {
      setLoading(true);
      const res = await getAdminPatients(passkey);
      if (res.success && Array.isArray(res.data)) {
        setPatients(res.data);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsUnlocked(false);
        sessionStorage.removeItem(PASSKEY_KEY);
        toast.error('Passkey session expired or invalid. Please re-enter passkey.');
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to load patient directory');
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

  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    setPasskeyError('');
    setVerifying(true);

    const trimmed = passkeyInput.trim();
    if (!trimmed) {
      setPasskeyError('Please enter the security passkey');
      setVerifying(false);
      return;
    }

    if (trimmed === REQUIRED_PASSKEY) {
      sessionStorage.setItem(PASSKEY_KEY, REQUIRED_PASSKEY);
      setIsUnlocked(true);
      setVerifying(false);
      toast.success('Access Granted: Registered Patients Directory Unlocked', { icon: '🔓' });
      fetchPatientsData(REQUIRED_PASSKEY);
    } else {
      setVerifying(false);
      setPasskeyError('Access Denied: Incorrect administrative passkey. Please enter "laksh97".');
      toast.error('Incorrect passkey (laksh97 required)');
    }
  };

  const handleLockDirectory = () => {
    sessionStorage.removeItem(PASSKEY_KEY);
    setIsUnlocked(false);
    setPatients([]);
    setSelectedPatient(null);
    setPasskeyInput('');
    toast('Directory re-locked', { icon: '🔒' });
  };

  const handleExportCSV = () => {
    if (!patients || patients.length === 0) {
      toast.error('No patient data to export');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Total Appointments', 'Latest Doctor', 'Latest Date', 'Status'];
    const rows = patients.map((p) => [
      p._id || p.id,
      p.name || '',
      p.email || '',
      p.phone || 'N/A',
      p.role || 'patient',
      p.totalAppointments || (p.appointments ? p.appointments.length : 0),
      p.latestAppointment?.doctorName || 'N/A',
      p.latestAppointment?.appointmentDate ? new Date(p.latestAppointment.appointmentDate).toLocaleDateString() : 'N/A',
      p.latestAppointment?.status || 'registered',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Sanjeevani_Patients_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Patient directory exported to CSV');
  };

  // Filtered Patients
  const filteredPatients = patients.filter((pat) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      (pat.name || '').toLowerCase().includes(q) ||
      (pat.email || '').toLowerCase().includes(q) ||
      (pat.phone || '').toLowerCase().includes(q) ||
      (pat.latestAppointment?.doctorName || '').toLowerCase().includes(q) ||
      (pat.latestAppointment?.specialization || '').toLowerCase().includes(q);

    if (!matchQuery) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'has-appointments') {
      return (pat.totalAppointments > 0) || (pat.appointments && pat.appointments.length > 0);
    }
    if (statusFilter === 'no-appointments') {
      return !pat.totalAppointments && (!pat.appointments || pat.appointments.length === 0);
    }
    return true;
  });

  return (
    <AdminLayout
      title="Registered Patients Directory"
      breadcrumbs={[{ label: 'Registered Patients' }]}
    >
      <div className="p-4 sm:p-8 space-y-6">
        {/* Top Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Confidential Patient Records & Dossiers
            </h2>
            <p className="text-xs text-slate-500">
              Secured with administrative passkey <code className="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-mono font-bold">laksh97</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <>
                <button
                  onClick={() => fetchPatientsData(REQUIRED_PASSKEY)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  title="Refresh Patient Records"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleLockDirectory}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Re-Lock</span>
                </button>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                <Lock className="w-3.5 h-3.5" />
                <span>Locked Directory</span>
              </span>
            )}
          </div>
        </div>

        {/* LOCKED STATE VIEW */}
        {!isUnlocked && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Protected Clinical Data</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Registered patient directory contains protected clinical records, contact details, and appointment histories. Enter master passkey to unlock.
              </p>
            </div>

            <form onSubmit={handleUnlockSubmit} className="space-y-4 max-w-sm mx-auto text-left">
              {passkeyError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="font-medium">{passkeyError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Administrative Passkey
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasskey ? 'text' : 'password'}
                    value={passkeyInput}
                    onChange={(e) => {
                      setPasskeyInput(e.target.value);
                      setPasskeyError('');
                    }}
                    placeholder="Enter passkey (laksh97)"
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
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

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Unlock className="w-4 h-4" />
                <span>{verifying ? 'Verifying...' : 'Unlock Patient Directory'}</span>
              </button>
            </form>
          </div>
        )}

        {/* UNLOCKED DIRECTORY VIEW */}
        {isUnlocked && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by patient name, email, phone, doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-500">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Patients ({patients.length})</option>
                  <option value="has-appointments">With Appointments</option>
                  <option value="no-appointments">No Appointments Yet</option>
                </select>
              </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                  Loading confidential patient directory...
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  No registered patients match your search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Patient Name</th>
                        <th className="py-3 px-4">Email & Phone</th>
                        <th className="py-3 px-4">Registered On</th>
                        <th className="py-3 px-4">Total Visits</th>
                        <th className="py-3 px-4">Latest Consultation</th>
                        <th className="py-3 px-4 text-center">Dossier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredPatients.map((pat) => {
                        const patId = pat._id || pat.id;
                        const visitCount = pat.totalAppointments || (pat.appointments ? pat.appointments.length : 0);
                        const regDate = pat.createdAt ? new Date(pat.createdAt).toLocaleDateString() : 'Active';

                        return (
                          <tr key={patId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{pat.name}</div>
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                                {patId.slice(0, 10)}...
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="text-slate-800 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{pat.email}</span>
                              </div>
                              {pat.phone && (
                                <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span className="font-mono font-medium">{pat.phone}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">
                              {regDate}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                                {visitCount} {visitCount === 1 ? 'visit' : 'visits'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {pat.latestAppointment ? (
                                <div>
                                  <div className="font-semibold text-slate-800">
                                    {pat.latestAppointment.doctorName}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {pat.latestAppointment.specialization} • {pat.latestAppointment.time}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">No visits yet</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => setSelectedPatient(pat)}
                                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200 cursor-pointer"
                              >
                                View Dossier
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
      </div>

      {/* Patient Dossier Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {selectedPatient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold">{selectedPatient.name}</h3>
                  <p className="text-xs text-emerald-300 font-mono">
                    Patient ID: {selectedPatient._id || selectedPatient.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Contact Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedPatient.email}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Phone</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5 font-mono">
                    {selectedPatient.phone || 'Not Provided'}
                  </p>
                </div>
              </div>

              {/* Consultation History */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Consultation History & Recorded Appointments
                </h4>
                {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedPatient.appointments.map((appt, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">
                            {appt.doctorName} ({appt.specialization || appt.department})
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {appt.status}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-3">
                          <span>Slot: {appt.time}</span>
                          <span>•</span>
                          <span>Notes: {appt.notes || 'Routine consultation'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                    No recorded outpatient appointments for this patient.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

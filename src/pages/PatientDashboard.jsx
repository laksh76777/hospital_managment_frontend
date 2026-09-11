import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import {
  Activity,
  Calendar,
  CalendarPlus,
  User,
  LogOut,
  Menu,
  X,
  Clock,
  CheckCircle2,
  ChevronRight,
  Stethoscope,
  Bell,
  Shield,
  FileText,
  AlertCircle,
  Loader2,
  Building2,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments } from '../api/appointmentApi';
import {
  subscribePatientAppointments,
  bookAppointmentInFirestore,
} from '../firebase/firestoreService';

export const PatientDashboard = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'book' | 'profile'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const [bookingData, setBookingData] = useState({
    department: 'Cardiology (Heart & Circulation)',
    doctor: 'Dr. Sarah Jenkins, MD',
    date: '2026-09-18',
    timeSlot: '10:00 AM - 10:30 AM',
    notes: '',
  });

  const patientName = userProfile?.name || currentUser?.displayName || 'Patient';
  const patientEmail = userProfile?.email || currentUser?.email || 'patient@healthdesk.org';

  const loadAppointments = async () => {
    try {
      setLoadingAppts(true);
      const res = await getMyAppointments();
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((a) => ({
          id: a._id || a.id,
          doctorName: a.doctorRef?.name || a.doctorName || 'Doctor',
          department: a.doctorRef?.department || a.doctorRef?.specialization || 'Clinical Department',
          date: a.appointmentDate
            ? new Date(a.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            : a.day,
          timeSlot: a.time,
          status: a.status,
          notes: a.notes,
        }));
        setAppointments(mapped);
      }
    } catch (err) {
      console.warn('Could not fetch mongo appointments:', err);
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    loadAppointments();

    const currentUid = currentUser?.uid || userProfile?.firebaseUID;
    if (currentUid) {
      const unsubscribe = subscribePatientAppointments(
        currentUid,
        (liveAppts) => {
          if (liveAppts && liveAppts.length > 0) {
            setAppointments((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const additions = liveAppts.filter((l) => !existingIds.has(l.id));
              return [...prev, ...additions];
            });
          }
        },
        (err) => {
          console.warn('[PatientDashboard] Subscription note:', err);
        }
      );
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [currentUser, userProfile]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setBookingLoading(true);

    try {
      await bookAppointmentInFirestore({
        patientName,
        patientEmail,
        department: bookingData.department,
        doctorName: bookingData.doctor,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        notes: bookingData.notes,
      });

      setBookingSuccess('Appointment successfully reserved! Our medical desk has received your request.');
      setBookingData({
        department: 'Cardiology (Heart & Circulation)',
        doctor: 'Dr. Sarah Jenkins, MD',
        date: '2026-09-18',
        timeSlot: '10:00 AM - 10:30 AM',
        notes: '',
      });
      setTimeout(() => {
        setActiveTab('appointments');
      }, 1500);
    } catch (err) {
      console.error('Failed to book appointment:', err);
      setBookingError(err.message || 'Could not schedule appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const navItems = [
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'book', label: 'Book Appointment', icon: CalendarPlus },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div id="patient-dashboard" className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Hospital Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white text-xs py-2.5 px-6 border-b border-emerald-800/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold tracking-wide text-sm">
              Sanjeevani Super-Speciality Hospital & Research Institute
            </span>
            <span className="hidden md:inline text-emerald-300/80">
              • Sector 62, Institutional Area, Noida, Delhi NCR - 201309
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-emerald-300">
            <span>24/7 Emergency: 1066</span>
            <span>•</span>
            <span className="bg-emerald-800/80 px-2 py-0.5 rounded border border-emerald-600/60">
              Patient Portal
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200">
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-emerald-700 rounded-xl flex items-center justify-center text-white shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Sanjeevani<span className="text-emerald-700">Care</span>
              </span>
            </Link>
          </div>

          {/* Patient Portal Badge */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>Patient Health Account</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1.5">
            <Link
              to="/patient/doctors"
              id="patient-nav-find-doctors"
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition"
            >
              <Stethoscope className="w-4 h-4 text-white" />
              <span>Find Specialist Doctors</span>
            </Link>

            <Link
              to="/patient/my-appointments"
              id="patient-nav-my-consultations"
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>My Consultation Register</span>
            </Link>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`patient-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Outpatient Emergency Notice */}
          <div className="p-4 mx-4 mb-4 rounded-xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900">
            <p className="font-bold mb-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>24/7 Emergency & Trauma</span>
            </p>
            <p className="text-rose-700 font-mono font-bold mt-1">Dial 1066 / +91 11 4050 9999</p>
          </div>
        </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900">HealthDesk</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
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
            <button
              id="patient-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 truncate">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold">
                {patientName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-900 leading-tight">{patientName}</p>
                <p className="text-slate-500 leading-tight">Patient</p>
              </div>
            </div>

            <button
              id="patient-topbar-logout-btn"
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-medium transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeTab === 'appointments' && (
            <div className="space-y-6 max-w-5xl">
              {/* Welcome banner */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Welcome back, {patientName}!
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage your medical visits, access physician notes, or reserve an outpatient slot.
                  </p>
                </div>
                <button
                  id="book-new-appt-btn"
                  onClick={() => setActiveTab('book')}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              </div>

              {/* Appointments List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Upcoming & Recent Visits</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Synchronized in real-time with Firebase Firestore</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {loadingAppts ? 'Syncing...' : `${appointments.length} record${appointments.length === 1 ? '' : 's'}`}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {loadingAppts ? (
                    <div className="p-8">
                      <Loader message="Loading appointments from Firestore..." />
                    </div>
                  ) : appointments.length > 0 ? (
                    appointments.map((appt) => (
                      <div
                        key={appt.id}
                        className="p-5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-teal-100">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">{appt.doctorName || 'Assigned Physician'}</h4>
                            <p className="text-xs text-slate-500">{appt.department || 'General Medicine'}{appt.notes ? ` • ${appt.notes}` : ''}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-600">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{appt.date}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{appt.timeSlot}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            appt.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : appt.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {appt.status ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1) : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8">
                      <EmptyState
                        icon={Calendar}
                        title="No scheduled visits in Firestore yet"
                        description="Reserve a consultation slot with one of our specialized hospital physicians."
                        actionText="Book Your First Visit"
                        onAction={() => setActiveTab('book')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'book' && (
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Book New Appointment</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Choose your specialty department and preferred doctor to reserve a time slot in Firestore.
                </p>
              </div>

              {bookingSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2.5 text-emerald-800 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{bookingSuccess}</span>
                </div>
              )}

              {bookingError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2.5 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Department</label>
                  <select
                    value={bookingData.department}
                    onChange={(e) => setBookingData({ ...bookingData, department: e.target.value })}
                    className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option>Cardiology (Heart & Circulation)</option>
                    <option>Dermatology (Skin & Allergy)</option>
                    <option>Pediatrics (Child Healthcare)</option>
                    <option>Neurology (Brain & Spine)</option>
                    <option>Orthopedics (Joint & Bone)</option>
                    <option>General Medicine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Attending Physician</label>
                  <select
                    value={bookingData.doctor}
                    onChange={(e) => setBookingData({ ...bookingData, doctor: e.target.value })}
                    className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option>Dr. Sarah Jenkins, MD (Cardiology)</option>
                    <option>Dr. Robert Chen, MD (Dermatology)</option>
                    <option>Dr. Emily Watson, MD (Pediatrics)</option>
                    <option>Dr. Marcus Vance, MD (General Medicine)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Date</label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time Slot</label>
                    <select
                      value={bookingData.timeSlot}
                      onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                      className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option>09:00 AM - 09:30 AM</option>
                      <option>10:00 AM - 10:30 AM</option>
                      <option>11:30 AM - 12:00 PM</option>
                      <option>02:00 PM - 02:30 PM</option>
                      <option>03:30 PM - 04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Consultation Reason</label>
                  <textarea
                    rows={3}
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Briefly describe your symptoms or visit purpose..."
                    className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-60"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to Firestore...</span>
                    </>
                  ) : (
                    <span>Submit Appointment Request</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Patient Profile Details</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Your official patient record details connected to HealthDesk.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                <div className="pt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-semibold text-slate-900">{patientName}</span>
                </div>
                <div className="pt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Registered Email</span>
                  <span className="font-semibold text-slate-900">{patientEmail}</span>
                </div>
                <div className="pt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Contact Mobile Number</span>
                  <span className="font-semibold text-emerald-800 font-mono">
                    {userProfile?.phone || currentUser?.phoneNumber || 'Not provided'}
                  </span>
                </div>
                <div className="pt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Account Role</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {userProfile?.role || 'patient'}
                  </span>
                </div>
                <div className="pt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Patient Identifier</span>
                  <span className="font-mono text-xs text-slate-700">{userProfile?.firebaseUID || userProfile?._id || 'PAT-LOCAL-01'}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

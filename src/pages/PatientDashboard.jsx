import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import {
  Activity,
  Calendar,
  CalendarPlus,
  User,
  Clock,
  CheckCircle2,
  Stethoscope,
  Shield,
  FileText,
  AlertCircle,
  Loader2,
  Building2,
  Phone,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments } from '../api/appointmentApi';
import {
  subscribePatientAppointments,
  bookAppointmentInFirestore,
} from '../firebase/firestoreService';
import PatientLayout from '../components/layout/PatientLayout';

export const PatientDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'book' | 'profile'
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const [bookingData, setBookingData] = useState({
    department: 'Cardiology (Heart & Circulation)',
    doctor: 'Dr. Rajesh Sharma',
    date: '2026-09-18',
    timeSlot: '10:00 AM - 10:30 AM',
    notes: '',
  });

  const patientName = userProfile?.name || currentUser?.displayName || 'Patient';
  const patientEmail = userProfile?.email || currentUser?.email || 'patient@sanjeevani-hospital.in';
  const patientPhone = userProfile?.phone || '+91 98765 43210';

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
        doctor: 'Dr. Rajesh Sharma',
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

  return (
    <PatientLayout
      title="Patient Health Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      <div id="patient-dashboard-content" className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 border border-white/10">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sanjeevani Care Patient Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Namaste, {patientName}!
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl">
              Welcome to your digital health desk. Browse top specialist doctors, check real-time OPD availability, and manage your consultation schedules.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/patient/doctors"
              id="patient-dashboard-btn-doctors"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              <span>Find Doctors</span>
            </Link>
            <Link
              to="/appointments/book"
              id="patient-dashboard-btn-book"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                My Appointments
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{appointments.length}</span>
              <Link
                to="/patient/my-appointments"
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                View Details &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Super-Specialists
              </span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">50+</span>
              <Link
                to="/patient/doctors"
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Browse OPD &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Emergency Helpline
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-lg font-bold text-rose-700 font-mono">1066</span>
              <span className="text-xs font-semibold text-slate-400">24/7 Trauma Care</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            My Consultations ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'book'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Quick Slot Booking
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Patient Health Profile
          </button>
        </div>

        {/* TAB 1: Appointments List */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Registered Consultations</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized with hospital database & real-time scheduling desk
                </p>
              </div>
              <Link
                to="/appointments/book"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Booking</span>
              </Link>
            </div>

            {loadingAppts ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                Retrieving your consultation records...
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">No Appointments Scheduled</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You currently have no active appointments booked at Sanjeevani Hospital.
                  </p>
                </div>
                <Link
                  to="/patient/doctors"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition shadow-xs"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Browse Specialist Doctors</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.map((appt) => {
                  const isPending = appt.status === 'pending';
                  const isConfirmed = appt.status === 'confirmed';

                  return (
                    <div key={appt.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{appt.doctorName}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isConfirmed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isPending ? 'Pending Admin Approval' : appt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{appt.department}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            {appt.date}
                          </span>
                          <span className="flex items-center gap-1.5 font-mono text-emerald-700 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            {appt.timeSlot}
                          </span>
                        </div>
                        {appt.notes && (
                          <p className="text-[11px] text-slate-500 italic pt-1">
                            Note: "{appt.notes}"
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <Link
                          to="/patient/my-appointments"
                          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Quick Booking Form */}
        {activeTab === 'book' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
            <div className="max-w-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule New Consultation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct submission to the hospital appointment desk.
                </p>
              </div>

              {bookingError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {bookingSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{bookingSuccess}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Speciality Department
                  </label>
                  <select
                    value={bookingData.department}
                    onChange={(e) => setBookingData({ ...bookingData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="Cardiology (Heart & Circulation)">Cardiology (Heart & Vascular)</option>
                    <option value="Neurology & Brain Sciences">Neurology & Brain Sciences</option>
                    <option value="Orthopedics & Joint Replacement">Orthopedics & Joint Replacement</option>
                    <option value="Pediatrics & Child Health">Pediatrics & Child Care</option>
                    <option value="Dermatology & Skin Care">Dermatology & Skin Care</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Time Slot
                    </label>
                    <select
                      value={bookingData.timeSlot}
                      onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                      <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                      <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                      <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                      <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Symptoms or Clinical Notes
                  </label>
                  <textarea
                    rows={3}
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Briefly describe what you'd like to consult about..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {bookingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Confirm & Reserve Slot</span>
                  </button>
                  <Link
                    to="/patient/doctors"
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Browse All Doctors
                  </Link>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: Patient Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 max-w-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Health Dossier</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Registered identity & hospital records access
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{patientName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                  <p className="font-medium text-slate-800 mt-0.5">{patientEmail}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Mobile</span>
                  <p className="font-mono font-medium text-slate-800 mt-0.5">{patientPhone}</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <span>Sanjeevani Verified Patient</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                  Your profile is authorized to book appointments online with zero advance consultation charge. Payments can be settled at the hospital OPD desk upon check-in.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
};
export default PatientDashboard;

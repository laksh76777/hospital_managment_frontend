import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorById } from '../../api/doctorApi';
import { bookAppointment, getBookedSlots } from '../../api/appointmentApi';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import Navbar from '../../components/Navbar';
import {
  format,
  addDays,
  startOfDay,
  isSameDay,
  isToday,
  isTomorrow,
} from 'date-fns';
import {
  Stethoscope,
  Calendar,
  Clock,
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  User,
  ShieldCheck,
  ChevronRight,
  Building2,
  CalendarDays,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Generate next 14 calendar dates starting today
  const upcomingDates = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, i) => addDays(today, i));
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch doctor details
  const loadDoctor = async () => {
    try {
      setLoading(true);
      const res = await getDoctorById(id);
      if (res.success && res.data) {
        setDoctor(res.data);

        // Find the first date among the 14 dates that has available slots
        const firstAvailableDate = upcomingDates.find((date) => {
          const weekday = format(date, 'EEE');
          const dayAvail = (res.data.availability || []).find(
            (a) => a.day?.toLowerCase() === weekday.toLowerCase()
          );
          return dayAvail && dayAvail.slots && dayAvail.slots.length > 0;
        });

        if (firstAvailableDate) {
          setSelectedDate(firstAvailableDate);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctor();
  }, [id]);

  // Fetch booked slots whenever doctor or selectedDate changes
  useEffect(() => {
    const fetchReserved = async () => {
      if (!doctor || !selectedDate) {
        setBookedSlots([]);
        return;
      }
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const res = await getBookedSlots(doctor._id || doctor.id, dateStr);
        if (res.success && Array.isArray(res.data)) {
          setBookedSlots(res.data.map((s) => s.trim().toLowerCase()));
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        console.warn('Failed to load booked slots:', err.message);
        setBookedSlots([]);
      }
    };
    fetchReserved();
  }, [doctor, selectedDate]);

  // Selected date weekday representation
  const selectedWeekday = useMemo(() => {
    return format(selectedDate, 'EEE'); // e.g. 'Mon', 'Tue'
  }, [selectedDate]);

  // Available slots for the selected date based on doctor's weekly template
  const daySchedule = useMemo(() => {
    if (!doctor || !doctor.availability) return null;
    return doctor.availability.find(
      (a) => a.day?.toLowerCase() === selectedWeekday.toLowerCase()
    );
  }, [doctor, selectedWeekday]);

  const availableSlots = useMemo(() => {
    if (!daySchedule || !Array.isArray(daySchedule.slots)) return [];
    return daySchedule.slots.map((s) => (typeof s === 'string' ? s : s.time));
  }, [daySchedule]);

  // Count open unreserved slots
  const openSlotsCount = useMemo(() => {
    return availableSlots.filter((s) => !bookedSlots.includes(s.trim().toLowerCase())).length;
  }, [availableSlots, bookedSlots]);

  // Handle clicking a slot
  const handleSlotClick = (slotTime) => {
    if (bookedSlots.includes(slotTime.trim().toLowerCase())) return;
    setSelectedSlot(slotTime);
    setBookingError(null);
    setIsConfirmModalOpen(true);
  };

  // Submit appointment booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!userProfile) {
      toast.error('Please sign in or use Demo Patient to book an appointment');
      navigate('/signin', { state: { from: location } });
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    const toastId = toast.loading('Reserving consultation slot with hospital...');
    try {
      const payload = {
        doctorId: doctor._id || doctor.id,
        appointmentDate: selectedDate.toISOString(),
        time: selectedSlot,
        notes: notes.trim(),
      };

      const res = await bookAppointment(payload);

      toast.success(res.message || 'Appointment booked successfully!', { id: toastId });
      setIsConfirmModalOpen(false);
      setNotes('');

      // Refresh doctor data
      await loadDoctor();

      // Prompt to view booking
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-800 font-medium">Consultation reserved!</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/patient/my-appointments');
              }}
              className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              View My Appointments
            </button>
          </div>
        ),
        { duration: 6000 }
      );
    } catch (err) {
      console.error('Booking failed:', err);
      const isConflict =
        err.response?.status === 409 ||
        err.message?.includes('already') ||
        err.message?.includes('just been booked');

      const message = isConflict
        ? 'This slot has just been booked. Please choose another available slot.'
        : err.response?.data?.message || err.message || 'Failed to book appointment';

      setBookingError(message);
      toast.error(message, { id: toastId });

      // Refresh doctor availability to reflect recent changes
      loadDoctor();
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader message="Loading doctor profile and available consultation slots..." />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-xs">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900">Doctor Profile Not Found</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              The requested medical practitioner may have been relocated or is currently inactive.
            </p>
            <Link
              to="/patient/doctors"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Doctor Directory</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="doctor-profile-page" className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      {/* Indian Hospital Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 text-white text-xs py-2 px-4 border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold tracking-wide">Sanjeevani Multi-Speciality Hospital & Research Institute</span>
            <span className="hidden md:inline text-emerald-300/80">• Sector 62, Institutional Area, Noida, Delhi NCR - 201309</span>
          </div>
          <div className="text-emerald-300 font-mono text-[11px]">
            IST (UTC+5:30) • Department of Clinical Consultations
          </div>
        </div>
      </div>

      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/patient/doctors"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Back to all doctors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <Link to="/patient/doctors" className="hover:underline">Specialist Directory</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Doctor Profile & Booking</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                {doctor.name}
              </h1>
            </div>
          </div>

          <Link
            to="/patient/my-appointments"
            id="btn-header-my-bookings"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>My Bookings</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Doctor Identity Card */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-600 text-white flex items-center justify-center font-bold text-3xl shadow-xs shrink-0">
                {doctor.name?.replace('Dr.', '').trim().charAt(0)}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900">{doctor.name}</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Medical Faculty
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                    {doctor.specialization}
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doctor.department || 'Clinical Speciality'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doctor.experienceYears ? `${doctor.experienceYears} Years Clinical Experience` : 'Senior Consultant'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 max-w-2xl pt-1">
                  Department of {doctor.specialization} at Sanjeevani Multi-Speciality Hospital & Research Institute. Consultations follow rigorous clinical guidelines with dedicated digital medical history tracking.
                </p>
              </div>
            </div>

            {/* Fee Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shrink-0 text-left md:text-right">
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Consultation Fee</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                ₹{doctor.fees || 500}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Per outpatient visit (Inclusive of GST)</span>
            </div>
          </div>
        </section>

        {/* Real Calendar Date Selection & Slot Booking Section */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                Select Consultation Date (Next 14 Days)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose an upcoming calendar date to inspect Doctor's clinical schedule and open slots
              </p>
            </div>
            <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 self-start sm:self-auto">
              Current Date: {format(selectedDate, 'EEE, MMM d, yyyy')}
            </div>
          </div>

          {/* Horizontal Scrollable Calendar Strip of 14 Days */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Scroll horizontally to view upcoming dates:</span>
              <span className="text-slate-400">Indian Standard Time (IST)</span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200">
              {upcomingDates.map((dateItem) => {
                const isSelected = isSameDay(dateItem, selectedDate);
                const dayName = format(dateItem, 'EEE');
                const dateNumber = format(dateItem, 'd');
                const monthName = format(dateItem, 'MMM');
                const isTodayDate = isToday(dateItem);
                const isTomorrowDate = isTomorrow(dateItem);

                // Check if doctor has schedule on this weekday
                const hasSchedule = (doctor.availability || []).some(
                  (a) => a.day?.toLowerCase() === dayName.toLowerCase() && a.slots && a.slots.length > 0
                );

                return (
                  <button
                    key={dateItem.toISOString()}
                    id={`btn-date-${format(dateItem, 'yyyy-MM-dd')}`}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dateItem);
                      setBookingError(null);
                    }}
                    className={`flex flex-col items-center justify-center min-w-[84px] py-3.5 px-2 rounded-2xl border transition-all text-center shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300'
                        : hasSchedule
                        ? 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                    }`}
                  >
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                      isSelected ? 'text-indigo-100' : 'text-slate-500'
                    }`}>
                      {isTodayDate ? 'Today' : isTomorrowDate ? 'Tmrw' : dayName}
                    </span>
                    <span className="text-xl font-bold my-0.5">{dateNumber}</span>
                    <span className={`text-[11px] ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {monthName}
                    </span>

                    {/* Dot indicating schedule */}
                    <div className="mt-1">
                      {hasSchedule ? (
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                      ) : (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Area for the Selected Date */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Available Consultation Slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on an open time slot to reserve your appointment
                </p>
              </div>

              {availableSlots.length > 0 && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {openSlotsCount} Available
                  </span>
                  {bookedSlots.length > 0 && (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      {bookedSlots.length} Booked
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* If doctor has no schedule on this weekday */}
            {availableSlots.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-slate-800">
                  No Consultation Hours on {selectedWeekday}s
                </h5>
                <p className="text-xs text-slate-500 mt-1">
                  Dr. {doctor.name} does not hold clinical consultation on this day of the week. Please select another date highlighted above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot.trim().toLowerCase());
                  return (
                    <button
                      key={slot}
                      id={`slot-btn-${slot.replace(/[^a-zA-Z0-9]/g, '-')}`}
                      type="button"
                      disabled={isBooked}
                      onClick={() => handleSlotClick(slot)}
                      className={`p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all group shadow-xs ${
                        isBooked
                          ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/60 focus:ring-2 focus:ring-indigo-500 cursor-pointer'
                      }`}
                    >
                      <span className={`text-sm font-bold ${isBooked ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-indigo-700'}`}>
                        {slot}
                      </span>
                      {isBooked ? (
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          Reserved
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Available
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Booking Confirmation Dialog Modal */}
      {isConfirmModalOpen && (
        <div
          id="booking-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Appointment Verification
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Confirm Consultation Slot
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setBookingError(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner inside modal if 409 collision occurred */}
            {bookingError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Slot Unavailable</span>
                  <span>{bookingError}</span>
                </div>
              </div>
            )}

            {/* Consultation Summary Cards */}
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Specialist Doctor:</span>
                  <span className="font-bold text-slate-900">{doctor.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Specialization & Dept:</span>
                  <span className="font-semibold text-slate-800">{doctor.specialization} ({doctor.department})</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Hospital Campus:</span>
                  <span className="font-semibold text-slate-800">Sanjeevani Multi-Speciality, Noida</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200">
                  <span className="text-slate-700 font-semibold">Appointment Date:</span>
                  <span className="font-bold text-indigo-700 text-sm">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-700 font-semibold">Reserved Time Slot:</span>
                  <span className="font-bold text-indigo-700 text-sm">{selectedSlot} (IST)</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Total Consultation Fee:</span>
                  <span className="text-base font-extrabold text-emerald-700">₹{doctor.fees || 500}</span>
                </div>
              </div>

              {/* Patient Details Snapshot */}
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Patient: <strong className="text-slate-900">{userProfile?.name || 'Registered Patient'}</strong></span>
                </div>
                <span className="text-[11px] text-slate-500">{userProfile?.email}</span>
              </div>

              {/* Patient Notes */}
              <div className="space-y-1.5">
                <label
                  htmlFor="booking-notes-input"
                  className="text-xs font-semibold text-slate-700 block"
                >
                  Clinical Reason / Symptoms (Optional):
                </label>
                <textarea
                  id="booking-notes-input"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Routine blood pressure follow-up, mild chest uneasiness, prescription review..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setBookingError(null);
                }}
                disabled={bookingLoading}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-appointment-submit"
                type="button"
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-60"
              >
                {bookingLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Reserving Slot...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Book (₹{doctor.fees || 500})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

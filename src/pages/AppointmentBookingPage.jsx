import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Calendar, CheckCircle2, Clock, User, Phone, ShieldCheck, Stethoscope, AlertCircle, Building2 } from 'lucide-react';
import { getDoctors } from '../api/doctorApi';
import { bookAppointment, getBookedSlots } from '../api/appointmentApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, addDays, startOfDay } from 'date-fns';
import PatientLayout from '../components/layout/PatientLayout';

export default function AppointmentBookingPage() {
  const navigate = useNavigate();
  const { userProfile, isAuthenticated } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Today in YYYY-MM-DD
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    patientName: userProfile?.name || '',
    patientEmail: userProfile?.email || '',
    patientPhone: userProfile?.phone || '',
    doctorId: '',
    date: todayStr,
    timeSlot: '',
    notes: '',
  });

  const [submittedAppointment, setSubmittedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill user data when userProfile is loaded
  useEffect(() => {
    if (userProfile) {
      setFormData((prev) => ({
        ...prev,
        patientName: prev.patientName || userProfile.name || '',
        patientEmail: prev.patientEmail || userProfile.email || '',
        patientPhone: prev.patientPhone || userProfile.phone || '',
      }));
    }
  }, [userProfile]);

  // Load real doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await getDoctors();
        if (res.success && Array.isArray(res.data)) {
          setDoctors(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              doctorId: prev.doctorId || res.data[0]._id || res.data[0].id,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
        toast.error('Could not load doctors from hospital server');
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch booked slots whenever doctor or date changes
  useEffect(() => {
    const fetchReservedSlots = async () => {
      if (!formData.doctorId || !formData.date) {
        setBookedSlots([]);
        return;
      }
      try {
        const res = await getBookedSlots(formData.doctorId, formData.date);
        if (res.success && Array.isArray(res.data)) {
          setBookedSlots(res.data.map((s) => s.trim().toLowerCase()));
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        console.warn('Could not load booked slots:', err.message);
        setBookedSlots([]);
      }
    };
    fetchReservedSlots();
  }, [formData.doctorId, formData.date]);

  // Currently selected doctor
  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => (d._id || d.id) === formData.doctorId) || null;
  }, [doctors, formData.doctorId]);

  // Compute all scheduled slots for selected doctor and selected date
  const allScheduledSlots = useMemo(() => {
    if (!selectedDoctor || !formData.date) return [];
    try {
      const parsedDate = new Date(formData.date + 'T00:00:00');
      const weekday = format(parsedDate, 'EEE'); // Mon, Tue, etc.
      const dayAvail = (selectedDoctor.availability || []).find(
        (a) => a.day?.toLowerCase() === weekday.toLowerCase()
      );
      if (!dayAvail || !Array.isArray(dayAvail.slots)) return [];
      return dayAvail.slots.map((s) => (typeof s === 'string' ? s : s.time));
    } catch {
      return [];
    }
  }, [selectedDoctor, formData.date]);

  // Available non-booked slots
  const openSlots = useMemo(() => {
    return allScheduledSlots.filter(
      (slot) => !bookedSlots.includes(slot.trim().toLowerCase())
    );
  }, [allScheduledSlots, bookedSlots]);

  // Auto-select first open slot when slots change
  useEffect(() => {
    if (openSlots.length > 0) {
      if (!formData.timeSlot || bookedSlots.includes(formData.timeSlot.trim().toLowerCase())) {
        setFormData((prev) => ({ ...prev, timeSlot: openSlots[0] }));
      }
    } else {
      setFormData((prev) => ({ ...prev, timeSlot: '' }));
    }
  }, [openSlots, bookedSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.doctorId) {
      setError('Please select a doctor');
      return;
    }
    if (!formData.timeSlot) {
      setError('Please select an available consultation time slot');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Reserving consultation slot...');
    try {
      const payload = {
        doctorId: formData.doctorId,
        appointmentDate: new Date(formData.date + 'T00:00:00').toISOString(),
        time: formData.timeSlot,
        notes: formData.notes?.trim() || '',
      };

      const res = await bookAppointment(payload);
      toast.success(res.message || 'Appointment booked successfully!', { id: toastId });
      setSubmittedAppointment(res.data || {
        doctorName: selectedDoctor?.name,
        date: formData.date,
        time: formData.timeSlot,
        fee: selectedDoctor?.fees || 800,
      });
    } catch (err) {
      console.error('Booking error:', err);
      const msg = err.status === 409
        ? 'This slot has just been booked. Please choose another slot.'
        : err.message || 'Failed to book appointment';
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatientLayout
      title="Book Outpatient Consultation"
      breadcrumbs={[{ label: 'Book Appointment' }]}
    >
      <div id="booking-slots-page" className="p-4 sm:p-8 max-w-3xl mx-auto">

        {submittedAppointment ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Your consultation has been reserved with <strong>{selectedDoctor?.name || 'the physician'}</strong> in <strong>{selectedDoctor?.department || 'Outpatient Clinic'}</strong> on <strong>{formData.date}</strong> at <strong>{formData.timeSlot}</strong>.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200 max-w-sm mx-auto text-left space-y-1.5">
              <div className="flex justify-between">
                <span>Doctor:</span>
                <span className="font-semibold text-slate-800">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-semibold text-slate-800">{formData.date} • {formData.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span>Consultation Fee:</span>
                <span className="font-bold text-emerald-700">₹{selectedDoctor?.fees || 800}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-amber-600 uppercase">Pending Confirmation</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => navigate('/patient/my-appointments')}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-xs"
              >
                View My Bookings
              </button>
              <button
                onClick={() => {
                  setSubmittedAppointment(null);
                  setFormData((prev) => ({ ...prev, notes: '' }));
                }}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Book Another Slot
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Book Doctor Consultation</h1>
                <p className="text-xs text-slate-500 mt-1">Select your physician and available hospital time slot.</p>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">
                <Building2 className="w-3.5 h-3.5" />
                <span>Sanjeevani Hospital</span>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    placeholder="Patient Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.patientEmail}
                    onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Physician / Specialist</label>
                {loadingDoctors ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                    Loading hospital medical roster...
                  </div>
                ) : (
                  <select
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value, timeSlot: '' })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {doctors.map((doc) => (
                      <option key={doc._id || doc.id} value={doc._id || doc.id}>
                        {doc.name} — {doc.specialization} ({doc.department || 'Clinical Care'}) • ₹{doc.fees || 800}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Doctor Details Pill */}
              {selectedDoctor && (
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold text-slate-900">{selectedDoctor.name}</span>
                    <span className="text-slate-500">({selectedDoctor.specialization})</span>
                  </div>
                  <span className="font-bold text-teal-800">Fee: ₹{selectedDoctor.fees || 800}</span>
                </div>
              )}

              {/* Consultation Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Date</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Available Slots */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Available Time Slot ({openSlots.length} open{bookedSlots.length > 0 ? `, ${bookedSlots.length} booked` : ''})
                  </label>
                  {allScheduledSlots.length > 0 ? (
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      {allScheduledSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot.trim().toLowerCase());
                        return (
                          <option key={slot} value={slot} disabled={isBooked}>
                            {slot} (IST) {isBooked ? '— [RESERVED / BOOKED]' : ''}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="p-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-500">
                      Doctor has no consultation hours on this weekday.
                    </div>
                  )}
                </div>
              </div>

              {/* Slots preview chips */}
              {allScheduledSlots.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Quick slot picker:</span>
                  <div className="flex flex-wrap gap-2">
                    {allScheduledSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot.trim().toLowerCase());
                      const isSelected = formData.timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setFormData({ ...formData, timeSlot: slot })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                            isBooked
                              ? 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/40'
                          }`}
                        >
                          <span>{slot}</span>
                          {isBooked && (
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded no-underline">
                              Booked
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Visit / Symptoms (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Regular health checkup, fever since yesterday..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || openSlots.length === 0}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-700/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Reserving Slot...' : `Confirm & Book Appointment (₹${selectedDoctor?.fees || 800})`}
              </button>
            </form>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

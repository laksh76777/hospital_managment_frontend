import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorSchedule } from '../../api/doctorApi';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Stethoscope,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Building2,
  ChevronRight,
} from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DoctorSchedule() {
  const { userProfile } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Mon');

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const res = await getDoctorSchedule();
      if (res.success && Array.isArray(res.data)) {
        setSchedule(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load doctor weekly timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const totalSlots = schedule.reduce((acc, d) => acc + (d.slots ? d.slots.length : 0), 0);
  const currentDayData = schedule.find((d) => d.day?.toLowerCase() === activeDay.toLowerCase());
  const currentSlots = currentDayData?.slots || [];

  return (
    <div id="doctor-schedule-page" className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      {/* Indian Hospital Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 text-white text-xs py-2 px-4 border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold tracking-wide">Sanjeevani Multi-Speciality Hospital & Research Institute</span>
            <span className="hidden md:inline text-emerald-300/80">• Sector 62, Institutional Area, Noida, Delhi NCR - 201309</span>
          </div>
          <div className="text-emerald-300 font-mono text-[11px]">
            IST (UTC+5:30) • Doctor OPD Roster
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/doctor/appointments"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Back to appointments"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <span>Physician Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Weekly Schedule</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Weekly Consultation Timetable Template
              </h1>
            </div>
          </div>

          <Link
            to="/doctor/appointments"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>View Booked Patient Consultations</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stat Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Weekly Consultation Slots</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">{totalSlots}</div>
            <p className="text-xs text-slate-400 mt-1">Configured across Mon-Sun weekly template</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital Consultation Campus</span>
            <div className="mt-2 text-lg font-bold text-slate-900">OPD Block A, Sector 62, Noida</div>
            <p className="text-xs text-slate-400 mt-1">Sanjeevani Multi-Speciality Hospital</p>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Weekly Consultation Roster</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select a weekday to review consultation hours offered for patient booking
            </p>
          </div>

          {/* Day Tabs */}
          <div className="grid grid-cols-7 gap-2 p-1.5 bg-slate-100 rounded-xl">
            {DAYS.map((day) => {
              const dayItem = schedule.find((d) => d.day?.toLowerCase() === day.toLowerCase());
              const count = dayItem?.slots ? dayItem.slots.length : 0;
              const isActive = activeDay === day;

              return (
                <button
                  key={day}
                  id={`tab-doc-schedule-${day}`}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={`py-3 px-1 text-center rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 font-bold shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <div className="text-xs uppercase font-semibold">{day}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {count} {count === 1 ? 'slot' : 'slots'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Slot Grid for Active Day */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Slots Offered on {activeDay}s ({currentSlots.length})
              </h4>
            </div>

            {loading ? (
              <div className="p-8">
                <Loader message="Loading consultation timetable..." />
              </div>
            ) : currentSlots.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={CalendarDays}
                  title={`No consultation hours for ${activeDay}s`}
                  description="Contact hospital administration to configure or expand your weekly OPD timetable slots."
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {currentSlots.map((slot, index) => {
                  const slotTime = typeof slot === 'string' ? slot : slot.time;
                  return (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-xs"
                    >
                      <div className="text-sm font-bold text-slate-900">{slotTime}</div>
                      <span className="text-[10px] font-semibold text-emerald-600 flex items-center justify-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Weekly Slot
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

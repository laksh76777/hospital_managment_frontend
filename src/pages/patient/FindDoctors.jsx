import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoctors } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Navbar from '../../components/Navbar';
import {
  Search,
  Filter,
  Stethoscope,
  Calendar,
  Clock,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const SPECIALIZATIONS = [
  'All',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'General Medicine',
  'Gastroenterology',
];

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDoctors = async (specialization) => {
    try {
      setLoading(true);
      const res = await getDoctors(
        specialization === 'All' ? undefined : specialization
      );
      if (res.success && Array.isArray(res.data)) {
        setDoctors(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load doctor directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors(selectedSpecialty);
  }, [selectedSpecialty]);

  const filteredDoctors = doctors.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = doc.name?.toLowerCase().includes(q);
    const specMatch = doc.specialization?.toLowerCase().includes(q);
    const deptMatch = doc.department?.toLowerCase().includes(q);
    return nameMatch || specMatch || deptMatch;
  });

  return (
    <div id="find-doctors-page" className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      {/* Hospital Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 text-white text-xs py-2 px-4 border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold tracking-wide">Sanjeevani Multi-Speciality Hospital & Research Institute</span>
            <span className="hidden md:inline text-emerald-300/80">• Sector 62, Institutional Area, Noida, Delhi NCR - 201309</span>
          </div>
          <div className="text-emerald-300 font-mono text-[11px]">
            IST (UTC+5:30) • NABH & JCI Accredited
          </div>
        </div>
      </div>

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <Link to="/" className="hover:underline">HealthDesk</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Patient Portal</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">Find & Book Specialist Doctors</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/patient/my-appointments"
              id="btn-nav-my-appointments"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>My Appointments</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search & Filters Card */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-doctors-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name (e.g. Dr. Rajesh Sharma), department, or condition..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Quick Result Indicator */}
            <div className="text-xs text-slate-500 shrink-0">
              Showing <span className="font-semibold text-slate-800">{filteredDoctors.length}</span> verified consultants
            </div>
          </div>

          {/* Specialty Filter Badges */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Department:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {SPECIALIZATIONS.map((spec) => {
                const isActive = selectedSpecialty === spec;
                return (
                  <button
                    key={spec}
                    id={`filter-spec-${spec.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Doctors Grid */}
        <section>
          {loading ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <Loader message="Searching specialist physicians & OPD schedules..." />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-xl mx-auto">
              <EmptyState
                icon={Stethoscope}
                title="No specialist doctors found"
                description={
                  searchQuery || selectedSpecialty !== 'All'
                    ? 'No doctors match the selected specialization department or search criteria.'
                    : 'No doctors are currently available for consultation.'
                }
                actionText={searchQuery || selectedSpecialty !== 'All' ? 'Clear Filters' : undefined}
                onAction={
                  searchQuery || selectedSpecialty !== 'All'
                    ? () => {
                        setSelectedSpecialty('All');
                        setSearchQuery('');
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => {
                const doctorId = doctor._id || doctor.id;
                // Calculate available days count
                const daysAvailable = (doctor.availability || []).filter((a) => a.slots && a.slots.length > 0);

                return (
                  <div
                    key={doctorId}
                    id={`doctor-card-${doctorId}`}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                            {doctor.name?.replace('Dr.', '').trim().charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                                {doctor.name}
                              </h3>
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Medical Practitioner" />
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mt-0.5">
                              {doctor.specialization}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Department & Experience */}
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-700">{doctor.department || 'Clinical Department'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{doctor.experienceYears ? `${doctor.experienceYears} Years Experience` : 'Senior Consultant'}</span>
                        </div>
                      </div>

                      {/* Weekly Availability Summary */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Consultation Days:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => {
                            const isOffered = (doctor.availability || []).some(
                              (a) => a.day?.toLowerCase() === d.toLowerCase() && a.slots?.length > 0
                            );
                            return (
                              <span
                                key={d}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                  isOffered
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {d}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Consultation Fee</span>
                        <div className="text-base font-bold text-slate-900">
                          ₹{doctor.fees || 500}
                          <span className="text-[11px] font-normal text-slate-500 ml-1">/ visit</span>
                        </div>
                      </div>

                      <Link
                        to={`/patient/doctors/${doctorId}`}
                        id={`btn-view-doctor-${doctorId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs group-hover:shadow-indigo-200"
                      >
                        <span>Select Date & Slot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoctors } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import PatientLayout from '../../components/layout/PatientLayout';
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
    <PatientLayout
      title="Find & Book Specialist Doctors"
      breadcrumbs={[{ label: 'Specialist Doctors' }]}
    >
      <div id="find-doctors-content" className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Search & Filters Section */}
        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-doctors-input"
                type="text"
                placeholder="Search by doctor name (e.g. Dr. Rajesh Sharma), department, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
              />
            </div>

            <div className="text-xs font-medium text-slate-500 self-end md:self-auto">
              Showing <span className="font-bold text-slate-900">{filteredDoctors.length}</span> verified consultants
            </div>
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>DEPARTMENT:</span>
            </div>
            {SPECIALIZATIONS.map((spec) => {
              const isSelected = selectedSpecialty === spec;
              return (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>
        </section>

        {/* Doctor Grid */}
        <section>
          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs flex justify-center">
              <Loader message="Loading verified medical specialists..." />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Specialist Doctors Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No specialists matched your filter or search query. Try clearing the filter or searching for another condition.
              </p>
              <button
                onClick={() => {
                  setSelectedSpecialty('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDoctors.map((doctor) => {
                const doctorId = doctor._id || doctor.id;
                const initials = doctor.name
                  ? doctor.name
                      .split(' ')
                      .filter((n) => n.length > 0)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                  : 'DR';

                return (
                  <div
                    key={doctorId}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Doctor Avatar & Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm border border-emerald-100 shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-900 text-sm truncate">
                              {doctor.name}
                            </h3>
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Consultant" />
                          </div>
                          <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                            {doctor.specialization}
                          </span>
                        </div>
                      </div>

                      {/* Department & Experience */}
                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{doctor.department || 'Clinical Medicine'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{doctor.experience || 8}+ Years Senior Consultant</span>
                        </div>
                      </div>

                      {/* OPD Days Pills */}
                      <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          OPD Consultation Days:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(doctor.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((d) => (
                            <span
                              key={d}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Fee & Booking CTA */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Consultation Fee</span>
                        <div className="text-base font-bold text-slate-900">
                          ₹{doctor.fees || 800}
                          <span className="text-[11px] font-normal text-slate-500 ml-1">/ visit</span>
                        </div>
                      </div>

                      <Link
                        to={`/patient/doctors/${doctorId}`}
                        id={`btn-view-doctor-${doctorId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs cursor-pointer"
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
      </div>
    </PatientLayout>
  );
}

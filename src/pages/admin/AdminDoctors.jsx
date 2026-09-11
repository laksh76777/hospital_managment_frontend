import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateDoctorAvailability,
} from '../../api/doctorApi';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import Navbar from '../../components/Navbar';
import {
  Users,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CalendarCheck,
  Search,
  CheckCircle2,
  X,
  Stethoscope,
  IndianRupee,
  Briefcase,
  AlertCircle,
  ChevronRight,
  Shield,
  Building2,
  MapPin,
  Loader2,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AdminDoctors() {
  const { userProfile } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);

  // Submitting states to prevent double-submissions
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [submittingAvail, setSubmittingAvail] = useState(false);

  // Custom ConfirmDialog state for doctor deletion
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [isDeleting, setIsDeleting] = useState(false);

  // Field-level validation error maps
  const [addFormErrors, setAddFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

  // Add doctor form state with Indian medical context defaults
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'Cardiology',
    department: 'Cardiology (Heart & Vascular)',
    experience: 8,
    fees: 800,
    phone: '',
  });

  // Edit availability state (Mon-Sun weekly template)
  const [activeDay, setActiveDay] = useState('Mon');
  const [newSlotTime, setNewSlotTime] = useState('10:00 AM');
  const [availabilityData, setAvailabilityData] = useState([]);

  // Fetch doctors using doctorApi (via configured Axios instance)
  const loadDoctors = async () => {
    try {
      setLoading(true);
      const res = await getAdminDoctors();
      if (res.success && Array.isArray(res.data)) {
        setDoctors(res.data);
      } else if (Array.isArray(res.data)) {
        setDoctors(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch doctor roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  // Handle Add Doctor with validation error toast
  // Handle Add Doctor Submit with Zod field-level validation mapping
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setAddFormErrors({});

    if (!formData.name.trim() || !formData.email.trim()) {
      setAddFormErrors((prev) => ({
        ...prev,
        name: !formData.name.trim() ? 'Doctor name is required' : undefined,
        email: !formData.email.trim() ? 'Email address is required' : undefined,
      }));
      toast.error('Please complete required fields');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setAddFormErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters' }));
      toast.error('Temporary password must be at least 6 characters');
      return;
    }

    setSubmittingAdd(true);
    const toastId = toast.loading('Registering doctor & provisioning credentials...');
    try {
      const res = await createDoctor({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        specialization: formData.specialization.trim(),
        department: formData.department.trim(),
        experience: Number(formData.experience) || 0,
        fees: Number(formData.fees) || 0,
        phone: formData.phone?.trim() || '',
      });

      toast.success(res.message || 'Doctor created successfully!', { id: toastId });
      setIsAddModalOpen(false);
      setAddFormErrors({});
      setFormData({
        name: '',
        email: '',
        password: '',
        specialization: 'Cardiology',
        department: 'Cardiology (Heart & Vascular)',
        experience: 8,
        fees: 800,
        phone: '',
      });
      loadDoctors();
    } catch (err) {
      const fieldErrors = err.response?.data?.fieldErrors || {};
      setAddFormErrors(fieldErrors);
      toast.error(err.message || 'Validation error creating doctor', { id: toastId });
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Open Edit Profile
  const openEditModal = (doctor) => {
    setCurrentDoctor(doctor);
    setEditFormErrors({});
    setFormData({
      name: doctor.name || '',
      email: doctor.userRef?.email || doctor.email || '',
      password: '',
      specialization: doctor.specialization || 'General Medicine',
      department: doctor.department || 'General Medicine',
      experience: doctor.experience || 0,
      fees: doctor.fees || 700,
      phone: doctor.userRef?.phone || doctor.phone || '',
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Profile Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormErrors({});
    setSubmittingEdit(true);
    const toastId = toast.loading('Updating doctor profile...');
    try {
      await updateDoctor(currentDoctor._id || currentDoctor.id, {
        name: formData.name.trim(),
        specialization: formData.specialization.trim(),
        department: formData.department.trim(),
        experience: Number(formData.experience),
        fees: Number(formData.fees),
        phone: formData.phone?.trim() || '',
      });
      toast.success('Doctor profile updated successfully', { id: toastId });
      setIsEditModalOpen(false);
      setEditFormErrors({});
      loadDoctors();
    } catch (err) {
      const fieldErrors = err.response?.data?.fieldErrors || {};
      setEditFormErrors(fieldErrors);
      toast.error(err.message || 'Failed to update doctor', { id: toastId });
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Open Availability modal (weekly template, no isBooked field stored)
  const openAvailabilityModal = (doctor) => {
    setCurrentDoctor(doctor);
    const rawAvail = doctor.availability || [];
    const normalized = DAYS_OF_WEEK.map((day) => {
      const found = rawAvail.find((a) => a.day?.toLowerCase() === day.toLowerCase());
      return {
        day,
        slots: found && Array.isArray(found.slots)
          ? found.slots.map((s) => ({ time: typeof s === 'string' ? s : s.time }))
          : [],
      };
    });
    setAvailabilityData(normalized);
    setActiveDay('Mon');
    setIsAvailabilityModalOpen(true);
  };

  // Add slot to active day
  const handleAddSlot = () => {
    if (!newSlotTime.trim()) return;
    setAvailabilityData((prev) =>
      prev.map((item) => {
        if (item.day === activeDay) {
          const exists = item.slots.some((s) => s.time.toLowerCase() === newSlotTime.trim().toLowerCase());
          if (exists) {
            toast.error('Slot already exists for this day');
            return item;
          }
          return {
            ...item,
            slots: [...item.slots, { time: newSlotTime.trim() }],
          };
        }
        return item;
      })
    );
  };

  // Remove slot from active day
  const handleRemoveSlot = (time) => {
    setAvailabilityData((prev) =>
      prev.map((item) => {
        if (item.day === activeDay) {
          return {
            ...item,
            slots: item.slots.filter((s) => s.time !== time),
          };
        }
        return item;
      })
    );
  };

  // Save Availability to backend via PATCH /api/admin/doctors/:id/availability
  const handleSaveAvailability = async () => {
    setSubmittingAvail(true);
    const toastId = toast.loading('Saving weekly availability template...');
    try {
      const cleanAvailability = availabilityData.map((d) => ({
        day: d.day,
        slots: d.slots.map((s) => ({ time: s.time })),
      }));

      await updateDoctorAvailability(currentDoctor._id || currentDoctor.id, cleanAvailability);
      toast.success('Weekly availability schedule saved successfully', { id: toastId });
      setIsAvailabilityModalOpen(false);
      loadDoctors();
    } catch (err) {
      toast.error(err.message || 'Failed to update schedule', { id: toastId });
    } finally {
      setSubmittingAvail(false);
    }
  };

  // Trigger custom in-app ConfirmDialog instead of window.confirm
  const handleDeleteDoctor = (id, name) => {
    setDeleteTarget({ id, name });
  };

  // Confirm delete doctor execution
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const toastId = toast.loading(`Removing ${deleteTarget.name}...`);
    try {
      await deleteDoctor(deleteTarget.id);
      toast.success('Doctor removed successfully', { id: toastId });
      setDoctors((prev) => prev.filter((d) => d._id !== deleteTarget.id && d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete doctor', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      selectedDept === 'All' || doc.department?.toLowerCase().includes(selectedDept.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const activeDaySlots =
    availabilityData.find((a) => a.day === activeDay)?.slots || [];

  return (
    <div id="admin-doctors-container" className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      {/* Indian Hospital Top Bar / Localization Header for Admin */}
      <div id="admin-hospital-banner" className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-semibold text-white">
              Sanjeevani Multi-Speciality Hospital & Research Institute
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:flex items-center text-slate-300">
              <MapPin className="w-3 h-3 text-teal-400 mr-1" />
              Sector 62, Institutional Area, Noida, Delhi NCR - 201309
            </span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono text-[11px]">
              Active Timezone: IST (UTC+5:30)
            </span>
            <span className="hidden lg:inline text-slate-400">
              Admin: <strong className="text-white">{userProfile?.email || 'admin@healthdesk.org'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Header */}
      <header id="admin-doctors-header" className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl border border-teal-100">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
                <Link to="/admin/dashboard" className="hover:underline">Admin Console</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Doctor Management</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">Hospital Medical Staff Roster</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/appointments"
              id="btn-admin-appointments"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <CalendarCheck className="w-4 h-4 text-slate-500" />
              All Appointments
            </Link>
            <button
              id="btn-add-doctor-modal"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Doctor
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filter Bar */}
        <section id="doctor-filters-card" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-doctor-search"
              type="text"
              placeholder="Search by doctor name, dept, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="select-dept-filter" className="text-xs font-semibold text-slate-500 uppercase">
              Department:
            </label>
            <select
              id="select-dept-filter"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="General">General Medicine</option>
              <option value="Gastroenterology">Gastroenterology</option>
            </select>
          </div>
        </section>

        {/* Doctors Table */}
        <div id="doctors-table-card" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900">
              Registered Doctors ({filteredDoctors.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Weekly availability template configured per physician (IST)
            </span>
          </div>

          {loading ? (
            <div className="p-8">
              <Loader message="Loading medical staff directory & schedule templates..." />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Stethoscope}
                title="No doctors found"
                description={
                  searchTerm || selectedDept !== 'All'
                    ? 'No doctors match the selected search query or department filter.'
                    : 'No doctors are currently registered in the medical staff roster.'
                }
                actionText="Add New Doctor"
                onAction={() => setIsAddModalOpen(true)}
                secondaryActionText={searchTerm || selectedDept !== 'All' ? 'Clear Filters' : undefined}
                onSecondaryAction={
                  searchTerm || selectedDept !== 'All'
                    ? () => {
                        setSearchTerm('');
                        setSelectedDept('All');
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table id="admin-doctors-table" className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Doctor</th>
                    <th scope="col" className="px-6 py-3.5">Specialization & Dept</th>
                    <th scope="col" className="px-6 py-3.5">Experience</th>
                    <th scope="col" className="px-6 py-3.5">Consultation Fee</th>
                    <th scope="col" className="px-6 py-3.5">Weekly Schedule</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors.map((doctor) => {
                    const totalSlots = (doctor.availability || []).reduce(
                      (acc, day) => acc + (day.slots ? day.slots.length : 0),
                      0
                    );

                    return (
                      <tr key={doctor._id || doctor.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                              {doctor.name?.replace('Dr.', '').trim().charAt(0) || 'D'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{doctor.name}</div>
                              <div className="text-xs text-slate-500">
                                {doctor.userRef?.email || doctor.email || 'doctor@sanjeevani-hospital.in'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
                            {doctor.specialization}
                          </span>
                          <div className="text-xs text-slate-500 mt-1">{doctor.department}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-800 font-medium">
                            {doctor.experience || doctor.experienceYears || 0} years
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          ₹{doctor.fees || 800}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            id={`btn-avail-${doctor._id || doctor.id}`}
                            onClick={() => openAvailabilityModal(doctor)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            <span>Set Availability ({totalSlots} weekly slots)</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              id={`btn-edit-${doctor._id || doctor.id}`}
                              onClick={() => openEditModal(doctor)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit profile"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-delete-${doctor._id || doctor.id}`}
                              onClick={() => handleDeleteDoctor(doctor._id || doctor.id, doctor.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete doctor"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </main>

      {/* ========================================================
          MODAL 1: ADD DOCTOR (with Zod validation & temp password)
          ======================================================== */}
      {isAddModalOpen && (
        <div id="modal-add-doctor" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900">Add New Doctor</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Doctor Full Name *
                </label>
                <input
                  id="add-doc-name"
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                {addFormErrors.name && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{addFormErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    id="add-doc-email"
                    type="email"
                    required
                    placeholder="doctor@sanjeevani-hospital.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  {addFormErrors.email && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{addFormErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Temporary Password *
                  </label>
                  <input
                    id="add-doc-password"
                    type="text"
                    required
                    placeholder="Min 6 chars (e.g. DocTemp2026!)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  {addFormErrors.password && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{addFormErrors.password}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Specialization *
                  </label>
                  <input
                    id="add-doc-specialization"
                    type="text"
                    required
                    placeholder="e.g. Cardiology"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  {addFormErrors.specialization && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{addFormErrors.specialization}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <input
                    id="add-doc-department"
                    type="text"
                    required
                    placeholder="e.g. Cardiology (Heart & Vascular)"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  {addFormErrors.department && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{addFormErrors.department}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    id="add-doc-experience"
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  {addFormErrors.experience && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{addFormErrors.experience}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Consultation Fee (₹ INR) *
                  </label>
                  <input
                    id="add-doc-fees"
                    type="number"
                    min="0"
                    required
                    value={formData.fees}
                    onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  {addFormErrors.fees && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{addFormErrors.fees}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone (Indian Format)
                </label>
                <input
                  id="add-doc-phone"
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-lg text-xs text-teal-800 flex items-start gap-2 border border-teal-100">
                <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  The doctor account will be created with <strong>mustChangePassword: true</strong> and standard weekly IST consultation availability template slots.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submittingAdd}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-add-doctor"
                  type="submit"
                  disabled={submittingAdd}
                  className="px-5 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingAdd && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{submittingAdd ? 'Creating Doctor...' : 'Create Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: EDIT DOCTOR PROFILE
          ======================================================== */}
      {isEditModalOpen && currentDoctor && (
        <div id="modal-edit-doctor" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Edit Doctor: {currentDoctor.name}</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Doctor Name *
                </label>
                <input
                  id="edit-doc-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                {editFormErrors.name && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{editFormErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Specialization *
                  </label>
                  <input
                    id="edit-doc-specialization"
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  {editFormErrors.specialization && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{editFormErrors.specialization}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <input
                    id="edit-doc-department"
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  {editFormErrors.department && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{editFormErrors.department}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Experience (Years)
                  </label>
                  <input
                    id="edit-doc-experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  {editFormErrors.experience && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{editFormErrors.experience}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Fee (₹ INR) *
                  </label>
                  <input
                    id="edit-doc-fees"
                    type="number"
                    min="0"
                    value={formData.fees}
                    onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  {editFormErrors.fees && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{editFormErrors.fees}</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submittingEdit}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-edit-doctor"
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{submittingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: SET WEEKLY AVAILABILITY (Mon-Sun Weekly Template)
          ======================================================== */}
      {isAvailabilityModalOpen && currentDoctor && (
        <div id="modal-set-availability" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900">Set Weekly Availability</h3>
                <p className="text-xs text-slate-500">
                  {currentDoctor.name} &bull; {currentDoctor.specialization} &bull; Indian Standard Time (IST)
                </p>
              </div>
              <button
                onClick={() => setIsAvailabilityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Day Selector Tabs (Mon - Sun) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Select Day of Week
                </label>
                <div className="grid grid-cols-7 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayItem = availabilityData.find((a) => a.day === day);
                    const slotCount = dayItem ? dayItem.slots.length : 0;
                    const isActive = activeDay === day;

                    return (
                      <button
                        key={day}
                        id={`tab-day-${day}`}
                        type="button"
                        onClick={() => setActiveDay(day)}
                        className={`py-2 px-1 text-center rounded-lg transition-all ${
                          isActive
                            ? 'bg-white text-teal-700 font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                      >
                        <div className="text-xs uppercase">{day}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{slotCount} slots</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Slot Input Bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                <input
                  id="input-new-slot-time"
                  type="text"
                  placeholder="e.g. 10:00 AM or 02:30 PM IST"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="flex-1 text-sm bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <button
                  id="btn-add-slot-action"
                  type="button"
                  onClick={handleAddSlot}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Slot
                </button>
              </div>

              {/* Current Slots for Selected Day */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Weekly Template Slots for {activeDay} ({activeDaySlots.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Weekly template (individual bookings check Appointment collection)
                  </span>
                </div>

                {activeDaySlots.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-sm">
                    No time slots configured for {activeDay}. Add a slot above (e.g. 10:00 AM).
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeDaySlots.map((slot) => (
                      <div
                        key={slot.time}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200"
                      >
                        <Clock className="w-3 h-3 text-teal-600" />
                        <span>{slot.time}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(slot.time)}
                          className="text-teal-700 hover:text-rose-600 transition-colors ml-1 p-0.5"
                          title="Remove slot"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Total weekly slots: {availabilityData.reduce((acc, d) => acc + d.slots.length, 0)}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={submittingAvail}
                    onClick={() => setIsAvailabilityModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-availability-submit"
                    type="button"
                    disabled={submittingAvail}
                    onClick={handleSaveAvailability}
                    className="px-5 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingAvail && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{submittingAvail ? 'Saving...' : 'Save Weekly Availability'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable ConfirmDialog for Doctor Deletion */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Doctor"
        message={`Are you sure you want to remove ${deleteTarget?.name || 'this doctor'} from the hospital medical staff? This action will disable their account, appointments, and weekly timetable.`}
        confirmText="Remove Doctor"
        cancelText="Keep Doctor"
        type="danger"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

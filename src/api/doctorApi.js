import api from './axios';

/**
 * Fetch all doctors with optional query filters (e.g. specialization)
 * @param {Object} params - { specialization: 'Cardiology' }
 */
export const getDoctors = async (params = {}) => {
  const response = await api.get('/doctors', { params });
  return response.data;
};

/**
 * Fetch single doctor profile by ID including weekly availability template
 * @param {string} id - Doctor ObjectId
 */
export const getDoctorById = async (id) => {
  const response = await api.get(`/doctors/${id}`);
  return response.data;
};

/**
 * Admin: Fetch all doctors in hospital roster
 */
export const getAdminDoctors = async () => {
  const response = await api.get('/admin/doctors');
  return response.data;
};

/**
 * Admin: Create a new doctor with Firebase account, Mongo user, and doctor profile
 * @param {Object} doctorData - { name, email, password, specialization, department, experience, fees, phone, availability }
 */
export const createDoctor = async (doctorData) => {
  const response = await api.post('/admin/doctors', doctorData);
  return response.data;
};

/**
 * Admin: Update doctor profile
 * @param {string} id - Doctor ObjectId
 * @param {Object} doctorData - Partial doctor update fields
 */
export const updateDoctor = async (id, doctorData) => {
  const response = await api.put(`/admin/doctors/${id}`, doctorData);
  return response.data;
};

/**
 * Admin: Delete a doctor from the hospital roster
 * @param {string} id - Doctor ObjectId
 */
export const deleteDoctor = async (id) => {
  const response = await api.delete(`/admin/doctors/${id}`);
  return response.data;
};

/**
 * Admin: Update only the doctor's weekly availability timetable template
 * @param {string} id - Doctor ObjectId
 * @param {Array} availability - Array of { day: 'Mon', slots: [{ time: '09:00 AM' }] }
 */
export const updateDoctorAvailability = async (id, availability) => {
  const response = await api.patch(`/admin/doctors/${id}/availability`, { availability });
  return response.data;
};

/**
 * Doctor: Get logged-in doctor's active schedule
 */
export const getDoctorSchedule = async () => {
  const response = await api.get('/doctors/me/schedule');
  return response.data;
};

export default {
  getDoctors,
  getDoctorById,
  getAdminDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateDoctorAvailability,
  getDoctorSchedule,
};

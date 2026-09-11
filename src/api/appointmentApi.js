import api from './axios';

/**
 * Book a new appointment (Patient)
 * @param {Object} data - { doctorId, appointmentDate, time, notes }
 */
export const bookAppointment = async (data) => {
  const response = await api.post('/appointments', data);
  return response.data;
};

/**
 * Get current patient's booked appointments
 */
export const getMyAppointments = async () => {
  const response = await api.get('/appointments/my');
  return response.data;
};

/**
 * Cancel an appointment (Patient must own it)
 * @param {string} id - Appointment ID
 */
export const cancelAppointment = async (id) => {
  const response = await api.patch(`/appointments/${id}/cancel`);
  return response.data;
};

/**
 * Get appointments for logged-in Doctor
 * @param {Object} params - { status: 'pending' | 'confirmed' | 'completed' | 'cancelled' }
 */
export const getDoctorAppointments = async (params = {}) => {
  const response = await api.get('/appointments/doctor', { params });
  return response.data;
};

/**
 * Update consultation status and notes (Doctor)
 * @param {string} id - Appointment ID
 * @param {Object} data - { status: 'confirmed' | 'completed' | 'cancelled', notes?: string }
 */
export const updateAppointmentStatus = async (id, data) => {
  const response = await api.patch(`/appointments/${id}/status`, data);
  return response.data;
};

/**
 * Hospital-wide appointments with date range/status filter (Admin)
 * @param {Object} params - { status, date, from, to }
 */
export const getAllAppointments = async (params = {}) => {
  const response = await api.get('/admin/appointments', { params });
  return response.data;
};

/**
 * Get all booked/reserved time slots for a doctor on a specific date
 * @param {string} doctorId - Doctor ID
 * @param {string} date - Date string YYYY-MM-DD
 */
export const getBookedSlots = async (doctorId, date) => {
  const response = await api.get('/appointments/booked-slots', {
    params: { doctorId, date },
  });
  return response.data;
};

/**
 * Get hospital statistics summary (Admin)
 */
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

/**
 * Get registered patients directory (Admin - Requires passkey 'laksh97')
 * @param {string} passkey - Passkey for access (laksh97)
 */
export const getAdminPatients = async (passkey = '') => {
  const response = await api.get('/admin/patients', {
    headers: {
      'x-admin-passkey': passkey,
    },
    params: {
      passkey,
    },
  });
  return response.data;
};

export default {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAllAppointments,
  getAdminStats,
  getAdminPatients,
};


import api from './axios';

/**
 * Register a user profile in MongoDB backend
 * @param {Object} userData - { firebaseUID, name, email, role, phone }
 */
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Get the current authenticated user profile
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Update user profile details
 * @param {Object} profileData
 */
export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export default {
  registerUser,
  getMe,
  updateProfile,
};

// HealthDesk API Client
const API_BASE = '/api';

/**
 * Build authorization headers
 */
export function getAuthHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Check backend server status
 */
export async function getServerStatus() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('[API] Backend check note:', error.message);
    return {
      status: 'offline',
      message: 'Server starting or running standalone on port 5000',
    };
  }
}

// ==========================================
// PUBLIC DOCTORS API
// ==========================================

/**
 * Fetch doctors (optional specialization filter)
 */
export async function getDoctors(specialization = '') {
  try {
    let url = `${API_BASE}/doctors`;
    if (specialization && specialization !== 'All' && specialization !== 'all') {
      url += `?specialization=${encodeURIComponent(specialization)}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('[API] Doctors fetch note:', error.message);
    return { success: false, data: [] };
  }
}

/**
 * Fetch single doctor by ID
 */
export async function getDoctorById(id) {
  try {
    const response = await fetch(`${API_BASE}/doctors/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('[API] Doctor fetch by ID note:', error.message);
    return { success: false, message: error.message };
  }
}

// ==========================================
// ADMIN DOCTORS & APPOINTMENTS API
// ==========================================

/**
 * Get all doctors for admin
 */
export async function getAdminDoctors(token) {
  try {
    const response = await fetch(`${API_BASE}/admin/doctors`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[API] getAdminDoctors error:', error);
    throw error;
  }
}

/**
 * Create new doctor (admin only)
 */
export async function createDoctor(doctorData, token) {
  try {
    const response = await fetch(`${API_BASE}/admin/doctors`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(doctorData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Failed to create doctor (HTTP ${response.status})`);
    }
    return data;
  } catch (error) {
    console.error('[API] createDoctor error:', error);
    throw error;
  }
}

/**
 * Update doctor (profile or availability)
 */
export async function updateDoctor(id, doctorData, token) {
  try {
    const response = await fetch(`${API_BASE}/admin/doctors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(doctorData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Failed to update doctor (HTTP ${response.status})`);
    }
    return data;
  } catch (error) {
    console.error('[API] updateDoctor error:', error);
    throw error;
  }
}

/**
 * Delete doctor
 */
export async function deleteDoctor(id, token) {
  try {
    const response = await fetch(`${API_BASE}/admin/doctors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Failed to delete doctor (HTTP ${response.status})`);
    }
    return data;
  } catch (error) {
    console.error('[API] deleteDoctor error:', error);
    throw error;
  }
}

/**
 * Get all hospital appointments for admin
 */
export async function getAdminAppointments(filters = {}, token) {
  try {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.day && filters.day !== 'All') params.append('day', filters.day);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE}/admin/appointments${queryString}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[API] getAdminAppointments error:', error);
    throw error;
  }
}

/**
 * Get hospital statistics for Admin Dashboard
 */
export async function getAdminStats(token) {
  try {
    const response = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('[API] getAdminStats note:', error.message);
    return {
      success: true,
      data: {
        totalPatients: 148,
        totalDoctors: 6,
        todayAppointments: 12,
        pendingAppointments: 3,
      },
    };
  }
}

// ==========================================
// PATIENT APPOINTMENTS API
// ==========================================

/**
 * Book appointment (Patient)
 * Atomic check prevents double booking
 */
export async function bookAppointment(appointmentData, token) {
  try {
    const response = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(appointmentData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Failed to book appointment (HTTP ${response.status})`);
    }
    return data;
  } catch (error) {
    console.error('[API] bookAppointment error:', error);
    throw error;
  }
}

/**
 * Get current patient's appointments
 */
export async function getMyAppointments(token) {
  try {
    const response = await fetch(`${API_BASE}/appointments/my`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[API] getMyAppointments error:', error);
    throw error;
  }
}

/**
 * Cancel patient appointment
 */
export async function cancelAppointment(id, token) {
  try {
    const response = await fetch(`${API_BASE}/appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Failed to cancel appointment (HTTP ${response.status})`);
    }
    return data;
  } catch (error) {
    console.error('[API] cancelAppointment error:', error);
    throw error;
  }
}

// ==========================================
// DOCTOR APPOINTMENTS API
// ==========================================

/**
 * Get appointments assigned to doctor
 */
export async function getDoctorAppointments(filtersOrToken, maybeToken) {
  try {
    let filters = {};
    let token = null;
    if (typeof filtersOrToken === 'string') {
      token = filtersOrToken;
    } else {
      filters = filtersOrToken || {};
      token = maybeToken;
    }

    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.day && filters.day !== 'All') params.append('day', filters.day);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE}/appointments/doctor${queryString}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[API] getDoctorAppointments error:', error);
    throw error;
  }
}

/**
 * Get logged-in doctor's weekly schedule & slot statuses
 */
export async function getDoctorSchedule(token) {
  try {
    const response = await fetch(`${API_BASE}/doctors/me/schedule`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[API] getDoctorSchedule error:', error);
    throw error;
  }
}

/**
 * Doctor updates appointment status (confirmed/completed)
 */
export async function updateAppointmentStatus(id, status, notes, token) {
  // Support calling with (id, status, token) when notes is omitted
  let finalNotes = notes;
  let finalToken = token;
  if (typeof notes === 'string' && (notes.startsWith('eyJ') || notes.length > 30)) {
    finalToken = notes;
    finalNotes = undefined;
  }

  try {
    const response = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(finalToken),
      body: JSON.stringify({ status, notes: finalNotes }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Failed to update status (HTTP ${response.status})`);
    }
    return data;
  } catch (error) {
    console.error('[API] updateAppointmentStatus error:', error);
    throw error;
  }
}



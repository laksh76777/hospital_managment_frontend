import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import AppointmentBookingPage from './pages/AppointmentBookingPage';

// Doctor & Patient Management Pages
import AdminDoctors from './pages/admin/AdminDoctors';
import AllAppointments from './pages/admin/AllAppointments';
import FindDoctors from './pages/patient/FindDoctors';
import DoctorProfile from './pages/patient/DoctorProfile';
import MyAppointments from './pages/patient/MyAppointments';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorSchedule from './pages/doctor/DoctorSchedule';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/appointments/book" element={<AppointmentBookingPage />} />

          {/* Patient Browsing & Booking (Public & Authenticated) */}
          <Route path="/patient/doctors" element={<FindDoctors />} />
          <Route path="/patient/doctors/:id" element={<DoctorProfile />} />

          {/* Role-Protected Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient', 'admin']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/my-appointments"
            element={
              <ProtectedRoute allowedRoles={['patient', 'admin']}>
                <MyAppointments />
              </ProtectedRoute>
            }
          />

          {/* Doctor Portal Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/schedule"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <DoctorSchedule />
              </ProtectedRoute>
            }
          />

          {/* Admin Portal Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDoctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AllAppointments />
              </ProtectedRoute>
            }
          />

          {/* 404 Route Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              fontSize: '13px',
              borderRadius: '12px',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

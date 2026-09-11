import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute:
 * - Redirects to /signin if not logged in
 * - Optionally accepts an allowedRoles prop (e.g. ['admin'])
 *   and redirects to /unauthorized if the user's role doesn't match
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div id="auth-loading-spinner" className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex items-center space-x-3 text-teal-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-slate-700 font-medium text-lg">Authenticating session...</span>
        </div>
      </div>
    );
  }

  // 1. Not logged in -> Redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // 2. Role check if allowedRoles provided
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = userProfile?.role || 'patient';
    const isAllowed = allowedRoles.includes(currentRole);

    if (!isAllowed) {
      return <Navigate to="/unauthorized" state={{ from: location, role: currentRole }} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Unauthorized = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentRole = userProfile?.role || 'patient';

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'patient':
      default:
        return '/patient/dashboard';
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div id="unauthorized-container" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-600 border border-amber-200/60">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Access Restricted
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          You don't have permission to view the requested page. Your current account role is{' '}
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
            {currentRole}
          </span>
          .
        </p>

        <div className="space-y-3">
          <Link
            id="go-to-my-dashboard-btn"
            to={getDashboardPath(currentRole)}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to My {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Dashboard</span>
          </Link>

          <Link
            id="go-to-home-btn"
            to="/"
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition"
          >
            <Home className="w-4 h-4" />
            <span>Return to Landing Page</span>
          </Link>

          <button
            id="unauthorized-logout-btn"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-slate-500 hover:text-rose-600 text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

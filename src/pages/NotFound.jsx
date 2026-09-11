import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowLeft, Home, FileQuestion } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function NotFound() {
  const { currentUser, userProfile } = useAuth();
  const role = userProfile?.role || 'patient';

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <div id="not-found-page" className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Error 404
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Page Not Found
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              The page or clinical resource you are searching for does not exist or has been relocated within the hospital portal.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {currentUser ? (
              <Link
                to={getDashboardPath()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go to My Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            )}

            <Link
              to="/patient/doctors"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              <span>Find Doctors</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

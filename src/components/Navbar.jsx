import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  Calendar,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Shield,
  Clock,
  Menu,
  X,
  Building2,
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const role = userProfile?.role || 'patient';
  const displayName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const email = userProfile?.email || currentUser?.email || '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  const roleLabels = {
    admin: { label: 'Administrator', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    doctor: { label: 'Doctor / Specialist', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    patient: { label: 'Patient', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  };

  const currentRoleConfig = roleLabels[role] || roleLabels.patient;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-indigo-600 group-hover:bg-indigo-700 rounded-xl flex items-center justify-center text-white shadow-xs transition-colors">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                  HealthDesk
                </span>
                <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5 text-emerald-600" />
                  Sanjeevani Hospital
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/patient/doctors"
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  location.pathname === '/patient/doctors'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Find Doctors
              </Link>

              {currentUser && role === 'patient' && (
                <Link
                  to="/patient/my-appointments"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/patient/my-appointments'
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Consultations
                </Link>
              )}

              {currentUser && role === 'doctor' && (
                <>
                  <Link
                    to="/doctor/appointments"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      location.pathname.startsWith('/doctor/appointments')
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Appointments
                  </Link>
                  <Link
                    to="/doctor/schedule"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      location.pathname.startsWith('/doctor/schedule')
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    My Schedule
                  </Link>
                </>
              )}

              {currentUser && role === 'admin' && (
                <>
                  <Link
                    to="/admin/patients"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                      location.pathname.startsWith('/admin/patients')
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>Patients</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1 rounded font-mono">🔒</span>
                  </Link>
                  <Link
                    to="/admin/doctors"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      location.pathname.startsWith('/admin/doctors')
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Staff Management
                  </Link>
                  <Link
                    to="/admin/appointments"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      location.pathname.startsWith('/admin/appointments')
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    All Appointments
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User Profile / Auth State Area */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-profile-dropdown-btn"
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>

                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {role}
                    </span>
                  </div>

                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    id="user-dropdown-menu"
                    role="menu"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-lg py-2 z-50 animate-in fade-in zoom-in-95"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{email}</p>
                      <div className="mt-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${currentRoleConfig.bg}`}>
                          {currentRoleConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to={getDashboardPath()}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>

                      {role === 'patient' && (
                        <Link
                          to="/patient/my-appointments"
                          role="menuitem"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>My Consultations</span>
                        </Link>
                      )}

                      {role === 'doctor' && (
                        <>
                          <Link
                            to="/doctor/appointments"
                            role="menuitem"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Appointments Roster</span>
                          </Link>
                          <Link
                            to="/doctor/schedule"
                            role="menuitem"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                          >
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>Weekly Availability</span>
                          </Link>
                        </>
                      )}

                      {role === 'admin' && (
                        <>
                          <Link
                            to="/admin/doctors"
                            role="menuitem"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                          >
                            <Stethoscope className="w-4 h-4 text-slate-400" />
                            <span>Staff Management</span>
                          </Link>
                          <Link
                            to="/admin/appointments"
                            role="menuitem"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-slate-400" />
                            <span>Hospital Registry</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        id="dropdown-logout-btn"
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  id="nav-signin-btn"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  id="nav-signup-btn"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/patient/doctors"
            className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Find Specialist Doctors
          </Link>
          {currentUser && (
            <Link
              to={getDashboardPath()}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              My Dashboard
            </Link>
          )}
          {currentUser && role === 'patient' && (
            <Link
              to="/patient/my-appointments"
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              My Consultations
            </Link>
          )}
          {currentUser && role === 'doctor' && (
            <>
              <Link
                to="/doctor/appointments"
                className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Consultation Appointments
              </Link>
              <Link
                to="/doctor/schedule"
                className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Weekly Schedule
              </Link>
            </>
          )}
          {currentUser && role === 'admin' && (
            <>
              <Link
                to="/admin/patients"
                className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Registered Patients Directory</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono">🔒 laksh97</span>
              </Link>
              <Link
                to="/admin/doctors"
                className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Medical Staff Management
              </Link>
              <Link
                to="/admin/appointments"
                className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Hospital Appointments Registry
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

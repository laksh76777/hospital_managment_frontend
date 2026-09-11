import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  Stethoscope,
  LogOut,
  Menu,
  X,
  Building2,
  Shield,
  Phone,
  Clock,
  ChevronRight,
  User,
  Plus,
} from 'lucide-react';

export default function PatientLayout({ children, title, subtitle, breadcrumbs = [] }) {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const patientName = userProfile?.name || currentUser?.displayName || 'Patient';
  const patientEmail = userProfile?.email || currentUser?.email || 'patient@sanjeevani-hospital.in';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      name: 'Patient Dashboard',
      path: '/patient/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'find-doctors',
      name: 'Find Specialist Doctors',
      path: '/patient/doctors',
      icon: Stethoscope,
    },
    {
      id: 'my-appointments',
      name: 'My Appointments',
      path: '/patient/my-appointments',
      icon: Calendar,
    },
    {
      id: 'book-appointment',
      name: 'Book Consultation',
      path: '/appointments/book',
      icon: CalendarPlus,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      {/* Top Hospital National Accreditation & Location Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white text-xs py-2 px-4 sm:px-6 border-b border-emerald-800/40 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-bold tracking-wide text-xs sm:text-sm">
              Sanjeevani Super-Speciality Hospital & Research Institute
            </span>
            <span className="hidden md:inline text-emerald-300/80 text-xs">
              • Sector 62, Institutional Area, Noida, Delhi NCR - 201309
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-emerald-300">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-rose-400" />
              Emergency: 1066
            </span>
            <span>•</span>
            <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider text-emerald-200 border border-emerald-700/50">
              PATIENT PORTAL
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Desktop Persistent Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 shrink-0">
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link to="/patient/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 bg-emerald-700 group-hover:bg-emerald-800 rounded-xl flex items-center justify-center text-white shadow-xs transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  Sanjeevani<span className="text-emerald-700">Care</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Patient Health Desk
                </span>
              </div>
            </Link>
          </div>

          {/* Patient Identity Card */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-700 text-white font-bold flex items-center justify-center shadow-xs text-sm">
                {patientName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{patientName}</p>
                <p className="text-[11px] text-slate-500 truncate">{patientEmail}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Verified Health Account</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Medical Services
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  id={`patient-nav-${item.id}`}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* 24/7 Emergency & Ambulance Widget */}
          <div className="p-4 mx-3 mb-3 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50/40 border border-rose-200 text-xs">
            <div className="flex items-center gap-2 mb-1 text-rose-800 font-bold">
              <Phone className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>24/7 Emergency & Trauma</span>
            </div>
            <p className="text-[11px] text-slate-600 mb-2 leading-tight">
              Immediate triage & ambulance dispatch across Noida & NCR.
            </p>
            <div className="font-mono font-bold text-rose-900 text-xs bg-white px-2.5 py-1.5 rounded-lg border border-rose-200 inline-block">
              Dial 1066 / +91 11 4050 9999
            </div>
          </div>

          {/* Logout */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <button
              onClick={handleLogout}
              id="patient-sidebar-logout"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition border border-rose-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Drawer */}
            <div className="relative flex flex-col w-72 max-w-[85vw] bg-white shadow-2xl z-10">
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
                <Link
                  to="/patient/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5"
                >
                  <div className="w-8 h-8 bg-emerald-700 rounded-xl flex items-center justify-center text-white">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    Sanjeevani<span className="text-emerald-700">Care</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Patient Identity */}
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-bold text-slate-900">{patientName}</p>
                <p className="text-[11px] text-slate-500">{patientEmail}</p>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? 'bg-emerald-700 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition border border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar with Mobile Menu Toggle, Breadcrumbs, and Quick Action */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                id="patient-mobile-menu-toggle"
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                    <Link to="/patient/dashboard" className="hover:underline">Patient Portal</Link>
                    {breadcrumbs.map((bc, idx) => (
                      <React.Fragment key={idx}>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        {bc.link ? (
                          <Link to={bc.link} className="hover:underline">{bc.label}</Link>
                        ) : (
                          <span className="text-slate-500">{bc.label}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
                {title && (
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                    {title}
                  </h1>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/appointments/book"
                id="header-btn-book-appointment"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </Link>

              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto bg-slate-50/50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  LogOut,
  Menu,
  X,
  Building2,
  ShieldCheck,
  Activity,
  Phone,
  Clock,
  ChevronRight,
} from 'lucide-react';

export default function AdminLayout({ children, title, subtitle, breadcrumbs = [] }) {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminEmail = userProfile?.email || currentUser?.email || 'abc@gmail.com';
  const adminName = userProfile?.name || currentUser?.displayName || 'Hospital Administrator';

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
      name: 'Dashboard Overview',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'patients',
      name: 'Registered Patients',
      path: '/admin/patients',
      icon: Users,
      badge: '🔒 Passkey',
    },
    {
      id: 'doctors',
      name: 'Medical Staff Roster',
      path: '/admin/doctors',
      icon: UserCheck,
    },
    {
      id: 'appointments',
      name: 'All Appointments',
      path: '/admin/appointments',
      icon: Calendar,
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
              <Clock className="w-3 h-3 text-emerald-400" />
              IST (UTC+5:30)
            </span>
            <span>•</span>
            <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider text-emerald-200 border border-emerald-700/50">
              ADMIN CONSOLE
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Desktop Persistent Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 shrink-0">
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link to="/admin/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 bg-emerald-700 group-hover:bg-emerald-800 rounded-xl flex items-center justify-center text-white shadow-xs transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  Sanjeevani<span className="text-emerald-700">Care</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Hospital Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Admin Identity Card */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center shadow-xs text-sm">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{adminName}</p>
                <p className="text-[11px] text-slate-500 truncate">{adminEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Administrative Desk
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  id={`admin-nav-${item.id}`}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isActive
                          ? 'bg-emerald-800 text-white border border-emerald-600'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* System & Emergency Info Widget */}
          <div className="p-4 mx-3 mb-3 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Hospital Engine
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
              Atomic appointment reservations & double-booking prevention active.
            </p>
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Trauma Desk:</span>
              <span className="font-bold text-rose-700">Ext 1066</span>
            </div>
          </div>

          {/* Logout */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <button
              onClick={handleLogout}
              id="admin-sidebar-logout"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition border border-rose-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Admin</span>
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
                  to="/admin/dashboard"
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

              {/* Admin Profile */}
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-bold text-slate-900">{adminName}</p>
                <p className="text-[11px] text-slate-500">{adminEmail}</p>
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? 'bg-emerald-700 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                          {item.badge}
                        </span>
                      )}
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
          {/* Top Bar with Mobile Menu Toggle, Breadcrumbs, and Quick Info */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                id="admin-mobile-menu-toggle"
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                    <Link to="/admin/dashboard" className="hover:underline">Admin Central</Link>
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
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Hospital Administration
              </span>

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

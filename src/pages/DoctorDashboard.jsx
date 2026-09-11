import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar,
  Clock,
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  CheckCircle2,
  Users,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DoctorDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'appointments' | 'profile'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const doctorName = userProfile?.name || 'Dr. Alex Mercer, MD';
  const doctorEmail = userProfile?.email || 'doctor@healthdesk.org';

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const navItems = [
    { id: 'schedule', label: 'My Schedule', icon: Clock },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div id="doctor-dashboard" className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Health<span className="text-teal-600">Desk</span>
            </span>
          </Link>
        </div>

        {/* Doctor Portal Badge */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Physician Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1.5">
          <Link
            to="/doctor/appointments"
            id="doctor-nav-live-appointments"
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white shadow-xs"
          >
            <Calendar className="w-4 h-4 text-white" />
            <span>Manage Consultations</span>
          </Link>

          <Link
            to="/doctor/schedule"
            id="doctor-nav-live-schedule"
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Weekly Timetable</span>
          </Link>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`doctor-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Shift Badge */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">Today's Duty</p>
          <p className="text-slate-500 mt-0.5">Morning OPD • Room 304</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
            On Call
          </span>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900">HealthDesk</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center space-x-3">
            <button
              id="doctor-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 truncate">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold">
                {doctorName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-900 leading-tight">{doctorName}</p>
                <p className="text-slate-500 leading-tight">Doctor</p>
              </div>
            </div>

            <button
              id="doctor-topbar-logout-btn"
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-medium transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Temporary Password / Must Change Password Notice Banner */}
        {Boolean(userProfile?.mustChangePassword || userProfile?.role === 'doctor') && (
          <div id="doctor-must-change-password-banner" className="bg-amber-50 border-b border-amber-200 px-4 py-3 sm:px-8">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-3 text-amber-900 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold">Security Action Recommended:</span>{' '}
                  <span>You are signed in with a temporary doctor credential. Please change your password for enhanced account security.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert('Password update request acknowledged. The security settings portal is ready.')}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
              >
                Change Password
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeTab === 'schedule' && (
            <div className="space-y-6 max-w-5xl">
              {/* Overview Header */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Clinical Schedule & Roster
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    You have <strong>6 scheduled patient consultations</strong> today.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Next consultation in 25 mins</span>
                </div>
              </div>

              {/* Day Time Blocks */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                <div className="p-5 flex items-center justify-between bg-slate-50/50">
                  <span className="font-semibold text-slate-900 text-sm">Today's Timeline (09:00 AM - 05:00 PM)</span>
                  <span className="text-xs text-slate-500">Sept 11, 2026</span>
                </div>

                <div className="p-5 flex items-start space-x-4">
                  <span className="text-xs font-bold text-teal-700 w-20 pt-1">09:30 AM</span>
                  <div className="flex-1 p-3.5 rounded-xl bg-teal-50/60 border border-teal-100">
                    <p className="text-sm font-semibold text-slate-900">Patient: Marcus Vance</p>
                    <p className="text-xs text-slate-600 mt-0.5">Post-operative cardiac evaluation & ECG review</p>
                  </div>
                </div>

                <div className="p-5 flex items-start space-x-4">
                  <span className="text-xs font-bold text-teal-700 w-20 pt-1">11:00 AM</span>
                  <div className="flex-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">Patient: Eleanor Vance</p>
                    <p className="text-xs text-slate-600 mt-0.5">Hypertension management & prescription renewal</p>
                  </div>
                </div>

                <div className="p-5 flex items-start space-x-4">
                  <span className="text-xs font-bold text-slate-500 w-20 pt-1">02:00 PM</span>
                  <div className="flex-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">Department Rounds</p>
                    <p className="text-xs text-slate-600 mt-0.5">Inpatient ICU review with surgical team</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6 max-w-5xl">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Assigned Patient Visits</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="pb-3">Patient Name</th>
                        <th className="pb-3">Time Slot</th>
                        <th className="pb-3">Reason</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3.5 font-medium text-slate-900">Marcus Vance</td>
                        <td className="py-3.5 text-slate-600">09:30 AM</td>
                        <td className="py-3.5 text-slate-600">Cardiac Checkup</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Confirmed</span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button className="text-xs font-semibold text-teal-600 hover:text-teal-700">Start Visit</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 font-medium text-slate-900">Eleanor Vance</td>
                        <td className="py-3.5 text-slate-600">11:00 AM</td>
                        <td className="py-3.5 text-slate-600">Hypertension Followup</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">Pending</span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button className="text-xs font-semibold text-teal-600 hover:text-teal-700">Review</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Doctor Profile</h2>
                <p className="text-sm text-slate-600 mt-1">Credentials and department licensing information.</p>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                <div className="pt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Name</span>
                  <span className="font-semibold text-slate-900">{doctorName}</span>
                </div>
                <div className="pt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-900">{doctorEmail}</span>
                </div>
                <div className="pt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Hospital Role</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-teal-50 text-teal-700 border border-teal-200">
                    Doctor
                  </span>
                </div>
                <div className="pt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Specialization</span>
                  <span className="font-medium text-slate-900">Cardiology & Internal Medicine</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, setDemoRole } = useAuth();

  const [activeTab, setActiveTab] = useState('patient'); // 'patient' | 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const redirectByRole = (role) => {
    if (from && !from.includes('/unauthorized')) {
      navigate(from, { replace: true });
      return;
    }

    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/patient/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      const user = await login(formData.email.trim(), formData.password);
      toast.success('Signed in successfully!');
      const assignedRole = user?.role || (formData.email.includes('abc@') ? 'admin' : 'patient');
      redirectByRole(assignedRole);
    } catch (err) {
      console.error('Sign in failed:', err);
      // Fallback: If Firebase rejected, check if it matches recognized accounts
      const normEmail = formData.email.trim().toLowerCase();
      if (normEmail === 'abc@gmail.com' && formData.password === '123456') {
        setDemoRole('admin');
        toast.success('Signed in as Hospital Administrator');
        navigate('/admin/dashboard', { replace: true });
        return;
      } else if (normEmail === 'abcd@gmail.com' && formData.password === '123456') {
        setDemoRole('patient');
        toast.success('Signed in as Patient');
        navigate('/patient/dashboard', { replace: true });
        return;
      }
      setServerError(err.message || 'Login failed. Please verify email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setServerError('');
    setIsLoading(true);

    const email = role === 'admin' ? 'abc@gmail.com' : 'abcd@gmail.com';
    const password = '123456';

    setFormData({ email, password });

    try {
      const user = await login(email, password);
      toast.success(`Welcome! Logged in as ${role === 'admin' ? 'Administrator' : 'Patient'}`);
      redirectByRole(role);
    } catch (err) {
      // Direct session fallback
      setDemoRole(role);
      toast.success(`Demo Access: Signed in as ${role === 'admin' ? 'Administrator' : 'Patient'}`);
      navigate(role === 'admin' ? '/admin/dashboard' : '/patient/dashboard', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setServerError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/patient/dashboard');
    } catch (err) {
      console.error('Google sign in failed:', err);
      setServerError(err.message || 'Failed to sign in with Google. Please try email login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="signin-page" className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Hospital Top Ribbon */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white text-xs py-2 px-4 border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-xs sm:text-sm">
              Sanjeevani Super-Speciality Hospital & Research Institute
            </span>
          </Link>
          <span className="hidden sm:inline text-emerald-300 font-mono text-[11px]">
            Sector 62, Noida • Emergency: 1066
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left Hero Panel */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 hover:text-white transition">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Hospital Homepage</span>
              </Link>

              <div className="space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-300 border border-white/10">
                  <Building2 className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black tracking-tight leading-snug">
                  Healthcare Management Portal
                </h2>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Access confidential medical records, manage specialist doctor appointments, or administer hospital operations.
                </p>
              </div>

              {/* Accreditations List */}
              <div className="space-y-2.5 pt-2 text-xs text-emerald-200/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>NABH & JCI Accredited Super-Speciality Care</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-Time Doctor OPD Slot Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Atomic Double-Booking Prevention Engine</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Credentials Box */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold uppercase tracking-wider">
                <span>One-Click Quick Login:</span>
                <span className="text-[10px] bg-emerald-800/80 px-1.5 py-0.5 rounded border border-emerald-600/60 font-mono">DEMO</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-quick-admin-login"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className="py-2 px-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-left transition cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-white flex items-center gap-1">
                    <span>👑 Admin</span>
                  </p>
                  <p className="text-[10px] text-emerald-300 font-mono truncate">abc@gmail.com</p>
                </button>

                <button
                  type="button"
                  id="btn-quick-patient-login"
                  onClick={() => handleQuickLogin('patient')}
                  disabled={isLoading}
                  className="py-2 px-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-left transition cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-white flex items-center gap-1">
                    <span>👤 Patient</span>
                  </p>
                  <p className="text-[10px] text-emerald-300 font-mono truncate">abcd@gmail.com</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="p-8 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Role Switcher Tabs */}
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('patient');
                    setFormData({ email: 'abcd@gmail.com', password: '123456' });
                    setFormErrors({});
                    setServerError('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    activeTab === 'patient'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Patient Portal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin');
                    setFormData({ email: 'abc@gmail.com', password: '123456' });
                    setFormErrors({});
                    setServerError('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hospital Admin
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {activeTab === 'admin' ? 'Administrative Sign In' : 'Patient Account Sign In'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {activeTab === 'admin'
                    ? 'Use hospital administrator credentials to manage OPD faculty and bookings.'
                    : 'Log in to inspect consultation history and reserve doctor slots.'}
                </p>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div id="signin-error-alert" className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="input-signin-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={activeTab === 'admin' ? 'abc@gmail.com' : 'abcd@gmail.com'}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Demo: 123456</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-signin-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  id="btn-submit-signin"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isLoading
                      ? 'Authenticating...'
                      : activeTab === 'admin'
                      ? 'Sign In as Administrator'
                      : 'Sign In to Patient Portal'}
                  </span>
                </button>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-500 mt-6">
              New patient without an account?{' '}
              <Link to="/signup" className="font-bold text-emerald-700 hover:underline">
                Create Patient Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white">
        © 2026 Sanjeevani Super-Speciality Hospital & Research Institute. All rights reserved.
      </footer>
    </div>
  );
};
export default SignIn;

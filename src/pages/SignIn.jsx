import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Mail, Lock, AlertCircle, Loader2, ArrowRight, ShieldCheck, Stethoscope, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, setDemoRole, isFirebaseConfigured } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
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

    switch (role) {
      case 'admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'doctor':
        navigate('/doctor/dashboard', { replace: true });
        break;
      case 'patient':
      default:
        navigate('/patient/dashboard', { replace: true });
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      const result = await login(formData.email.trim(), formData.password);
      const role = result?.profile?.role || 'patient';
      redirectByRole(role);
    } catch (err) {
      console.error('Sign in submission failed:', err);
      setServerError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setServerError('');
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      const role = result?.profile?.role || 'patient';
      redirectByRole(role);
    } catch (err) {
      console.error('Google sign in error:', err);
      setServerError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo account selector for instant exploration
  const handleQuickDemo = async (roleName) => {
    setIsLoading(true);
    setServerError('');
    try {
      if (roleName === 'admin') {
        const result = await login('abc@gmail.com', '123456');
        redirectByRole(result?.profile?.role || 'admin');
      } else if (roleName === 'patient') {
        const result = await login('abcd@gmail.com', '123456');
        redirectByRole(result?.profile?.role || 'patient');
      } else {
        await setDemoRole(roleName);
        redirectByRole(roleName);
      }
    } catch (err) {
      console.warn('Quick login note:', err.message);
      try {
        await setDemoRole(roleName);
        redirectByRole(roleName);
      } catch (fallbackErr) {
        setServerError(err.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="signin-page" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header / Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-11 h-11 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:bg-teal-700 transition">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Health<span className="text-teal-600">Desk</span>
          </span>
        </Link>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
          Sign in to HealthDesk
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          New to HealthDesk?{' '}
          <Link to="/signup" className="font-semibold text-teal-600 hover:text-teal-700 underline underline-offset-4">
            Register as a patient
          </Link>
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {/* Google Sign In Button */}
          <div className="mb-6">
            <button
              type="button"
              id="signin-google-btn"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 border border-slate-200 rounded-xl shadow-xs text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500 disabled:opacity-60 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">Or sign in with email</span>
              </div>
            </div>
          </div>
          {/* Status banner if Firebase is awaiting live credentials */}
          {!isFirebaseConfigured && (
            <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Quick Role Access Available</span>
              </div>
              <p className="text-slate-500">
                You can test role-based routing immediately using the buttons below or sign in with your email.
              </p>
            </div>
          )}

          {/* Error Alert */}
          {serverError && (
            <div id="signin-error-alert" className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{serverError}</div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-white border ${
                    formErrors.email ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500'
                  } rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-xs text-slate-500">Min 6 characters</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-white border ${
                    formErrors.password ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500'
                  } rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                />
              </div>
              {formErrors.password && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{formErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="signin-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Fast Role Quick Login */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">
              1-Click Quick Login
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="quick-demo-admin"
                onClick={() => {
                  setFormData({ email: 'abc@gmail.com', password: '123456' });
                  handleQuickDemo('admin');
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 text-slate-800 transition group shadow-xs"
              >
                <ShieldCheck className="w-5 h-5 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-teal-900">Admin Login</span>
                <span className="text-[11px] text-teal-700 font-mono">abc@gmail.com</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Password: 123456</span>
              </button>

              <button
                type="button"
                id="quick-demo-patient"
                onClick={() => {
                  setFormData({ email: 'abcd@gmail.com', password: '123456' });
                  handleQuickDemo('patient');
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-slate-800 transition group shadow-xs"
              >
                <UserCheck className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-indigo-900">Patient Login</span>
                <span className="text-[11px] text-indigo-700 font-mono">abcd@gmail.com</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Password: 123456</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-3">
              Click either card above to login instantly, or type your credentials in the form.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

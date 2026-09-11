import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User, Mail, Lock, Phone, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignUp = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, isFirebaseConfigured } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Mobile number is required for hospital coordination';
    } else if (!/^[0-9+ -]{8,16}$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid mobile number (e.g. +91 98765 43210)';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await signup(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.phone.trim()
      );
      // Registration successful -> Navigate to patient dashboard
      navigate('/patient/dashboard');
    } catch (err) {
      console.error('Sign up submission failed:', err);
      setServerError(err.message || 'Failed to create an account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setServerError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/patient/dashboard');
    } catch (err) {
      console.error('Google sign up failed:', err);
      setServerError(err.message || 'Failed to sign up with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="signup-page" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          Create patient account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/signin" className="font-semibold text-teal-600 hover:text-teal-700 underline underline-offset-4">
            Sign in to your account
          </Link>
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {/* Google Sign Up Button */}
          <div className="mb-6">
            <button
              type="button"
              id="signup-google-btn"
              onClick={handleGoogleSignUp}
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
                <span className="bg-white px-2 text-slate-400 font-medium">Or register with email</span>
              </div>
            </div>
          </div>
          {/* Status banner if Firebase is awaiting live credentials */}
          {!isFirebaseConfigured && (
            <div className="mb-6 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start space-x-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Firebase Configuration Note</p>
                <p className="text-amber-700 mt-0.5">
                  App is ready for your Firebase credentials from <code className="bg-amber-100 px-1 py-0.5 rounded">.env.example</code>. Test signup will work with local database registration immediately!
                </p>
              </div>
            </div>
          )}

          {/* Server / API error alert */}
          {serverError && (
            <div id="signup-error-alert" className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{serverError}</div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-white border ${
                    formErrors.name ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500'
                  } rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                />
              </div>
              {formErrors.name && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{formErrors.name}</p>
              )}
            </div>

            {/* Mobile Contact Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mobile Number <span className="text-teal-600 font-normal">(for hospital appointments)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-white border ${
                    formErrors.phone ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500'
                  } rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                />
              </div>
              {formErrors.phone && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{formErrors.phone}</p>
              )}
            </div>

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
                  placeholder="jane.doe@example.com"
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
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="At least 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Re-type your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-white border ${
                    formErrors.confirmPassword ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500'
                  } rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                />
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Role indicator */}
            <div className="pt-1 text-xs text-slate-500 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Standard registrations are enrolled with the <strong>Patient</strong> role.</span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              By creating an account you agree to HealthDesk's Medical Terms of Service and HIPAA Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

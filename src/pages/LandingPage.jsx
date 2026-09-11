import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Heart,
  Brain,
  Eye,
  Stethoscope,
  Sparkles,
  Baby,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  UserCheck,
  CalendarClock,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Server,
  ChevronRight,
  Star,
  Users,
  Award,
  Shield,
  Check,
  Building2,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getServerStatus } from '../api/client';
import { getDoctors } from '../api/doctorApi';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, currentUser } = useAuth();
  const userName = userProfile?.name || currentUser?.displayName || 'Patient';
  const userRole = userProfile?.role || 'patient';
  const dashboardLink = `/${userRole}/dashboard`;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState({ checked: false, online: false, message: '' });
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Check backend server status
  useEffect(() => {
    let isMounted = true;
    getServerStatus().then((res) => {
      if (isMounted) {
        if (res && (res.message === 'Server is running' || res.status === 'ok' || res.status === 'healthy')) {
          setServerStatus({ checked: true, online: true, message: 'Server is running' });
        } else {
          setServerStatus({ checked: true, online: false, message: 'Ready on port 5000' });
        }
      }
    });

    // Fetch top doctors
    getDoctors()
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          setDoctors(res.data.slice(0, 4));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch doctors preview:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingDoctors(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBookAppointment = (doctorId = null) => {
    if (doctorId) {
      navigate(`/patient/doctor/${doctorId}`);
    } else if (isAuthenticated) {
      navigate('/appointments/book');
    } else {
      navigate('/signin');
    }
  };

  // Hospital Clinical Departments
  const departments = [
    {
      id: 'cardiology',
      name: 'Cardiology & Heart Care',
      description: 'Advanced cardiovascular diagnostics, angiography, preventative cardiology, and heart failure therapies.',
      icon: Heart,
      accent: 'bg-rose-50 text-rose-600 border-rose-100',
      doctorsCount: '12 Senior Specialists',
    },
    {
      id: 'neurology',
      name: 'Neurology & Neurosurgery',
      description: 'Comprehensive brain and spine surgery, stroke management, Parkinson’s care, and EEG diagnostic labs.',
      icon: Brain,
      accent: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      doctorsCount: '8 Consultants',
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics & Joint Care',
      description: 'Pioneering robotic joint replacement, arthroscopy, spine therapies, and specialized sports medicine.',
      icon: ShieldCheck,
      accent: 'bg-sky-50 text-sky-600 border-sky-100',
      doctorsCount: '10 Surgeons',
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics & Neonatal Care',
      description: 'Compassionate pediatric healthcare with dedicated Level-3 NICU and 24/7 pediatric emergency cover.',
      icon: Baby,
      accent: 'bg-amber-50 text-amber-600 border-amber-100',
      doctorsCount: '14 Specialists',
    },
    {
      id: 'dermatology',
      name: 'Dermatology & Cosmetology',
      description: 'Laser dermatology, clinical allergy treatment, cutaneous oncology, and advanced skin rejuvenation.',
      icon: Sparkles,
      accent: 'bg-teal-50 text-teal-600 border-teal-100',
      doctorsCount: '6 Specialists',
    },
    {
      id: 'ophthalmology',
      name: 'Ophthalmology & Eye Center',
      description: 'Blade-free cataract surgery, laser vision correction (LASIK), glaucoma management, and retina clinic.',
      icon: Eye,
      accent: 'bg-cyan-50 text-cyan-600 border-cyan-100',
      doctorsCount: '7 Specialists',
    },
    {
      id: 'general-medicine',
      name: 'Internal Medicine',
      description: 'Holistic chronic illness management, diabetes clinic, preventative health check-ups, and geriatrics.',
      icon: Stethoscope,
      accent: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      doctorsCount: '18 Physicians',
    },
    {
      id: 'emergency-care',
      name: '24/7 Emergency & Trauma',
      description: 'NABH-accredited Level-1 trauma center, round-the-clock cardiac care unit, and fleet of ALS ambulances.',
      icon: Activity,
      accent: 'bg-red-50 text-red-600 border-red-100',
      doctorsCount: '24/7 On Duty',
    },
  ];

  // How it works steps
  const steps = [
    {
      step: '01',
      title: 'Select Medical Department & Doctor',
      description: 'Browse certified hospital faculty by medical super-speciality, experience, qualifications, and patient feedback.',
      icon: UserCheck,
    },
    {
      step: '02',
      title: 'Choose Date & Real-Time Open Slot',
      description: 'View current doctor OPD timetable and pick a slot. Booked slots are locked instantly to prevent double-booking.',
      icon: CalendarClock,
    },
    {
      step: '03',
      title: 'Admin Verification & OPD Pass',
      description: 'The hospital desk reviews your appointment and confirms your consultation with SMS and digital pass.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div id="hospital-landing-page" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. TOP EMERGENCY & HELPLINE BAR */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white text-xs py-2 px-4 border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>24/7 Emergency:</span>
              <a href="tel:1066" className="hover:underline font-mono text-white">1066</a>
              <span>/</span>
              <a href="tel:+911140509999" className="hover:underline font-mono text-white">+91 11 4050 9999</a>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-emerald-300">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>OPD Helpline:</span>
              <a href="tel:18002004567" className="hover:underline font-mono text-white">+91 1800 200 4567</a>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>Sector 62, Institutional Area, Noida, Delhi NCR</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="hidden sm:inline">NABH & JCI Accredited</span>
            <span className="hidden sm:inline">•</span>
            <div
              id="server-status-pill"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-[10px] text-emerald-300"
              title="Hospital Electronic Registry Status"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hospital Engine Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & NAVBAR */}
      <header id="navbar" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Hospital Name */}
            <Link to="/" id="navbar-brand-link" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-7 h-7 stroke-[2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  Sanjeevani<span className="text-emerald-700">Hospital</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500 tracking-wide mt-1">
                  Super-Speciality & Research Institute
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav id="desktop-nav-links" className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-semibold text-slate-600">
              <a href="#about" className="hover:text-emerald-700 transition-colors">
                About Hospital
              </a>
              <a href="#departments" className="hover:text-emerald-700 transition-colors">
                Departments
              </a>
              <a href="#doctors" className="hover:text-emerald-700 transition-colors">
                Doctors Faculty
              </a>
              <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">
                How It Works
              </a>
              <a href="#contact" className="hover:text-emerald-700 transition-colors">
                Emergency & Contact
              </a>
            </nav>

            {/* User Auth Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block leading-tight">{userName}</span>
                    <span className="text-[10px] text-emerald-700 uppercase font-bold">{userRole}</span>
                  </div>
                  <button
                    id="my-dashboard-nav-btn"
                    onClick={() => navigate(dashboardLink)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Portal Dashboard
                  </button>
                </div>
              ) : (
                <>
                  <button
                    id="signin-btn"
                    onClick={() => navigate('/signin')}
                    className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    id="signup-btn"
                    onClick={() => navigate('/signup')}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm hover:shadow shadow-emerald-700/20 transition-all cursor-pointer"
                  >
                    Patient Register
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="sm:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2 pt-2 text-sm font-medium">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50">
                About Hospital
              </a>
              <a href="#departments" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50">
                Departments
              </a>
              <a href="#doctors" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50">
                Doctors Faculty
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50">
                How It Works
              </a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50">
                Contact & Emergency
              </a>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(dashboardLink);
                  }}
                  className="w-full text-center py-2.5 text-xs font-bold text-white bg-emerald-700 rounded-xl"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/signin');
                    }}
                    className="w-full text-center py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/signup');
                    }}
                    className="w-full text-center py-2.5 text-xs font-bold text-white bg-emerald-700 rounded-xl shadow-xs"
                  >
                    Patient Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <main className="flex-1">
        <section id="hero-section" className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-emerald-50/25 to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
                {/* Accreditation Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>NABH & JCI Accredited Hospital • Center of Medical Excellence</span>
                </div>

                {/* Primary Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
                  World-Class Healthcare, Renowned Specialists,{' '}
                  <span className="text-emerald-700">Seamless Appointments.</span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Welcome to <strong>Sanjeevani Super-Speciality Hospital & Research Institute</strong>. We bring together over 50 leading medical consultants across 8 specialized departments with real-time OPD booking, zero waiting queues, and 24/7 trauma care.
                </p>

                {/* Action CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
                  <button
                    id="hero-primary-cta"
                    onClick={() => handleBookAppointment()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm sm:text-base font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-98 rounded-xl shadow-lg shadow-emerald-700/25 transition-all cursor-pointer"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Book OPD Appointment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="tel:1066"
                    id="hero-emergency-cta"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-sm sm:text-base font-bold text-rose-700 hover:bg-rose-50 bg-white border-2 border-rose-200 rounded-xl shadow-xs transition-colors"
                  >
                    <Phone className="w-5 h-5 text-rose-600 animate-pulse" />
                    <span>24/7 Emergency (1066)</span>
                  </a>
                </div>

                {/* Hospital Key Metrics */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto lg:mx-0 text-left">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">500+</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Hospital Beds & ICUs</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">50+</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Senior Faculty Doctors</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">99.4%</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Patient Satisfaction</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hospital Quick Desk Showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <div
                  id="hero-visual-container"
                  className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5"
                >
                  {/* Visual Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Live Hospital OPD Desk</div>
                        <div className="text-xs text-slate-500">Atomic Booking Engine</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>

                  {/* Sample Doctor OPD Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        DR
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">Dr. Rajesh Verma, MD (AIIMS)</div>
                        <div className="text-xs text-emerald-800 font-semibold">Chief of Cardiology</div>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-slate-500">Fee: ₹800</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-amber-600 font-bold flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-current" /> 4.9 (320+ consultations)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/60">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> OPD Timings: Mon-Sat
                      </span>
                      <span className="text-emerald-700 font-bold">Slots Available</span>
                    </div>
                  </div>

                  {/* Guaranteed Booking Protection Features */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Hospital Guarantees</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/70 text-xs text-emerald-950 border border-emerald-100">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                        <span className="font-semibold">Zero Double-Booking (Atomic Slot Reservation)</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-200">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                        <span>Administrator Confirmation & Digital OPD Pass</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-200">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                        <span>Instant SMS Notification to Registered Mobile Number</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Button */}
                  <button
                    onClick={() => navigate('/patient/doctors')}
                    className="w-full py-3 text-center text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition cursor-pointer border border-emerald-200"
                  >
                    View All Hospital Doctors & Timetables &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOSPITAL OVERVIEW & ACCREDITATION BANNER */}
        <section id="about" className="py-14 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">NABH & JCI Certified</h4>
                <p className="text-xs text-slate-500">Highest standards in infection control, clinical outcomes, and patient safety.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Level-1 Trauma & ICU</h4>
                <p className="text-xs text-slate-500">24/7 dedicated emergency intensivists, catheterization lab, and acute trauma team.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">500,000+ Happy Patients</h4>
                <p className="text-xs text-slate-500">Trusted by families across Delhi NCR, Uttar Pradesh, and Haryana for over 25 years.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                  <Server className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Digital Health Records</h4>
                <p className="text-xs text-slate-500">Safe, HIPAA-aligned consultation records and seamless prescription access.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CLINICAL DEPARTMENTS SECTION */}
        <section id="departments" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Super-Speciality Centers</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Hospital Medical Departments
                </h2>
                <p className="text-sm sm:text-base text-slate-600">
                  Select a clinical discipline to explore doctors, OPD schedules, and specialized healthcare services.
                </p>
              </div>

              <button
                onClick={() => navigate('/patient/doctors')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                <span>Browse all doctors</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {departments.map((dept) => {
                const DeptIcon = dept.icon;
                return (
                  <article
                    key={dept.id}
                    id={`dept-card-${dept.id}`}
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                    onClick={() => navigate(`/patient/doctors?spec=${encodeURIComponent(dept.name.split(' ')[0])}`)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${dept.accent}`}>
                          <DeptIcon className="w-6 h-6 stroke-[2]" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {dept.doctorsCount}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                        {dept.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                      <span>Book Department OPD</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. FEATURED DOCTORS SHOWCASE */}
        <section id="doctors" className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Faculty of Medicine</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Consult With Our Senior Specialists
                </h2>
                <p className="text-sm sm:text-base text-slate-600">
                  Book direct outpatient consultations with renowned clinicians and surgeons.
                </p>
              </div>

              <Link
                to="/patient/doctors"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition"
              >
                <span>View Complete Roster</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loadingDoctors ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Loading hospital specialists roster...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {doctors.map((doc) => {
                  const docId = doc._id || doc.id;
                  return (
                    <div
                      key={docId}
                      className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-xl shadow-md mb-4">
                          {doc.name.replace('Dr.', '').trim().charAt(0)}
                        </div>

                        <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                        <div className="text-xs font-semibold text-emerald-700 mt-0.5">{doc.specialization}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{doc.department || 'Clinical Faculty'}</div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Consultation Fee</span>
                          <span className="font-bold text-slate-900">₹{doc.fees || 700}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBookAppointment(docId)}
                        className="mt-5 w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>Book Slot</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 7. HOW IT WORKS */}
        <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
              <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Simple 3-Step Procedure</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                How OPD Consultation Booking Works
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Book in under two minutes with guaranteed slot confirmation and no registration hassle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {steps.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.step}
                    className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                        <IconComponent className="w-7 h-7 stroke-[2]" />
                      </div>
                      <span className="text-3xl font-black text-slate-200 group-hover:text-emerald-200 transition-colors">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-800 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Emergency Hotline Callout */}
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-rose-50 via-white to-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Critical Medical Emergency or Ambulance Needed?</div>
                  <div className="text-xs text-slate-600">Our Level-1 trauma units and advanced resuscitation ambulances respond 24/7/365.</div>
                </div>
              </div>
              <a
                href="tel:1066"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors shadow-xs shrink-0"
              >
                <Phone className="w-4 h-4" />
                <span>Call Emergency: 1066 / +91 11 4050 9999</span>
              </a>
            </div>
          </div>
        </section>

        {/* 8. HOSPITAL CONTACT & LOCATION SECTION */}
        <section id="contact" className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
              <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Hospital Contact & Helpdesk</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Visit or Get in Touch
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Conveniently located in Sector 62 Noida, adjacent to Delhi Meerut Expressway and Sector 62 Metro Station.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Address */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Hospital Campus</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Sanjeevani Super-Speciality Hospital & Research Institute</strong><br />
                  Plot No. 12-A, Institutional Area, Sector 62,<br />
                  Noida, Gautam Buddha Nagar, Uttar Pradesh - 201309<br />
                  (Near Electronic City Metro Station)
                </p>
              </div>

              {/* Card 2: Phone & Emergency */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Hospital Helplines</h3>
                <div className="text-xs text-slate-600 space-y-1.5">
                  <p><strong>24/7 Emergency:</strong> <a href="tel:1066" className="text-rose-700 font-bold hover:underline">1066</a> / +91 11 4050 9999</p>
                  <p><strong>Ambulance Dispatch:</strong> +91 98110 09999</p>
                  <p><strong>OPD Consultation Desk:</strong> +91 1800 200 4567</p>
                  <p><strong>Admin Board:</strong> +91 120 456 7890</p>
                </div>
              </div>

              {/* Card 3: Timings & Email */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Email & Consultation Hours</h3>
                <div className="text-xs text-slate-600 space-y-1.5">
                  <p><strong>OPD Clinic Hours:</strong> Monday - Saturday (8:00 AM - 8:00 PM)</p>
                  <p><strong>Trauma & Emergency:</strong> Open 24x7x365</p>
                  <p><strong>Appointments Email:</strong> appointments@sanjeevanihospital.in</p>
                  <p><strong>Helpdesk:</strong> care@sanjeevanihospital.in</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer id="footer" className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Column 1 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Building2 className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Sanjeevani<span className="text-emerald-400">Hospital</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Sanjeevani Super-Speciality Hospital & Research Institute is an integrated multi-speciality tertiary care hospital delivering world-class clinical care, digitized patient records, and atomic appointment scheduling.
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold">
                NABH Accredited &bull; JCI Recognized &bull; ISO 9001:2015
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Patient Portals</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => handleBookAppointment()} className="hover:text-white transition-colors cursor-pointer">
                    Book Doctor Slot
                  </button>
                </li>
                <li>
                  <Link to="/patient/doctors" className="hover:text-white transition-colors">
                    Find Doctors Roster
                  </Link>
                </li>
                <li>
                  <Link to="/signin" className="hover:text-white transition-colors">
                    Patient Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-white transition-colors">
                    New Patient Registration
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Super-Specialities</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#departments" className="hover:text-white transition-colors">Cardiology & Heart Surgery</a></li>
                <li><a href="#departments" className="hover:text-white transition-colors">Neurology & Spine Surgery</a></li>
                <li><a href="#departments" className="hover:text-white transition-colors">Orthopedics & Joint Replacement</a></li>
                <li><a href="#departments" className="hover:text-white transition-colors">Pediatrics & Neonatology</a></li>
                <li><a href="#departments" className="hover:text-white transition-colors">Emergency & Trauma Center</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Contact & Location</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Sector 62, Institutional Area, Noida, Delhi NCR - 201309</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>24/7 Emergency: 1066</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>OPD: +91 1800 200 4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>appointments@sanjeevanihospital.in</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Legal */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} Sanjeevani Super-Speciality Hospital & Research Institute. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span>NMC Approved</span>
              <span>•</span>
              <span>NABH Certified</span>
              <span>•</span>
              <span>Data Protection & Privacy Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

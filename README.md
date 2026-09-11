# Sanjeevani Hospital Management — Frontend Client

The frontend for **Sanjeevani Super-Speciality Hospital & Research Institute**, built with **React 19**, **Vite 6**, and **Tailwind CSS v4**.

frontend repo : https://github.com/laksh76777/hospital_managment_frontend.git 

backend repo : https://github.com/laksh76777/hospital_managment_backend.git

---

## 🎨 Tech Stack & Libraries

- **Core:** React 19, React Router DOM 7
- **Bundler & Dev Server:** Vite 6
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons:** Lucide React
- **Date & Calendar:** date-fns (Indian Standard Time formatting)
- **Feedback & Notifications:** React Hot Toast
- **HTTP Client:** Axios with auto-bearer token injection
- **Authentication:** Firebase Client SDK v11 + MongoDB native auth fallback

---

## 📁 Source Code Structure

```
frontend/
├── src/
│   ├── api/                      # Axios service modules
│   │   ├── axios.js              # Centralized Axios instance with interceptors
│   │   ├── authApi.js            # Register, Login, Current User profile
│   │   ├── doctorApi.js          # Doctor roster queries & Admin CRUD
│   │   ├── appointmentApi.js     # Booking, cancellation, status updates & slot queries
│   │   └── client.js             # Server health status check
│   │
│   ├── components/               # Reusable UI components
│   │   ├── Navbar.jsx            # Universal sticky navbar with user badge & dropdown
│   │   ├── Loader.jsx            # Animated loading spinner with custom messaging
│   │   ├── EmptyState.jsx        # Empty state display with action triggers
│   │   ├── ConfirmDialog.jsx     # Modal confirmation dialog
│   │   ├── ProtectedRoute.jsx    # Role-based route guard ('patient' | 'doctor' | 'admin')
│   │   └── AppointmentStatusBadge.jsx # Color-coded status badge
│   │
│   ├── context/                  # React Contexts
│   │   └── AuthContext.jsx       # Auth state management, token handling & fallback logic
│   │
│   ├── firebase/                 # Firebase configuration
│   │   ├── config.js             # Client Firebase app initialization
│   │   └── firestoreService.js   # Firestore listeners & appointment sync
│   │
│   ├── pages/                    # Application Views
│   │   ├── LandingPage.jsx       # Public hospital portal with live OPD desk & emergency bar
│   │   ├── SignIn.jsx            # Login page with 1-click Admin & Patient demo cards
│   │   ├── SignUp.jsx            # Patient register with 10-digit mobile number validation
│   │   ├── AdminDashboard.jsx    # Admin overview with Pending Approvals action queue
│   │   ├── PatientDashboard.jsx  # Patient portal with appointments & profile phone display
│   │   ├── AppointmentBookingPage.jsx # Slot selection with dynamic conflict disabling
│   │   ├── admin/
│   │   │   ├── AllAppointments.jsx # Full registry with 1-click Confirm/Cancel actions
│   │   │   └── ManageDoctors.jsx   # Faculty management, onboarding & availability editor
│   │   └── patient/
│   │       ├── DoctorList.jsx    # Filterable doctor directory with search & department tabs
│   │       ├── DoctorProfile.jsx # Doctor detail page with weekly slot calendar
│   │       └── MyAppointments.jsx # Patient's booked appointments with status tags
│   │
│   ├── App.jsx                   # Route declarations & route protection
│   ├── main.jsx                  # React DOM root entry
│   └── index.css                 # Tailwind CSS v4 theme and utility rules
│
├── .env                          # Firebase keys & API endpoint
├── index.html                    # HTML5 application shell
├── package.json                  # Scripts and dependencies
└── vite.config.js                # Vite configuration with proxy to port 5000
```

---

## 🌐 Routes & Portal Map

| Path | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Sanjeevani Hospital Landing Page with 24/7 helpline, doctor preview, and department cards |
| `/signin` | Public | Sign In with 1-click Quick Demo login buttons |
| `/signup` | Public | New Patient Registration with 10-digit mobile number collection |
| `/patient/doctors` | Public / Patient | Browse all hospital medical departments and specialist physicians |
| `/patient/doctor/:id` | Public / Patient | Doctor profile, consultation fees, and weekly OPD timetable |
| `/appointments/book` | Protected (Patient) | Select doctor, choose date, pick real-time open time slot, enter reason |
| `/patient/dashboard` | Protected (Patient) | Patient dashboard with upcoming visits and profile details |
| `/patient/my-appointments`| Protected (Patient) | Patient's personal consultation registry |
| `/admin/dashboard` | Protected (Admin) | Admin Overview with live stats and **Pending Approvals Queue** |
| `/admin/doctors` | Protected (Admin) | Onboard new doctors, assign department, configure weekly slots |
| `/admin/appointments`| Protected (Admin) | Hospital-wide consultation records with **Admin Approval Actions** |

---

## 💡 Key Frontend Features

### 1. Transparent Authentication Fallback
When Firebase throws `auth/operation-not-allowed` (e.g. if Email/Password provider is not activated in the Firebase Console), [AuthContext.jsx](file:///c:/Users/Akshat/.gemini/antigravity/scratch/hostital-managment/frontend/src/context/AuthContext.jsx) automatically catches the error and executes registration directly against the backend `/api/auth/register` endpoint. The patient is authenticated seamlessly without seeing any error modal.

### 2. 10-Digit Mobile Number Validation
The registration form enforces valid 10-digit phone numbers:
```javascript
const cleanPhone = formData.phone.trim().replace(/\D/g, '');
if (cleanPhone.length !== 10) {
  toast.error('Please enter a valid 10-digit mobile contact number');
  return;
}
```

### 3. Real-Time Slot Locking UI
When a patient selects a date on [AppointmentBookingPage.jsx](file:///c:/Users/Akshat/.gemini/antigravity/scratch/hostital-managment/frontend/src/pages/AppointmentBookingPage.jsx) or [DoctorProfile.jsx](file:///c:/Users/Akshat/.gemini/antigravity/scratch/hostital-managment/frontend/src/pages/patient/DoctorProfile.jsx):
- The client calls `GET /api/appointments/booked-slots?doctorId={id}&date={date}`.
- Booked time slots are styled with a red border, marked as `"Reserved"`, and disabled (`disabled={isReserved}`).
- Patients can only click available slots, eliminating double-booking attempts before submission.

### 4. 1-Click Admin Approval Actions
On [AllAppointments.jsx](file:///c:/Users/Akshat/.gemini/antigravity/scratch/hostital-managment/frontend/src/pages/admin/AllAppointments.jsx) and [AdminDashboard.jsx](file:///c:/Users/Akshat/.gemini/antigravity/scratch/hostital-managment/frontend/src/pages/AdminDashboard.jsx):
- Pending appointments display green **Confirm** and red **Cancel** buttons.
- Confirmed appointments display blue **Complete** and red **Cancel** buttons.
- Clicking an action immediately updates the status via `updateAppointmentStatus(id, { status })` and shows instant toast feedback.

---

## 🛠️ Scripts & Commands

```bash
# Install dependencies
npm install

# Start Vite dev server on http://localhost:3000
npm run dev

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

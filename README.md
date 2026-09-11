# HealthDesk — Hospital Outpatient & Appointment Management System

A production-ready Hospital OPD & Consultation Management Platform localized for **Sanjeevani Multi-Speciality Hospital & Research Institute** (Sector 62, Institutional Area, Noida, Delhi NCR). HealthDesk provides end-to-end appointment scheduling, physician roster management, field-level validation, and database-level concurrency protection against double bookings.

---

## 🏗️ Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     HealthDesk Frontend (React + Vite)                  │
│   ┌───────────────────────┬──────────────────────┬──────────────────┐   │
│   │   Patient Portal      │    Doctor Portal     │   Admin Terminal │   │
│   │ • Search Specialists  │  • OPD Roster        │ • Faculty Roster │   │
│   │ • Book Slots (IST)    │  • Weekly Timetable  │ • Appt Register  │   │
│   │ • My Consultations    │  • Clinical Notes    │ • Real-time Stats│   │
│   └───────────┬───────────┴──────────┬───────────┴─────────┬────────┘   │
└───────────────┼──────────────────────┼─────────────────────┼────────────┘
                │                      │                     │
                ▼                      ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Express API Gateway (Port 5000)                    │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  Middleware Layer:                                              │   │
│   │  • authMiddleware (Firebase ID Token verification & claims)     │   │
│   │  • checkRole ('patient', 'doctor', 'admin')                     │   │
│   │  • validate (Zod field-level validation schemas)                │   │
│   │  • errorHandler (Centralized Mongoose, Zod & Firebase errors)   │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│        MongoDB Database         │         │      Firebase Cloud Platform    │
│  • Unique Compound Index:       │         │  • Firebase Authentication      │
│    { doctorRef, date, time }    │         │    (RBAC custom claims & tokens)│
│  • Doctor Weekly Templates      │         │  • Cloud Firestore              │
│  • Clinical OPD Consultations   │         │    (Realtime patient sync)      │
│  • User Profile Documents       │         │                                 │
└─────────────────────────────────┘         └─────────────────────────────────┘
```

---

## 🚀 Key Features

1. **Role-Based Access Control (RBAC):**
   - **Patients:** Browse hospital departments, search doctors by specialization, view real-time available time slots, book appointments, and cancel bookings with in-app confirmation.
   - **Doctors:** Access daily OPD appointment roster, update consultation statuses (`Pending` &rarr; `Confirmed` &rarr; `Completed`), record clinical examination notes, and view their weekly OPD timetable.
   - **Admins:** Manage medical faculty profiles, configure weekly availability templates, monitor live hospital stats, and inspect the centralized consultation register with multi-criteria filters.

2. **DB-Level Concurrency & Date Safety:**
   - Mongoose unique compound index (`{ doctorRef: 1, appointmentDate: 1, time: 1 }`) prevents double booking even under high concurrent load.
   - Date validation compares incoming booking dates strictly against Indian Standard Time (IST) calendar dates to reject past bookings.
   - Weekly template validation verifies that the booked date falls on an active weekday and time slot configured for that physician.

3. **Field-Level Validation & Centralized Error Handling:**
   - Strict Zod schemas on all mutating endpoints (`POST`, `PUT`, `PATCH`).
   - Centralized `errorHandler` maps MongoDB `11000` duplicate key errors, Mongoose `ValidationError`, `CastError`, and Firebase `auth/` errors into structured, user-friendly responses.

4. **Polished Hospital UI:**
   - Reusable `Loader`, `EmptyState`, and `ConfirmDialog` components across all views.
   - Double-submit prevention on all forms (`disabled={loading}`).
   - Universal `Navbar` across Patient, Doctor, and Hospital Admin screens.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Date-fns, React Hot Toast
- **Backend:** Node.js, Express 4, Mongoose 8, Zod, Morgan, Cors, Dotenv
- **Authentication & Cloud:** Firebase Auth, Firebase Admin SDK, Cloud Firestore
- **Database:** MongoDB (Local or MongoDB Atlas)

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **MongoDB**: Active local instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI
- **Firebase Project**: Service account credentials or configured `.env` file

---

## ⚙️ Environment Configuration

### Client Configuration (`/client/.env`)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
```

### Server Configuration (`/server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/healthdesk
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
ADMIN_EMAIL=admin@healthdesk.org
ADMIN_PASSWORD=Admin@123456
```

---

## 📦 Setup & Installation

### 1. Install Dependencies
```bash
# Install root/client dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Database Seeding
To populate Sanjeevani Hospital with 6 specialized physicians (Cardiology, Orthopaedics, Neurology, Paediatrics, Dermatology, General Medicine) and sample consultations:
```bash
cd server
npm run seed
# Or skip confirmation prompt:
npm run seed:force
```

### 3. Provision Admin Account
To create or update the executive hospital administrator:
```bash
cd server
npm run create-admin
```

---

## 🏃 Running the Application

### Option A: Running Development Servers
```bash
# Terminal 1 — Start the Backend API (Port 5000)
cd server
npm run dev

# Terminal 2 — Start the Client UI (Port 3000)
npm run dev
```

### Option B: Production Build
```bash
npm run build
npm start
```

---

## 📂 Project Structure

```text
├── client/
│   ├── src/
│   │   ├── api/                   # Axios / fetch API wrappers
│   │   │   ├── appointmentApi.js  # Patient, Doctor & Admin booking APIs
│   │   │   └── doctorApi.js       # Doctor search & roster management APIs
│   │   ├── components/            # Reusable UI components
│   │   │   ├── AppointmentStatusBadge.jsx
│   │   │   ├── ConfirmDialog.jsx  # In-app accessible confirmation dialog
│   │   │   ├── EmptyState.jsx     # Visual empty data display
│   │   │   ├── Loader.jsx         # Uniform animated loading state
│   │   │   ├── Navbar.jsx         # Responsive global hospital header
│   │   │   └── ProtectedRoute.jsx # RBAC route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state & Firebase session sync
│   │   ├── pages/
│   │   │   ├── admin/             # Admin management screens
│   │   │   │   ├── AdminDoctors.jsx     # Doctor CRUD & availability
│   │   │   │   └── AllAppointments.jsx  # Central consultation registry
│   │   │   ├── doctor/            # Doctor OPD screens
│   │   │   │   ├── DoctorAppointments.jsx # Patient appointment roster
│   │   │   │   └── DoctorSchedule.jsx     # Weekly timetable view
│   │   │   ├── patient/           # Patient booking screens
│   │   │   │   ├── FindDoctors.jsx      # Doctor search & department filter
│   │   │   │   ├── DoctorProfile.jsx    # Doctor profile & date/slot picker
│   │   │   │   └── MyAppointments.jsx   # Consultation history & cancel
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── SignIn.jsx
│   │   │   └── SignUp.jsx
│   │   └── App.jsx                # Application routes & toaster provider
│   └── package.json
│
├── server/
│   ├── config/
│   │   ├── db.js                  # Mongoose MongoDB connection
│   │   └── firebaseAdmin.js       # Firebase Admin initialization
│   ├── controllers/
│   │   ├── appointmentController.js # Booking, status updates, cancellation
│   │   ├── authController.js        # User registration & claims
│   │   └── doctorController.js      # Doctor CRUD & schedule queries
│   ├── middleware/
│   │   ├── auth.js                # Token verification & checkRole
│   │   ├── errorHandler.js        # Centralized error shape & status mapping
│   │   └── validate.js            # Zod request validation middleware
│   ├── models/
│   │   ├── Appointment.js         # Unique compound index schema
│   │   ├── Doctor.js              # Doctor & weekly template schemas
│   │   └── User.js                # User RBAC document schema
│   ├── routes/
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   └── doctorRoutes.js
│   ├── scripts/
│   │   ├── createAdmin.js         # Admin provisioning script
│   │   └── seed.js                # Interactive database seeder
│   ├── server.js                  # Express application entry point
│   └── package.json
│
└── README.md
```

---

## 🔒 Security & Concurrency Design

- **Compound Unique Index:** `appointmentSchema.index({ doctorRef: 1, appointmentDate: 1, time: 1 }, { unique: true })` guarantees that duplicate slot booking attempts are rejected at the database engine level with standard MongoDB `E11000` errors.
- **State Transition Guard:** Doctor appointment status updates enforce legal transitions (`pending` &rarr; `confirmed` &rarr; `completed` / `cancelled`), preventing invalid state changes.
- **Role Verification:** All administrative and clinical routes verify both the client's decoded Firebase token and their verified database document role before granting execution.

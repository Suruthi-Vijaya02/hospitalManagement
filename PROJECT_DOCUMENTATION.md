# Nexus Med OS — Complete Project Documentation

> **Version:** 2.5 | **Stack:** Next.js · Node.js · MongoDB · Tailwind CSS · Framer Motion  
> **Purpose:** A full-stack, role-based Hospital Management System for clinical operations.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication & Roles](#4-authentication--roles)
5. [Database Models (MongoDB)](#5-database-models-mongodb)
6. [Backend API Reference](#6-backend-api-reference)
7. [Frontend Modules](#7-frontend-modules)
8. [Role-Based Access Map](#8-role-based-access-map)
9. [Design System](#9-design-system)
10. [Environment Setup](#10-environment-setup)
11. [Running the Project](#11-running-the-project)
12. [Key Architectural Decisions](#12-key-architectural-decisions)

---

## 1. Project Overview

**Nexus Med OS** is a professional-grade hospital management system designed to replace paper-based workflows with a unified digital platform. It covers the entire hospital lifecycle:

- Patient registration & medical records
- Doctor consultations & clinical notes
- Appointment scheduling with role-based views
- In-Patient Department (IPD) bed management
- Lab test ordering & report management
- Pharmacy dispensing queue
- Inventory & stock alert system
- Billing & invoice generation
- Admin user management & role control

The system uses a **Hybrid UI Theme** — a dark sidebar navigation paired with a high-contrast white content workspace — giving it a premium, clinical aesthetic.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 16.2.1 (App Router) | React-based UI with server/client components |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Animations** | Framer Motion | Smooth page and component transitions |
| **UI Components** | shadcn/ui (Card, Button, Badge, Input, Skeleton) | Base accessible components |
| **HTTP Client** | Axios (via `@/lib/axios`) | API calls with JWT auth header injection |
| **State Management** | Zustand (`useAuthStore`) | Global auth/user state |
| **Backend** | Node.js + Express.js | REST API server |
| **Database** | MongoDB (via Mongoose) | Persistent data storage |
| **Authentication** | JWT (JSON Web Tokens) | Stateless auth with role claims |
| **File Uploads** | Multer | Lab report PDF/image uploads |
| **Logging** | Custom middleware → MongoDB AuditLog | All HTTP requests logged |

---

## 3. Project Structure

```
hospitalManagement/
├── backend/
│   └── src/
│       ├── app.js                  # Express app config, route registration
│       ├── server.js               # Entry point, DB connection
│       ├── config/
│       │   └── db.js               # MongoDB connection (Mongoose)
│       ├── models/                 # Mongoose schemas (see Section 5)
│       │   ├── Patient.model.js
│       │   ├── Appointment.model.js
│       │   ├── Consultation.model.js
│       │   ├── Admission.model.js
│       │   ├── Bed.model.js
│       │   ├── Bill.model.js
│       │   ├── Lab.model.js
│       │   ├── LabTest.model.js
│       │   ├── Medicine.model.js
│       │   ├── PharmacyQueue.model.js
│       │   ├── User.model.js
│       │   └── AuditLog.model.js
│       ├── controllers/            # Business logic (see Section 6)
│       ├── routes/v1/              # Express route definitions
│       ├── middlewares/
│       │   ├── auth.middleware.js  # JWT verification (authMiddleware)
│       │   ├── role.middleware.js  # Role-based access guard
│       │   ├── logger.middleware.js # Request logger → MongoDB
│       │   └── error.middleware.js  # Global error handler
│       └── uploads/                # Multer file storage (lab reports)
│
└── frontend/
    └── src/
        ├── app/
        │   ├── login/page.jsx          # Login screen
        │   └── dashboard/
        │       ├── layout.jsx          # Shared layout: Sidebar + Topbar
        │       ├── page.jsx            # Dashboard Home (KPIs + alerts)
        │       ├── admin/page.jsx      # Admin: User management
        │       ├── appointments/page.jsx # Appointment Scheduler
        │       ├── patients/page.jsx   # Patient Registry
        │       ├── consultations/page.jsx # Doctor Consultation Notes
        │       ├── ipd/page.jsx        # IPD Bed Management
        │       ├── lab/page.jsx        # Lab Test Management
        │       ├── pharmacy/page.jsx   # Pharmacy Queue
        │       ├── inventory/page.jsx  # Medicine Inventory
        │       └── billing/page.jsx    # Billing & Invoices
        ├── components/
        │   ├── common/
        │   │   ├── Sidebar.jsx         # Role-aware navigation sidebar
        │   │   └── CustomSelect.jsx    # Premium dropdown (Framer Motion + Portal)
        │   └── ui/                     # shadcn/ui base components
        ├── lib/
        │   └── axios.js               # Axios instance with auth header
        ├── services/
        │   └── patient.service.js     # Patient API service functions
        └── store/
            └── auth.store.js          # Zustand auth store
```

---

## 4. Authentication & Roles

### Login Flow
1. User submits email + password to `POST /api/v1/auth/login`
2. Backend validates credentials, returns a **JWT** containing `{ id, name, role }`
3. Frontend stores token in `useAuthStore` (Zustand + localStorage)
4. `@/lib/axios` automatically injects `Authorization: Bearer <token>` on every request
5. Backend `authMiddleware` verifies token on every protected route

### Available Roles

| Role | Description |
|---|---|
| `Admin` | Full system access — user management, all modules |
| `Doctor` | Consultations, own appointments, IPD |
| `Receptionist` | Patient intake, all appointments, billing, IPD |
| `Lab` | Lab test management only |
| `Pharmacist` | Pharmacy queue + inventory |

### Auth Middleware
```js
// backend/src/middlewares/auth.middleware.js
exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; // { id, name, role }
  next();
};
```

### Role Middleware (example)
```js
router.post("/", authMiddleware, roleMiddleware("Receptionist", "Admin"), createPatient);
```

---

## 5. Database Models (MongoDB)

### Patient
```
upid (unique)    name         age          gender
phone            address      bloodGroup   symptoms
appointmentDate  appointmentTime           timestamps
```

### Appointment *(New)*
```
patientId (ref)  upid         patientName  doctorName
department       appointmentDate           appointmentTime
reason           status [Scheduled|Completed|Cancelled|No-Show]
bookedBy (ref)   notes        timestamps
```
**Departments:** General, Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, ENT, Ophthalmology, Gynecology, Oncology

### Consultation
```
patientId (ref)  doctorId (ref)  symptoms      diagnosis
prescription     notes           timestamps
```

### Admission (IPD)
```
patientId (ref)  bedId (ref)  admittedAt    dischargedAt
status           reason       timestamps
```

### Bed
```
bedNumber        ward         status [Available|Occupied|Maintenance]
patientId (ref)  timestamps
```

### Bill
```
patientId (ref)  items[]      totalAmount   status [Paid|Pending|Cancelled]
paymentMethod    timestamps
```

### Lab
```
patientId (ref)  testName     status [Pending|In Progress|Completed]
result           reportUrl    timestamps
```

### Medicine (Inventory)
```
medicineName     batchNumber  manufacturer  stock
reorderLevel     expiryDate   price         timestamps
```
> **Stock Alert:** Dashboard flags any medicine where `stock <= reorderLevel`

### PharmacyQueue
```
patientId (ref)  medicines[]  status        dispensedAt
timestamps
```

### User
```
name             email        password (hashed)  role
timestamps
```

### AuditLog
```
method           url          statusCode    responseTime
ip               userAgent    timestamps
```

---

## 6. Backend API Reference

Base URL: `http://localhost:5000/api/v1`

All routes require `Authorization: Bearer <token>` header unless noted.

### Auth Routes `/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/users` | Admin | List all users |
| PUT | `/auth/users/:id/role` | Admin | Change user role |

### Patient Routes `/patients`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/patients` | Receptionist, Admin | Create patient |
| GET | `/patients` | All | List all patients |
| GET | `/patients/:upid` | All | Get by UPID |
| PUT | `/patients/:upid` | Receptionist, Admin | Update patient |

### Appointment Routes `/appointments` *(New)*
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/appointments` | All | Book appointment |
| GET | `/appointments` | All | List (filter: date, status, dept) |
| GET | `/appointments/today` | All | Today's appointments |
| GET | `/appointments/stats` | All | Count stats |
| PUT | `/appointments/:id/status` | All | Update status |
| PUT | `/appointments/:id/cancel` | All | Cancel |

### Consultation Routes `/consultations`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/consultations` | Create consultation note |
| GET | `/consultations` | List all consultations |
| GET | `/consultations/:id` | Get by ID |

### IPD Routes `/ipd`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/ipd/beds` | List all beds |
| POST | `/ipd/beds` | Add new bed |
| PUT | `/ipd/beds/:id` | Update bed |
| POST | `/ipd/admissions` | Admit patient |
| PUT | `/ipd/admissions/:id/discharge` | Discharge patient |

### Lab Routes `/lab`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/lab` | List all lab tests |
| POST | `/lab` | Create lab test request |
| PUT | `/lab/:id` | Update test status/result |
| POST | `/lab/:id/upload` | Upload report file |

### Pharmacy Routes `/pharmacy`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/pharmacy` | List pharmacy queue |
| POST | `/pharmacy` | Add to queue |
| PUT | `/pharmacy/:id` | Update dispense status |

### Medicine (Inventory) Routes `/medicine`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/medicine` | List all medicines |
| POST | `/medicine` | Add medicine |
| PUT | `/medicine/:id/stock` | Update stock |

### Billing Routes `/billing`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/billing` | List bills |
| POST | `/billing` | Create invoice |
| PUT | `/billing/:id` | Update bill |

### Dashboard Routes `/dashboard`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Returns: totalPatients, consultationsToday, pendingLabReports, totalMedicines, lowStockMedicines, appointmentsToday, appointmentsScheduled, lowStockItems[] |

---

## 7. Frontend Modules

### Dashboard Home (`/dashboard`)
- **KPI cards:** Total Patients, Today's Appointments, Pending Lab Reports, Low Stock Medicines
- **Today's Appointments list:** Live from MongoDB
- **Stock Alert panel:** Red warning card when medicines are below reorder level
- **Departmental Workload:** Animated progress bars
- **Quick Actions:** Navigate to key modules

### Appointments (`/dashboard/appointments`)
**Role-aware:**
- **Receptionist/Admin:** Sees ALL appointments, can book for any patient + any doctor
- **Doctor:** Sees ONLY their own appointments, doctor name is pre-filled and locked in booking modal
- **Features:** Date navigator, status filters, stat cards, "Done / No-Show / Cancel" actions inline

### Patients (`/dashboard/patients`)
- Grid + List view toggle
- Patient registration modal (dark theme)
- Auto-generates UPID (Unique Patient ID)
- Fields: Name, Age, Gender, Phone (+91), Blood Group, Address, Appointment Date/Time

### Consultations (`/dashboard/consultations`)
- Doctor writes consultation notes
- Links to patient via UPID lookup
- Stores symptoms, diagnosis, prescription

### IPD — In-Patient Department (`/dashboard/ipd`)
- Live bed map (Available / Occupied / Maintenance)
- Admit patient → links patient to bed
- Discharge patient → frees the bed

### Lab (`/dashboard/lab`)
- Lab technician creates test requests
- Upload report files (PDFs/images via Multer)
- Status workflow: Pending → In Progress → Completed

### Pharmacy (`/dashboard/pharmacy`)
- Dispensing queue management
- Mark prescriptions as dispensed

### Inventory (`/dashboard/inventory`)
- Medicine stock levels
- `reorderLevel` field triggers low-stock alerts on dashboard
- Add medicine, update stock quantity

### Billing (`/dashboard/billing`)
- Create itemized invoices linked to patients
- Mark as Paid / Pending / Cancelled

### Admin Terminal (`/dashboard/admin`)
- View all registered users
- Change user roles via CustomSelect dropdown
- Role changes take effect on next login

---

## 8. Role-Based Access Map

| Module | Admin | Doctor | Receptionist | Lab | Pharmacist |
|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Appointments | ✅ Full | ✅ Own only | ✅ Full | ❌ | ❌ |
| Patients | ✅ | ❌ | ✅ | ❌ | ❌ |
| Consultations | ❌ | ✅ | ❌ | ❌ | ❌ |
| IPD | ✅ | ✅ | ✅ | ❌ | ❌ |
| Lab | ❌ | ❌ | ❌ | ✅ | ❌ |
| Pharmacy | ❌ | ❌ | ❌ | ❌ | ✅ |
| Inventory | ❌ | ❌ | ❌ | ❌ | ✅ |
| Billing | ❌ | ❌ | ✅ | ❌ | ❌ |
| Admin Terminal | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 9. Design System

### Theme: Hybrid Dark/White
- **Sidebar:** `bg-slate-900` — dark navigation shell
- **Content area:** `bg-white` / `bg-slate-50` — high-contrast white workspace
- **Borders:** `border-slate-300` (content) / `border-slate-800` (sidebar)
- **Modals:** Dark theme (`bg-slate-900`) for all form modals
- **Primary color:** Defined as `primary` in Tailwind config (typically a blue/indigo)

### Typography
- Font: `Inter` (Google Fonts) — `font-inter` class on root
- Labels: `text-[10px] font-black uppercase tracking-widest`
- Headings: `text-4xl font-bold tracking-tight`
- Body: `text-sm font-medium`

### Key Components

#### `CustomSelect` (`src/components/common/CustomSelect.jsx`)
A premium dropdown replacement for native `<select>`. Features:
- **React Portal rendering** — mounts to `document.body` to avoid `overflow: hidden` clipping
- **Smart flip** — detects viewport space and opens upward if insufficient space below
- **Variants:** `light` (for white backgrounds) and `dark` (for modal backgrounds)
- **Framer Motion** animations on open/close

```jsx
<CustomSelect
  options={["Admin", "Doctor", "Receptionist"]}
  value={selectedRole}
  onChange={(val) => setSelectedRole(val)}
  variant="light"   // or "dark" inside modals
  label="Role"
/>
```

#### `Sidebar` (`src/components/common/Sidebar.jsx`)
- Role-aware — each role sees only relevant modules
- Collapsible (80px collapsed / 280px expanded)
- Active route highlighted with animated indicator (`layoutId="sidebar-active"`)

---

## 10. Environment Setup

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Frontend Axios Config (`src/lib/axios.js`)
```js
// Automatically injects Bearer token from localStorage
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 11. Running the Project

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### Backend
```bash
cd hospitalManagement/backend
npm install
npm start          # Runs on http://localhost:5000
```

> ⚠️ **Important:** Always restart the backend after adding new route files. Node.js does not hot-reload `require()` statements.

### Frontend
```bash
cd hospitalManagement/frontend
npm install
npm run dev        # Runs on http://localhost:3000
```

### First-Time Setup
1. Start MongoDB
2. Start backend (`npm start`)
3. Register first user via `POST /api/v1/auth/register` with role `Admin`
4. Login via the UI at `http://localhost:3000/login`
5. Use Admin Terminal to create additional users with appropriate roles

---

## 12. Key Architectural Decisions

### Why React Portals for CustomSelect?
The dropdown menus in tables were being clipped by `overflow: hidden` on parent containers. Using `createPortal(menu, document.body)` renders the dropdown at the top DOM level, completely bypassing any parent overflow constraints.

### Why Zustand for State?
Lightweight, no boilerplate, works perfectly with Next.js App Router's client components. Auth state (`user`, `token`, `logout`) is accessible from any component via `useAuthStore()`.

### Why Promise.allSettled on Dashboard?
The dashboard fetches multiple APIs simultaneously. Using `Promise.allSettled` instead of `Promise.all` ensures that if one API endpoint fails (e.g., appointments endpoint not yet restarted), the rest of the dashboard still loads correctly.

### Why Role-Based Sidebar (not route guards)?
The sidebar controls navigation visibility. Each role's menu is defined as a static map in `Sidebar.jsx`. This is pragmatic for a clinical system where roles are clearly defined and don't overlap. Backend route middleware (`roleMiddleware`) enforces actual security.

### UPID (Unique Patient ID)
Each patient gets a system-generated UPID (format: `NMxxxx`). This is the primary cross-module identifier — used in appointments, consultations, lab tests, billing, and pharmacy to link records without needing to know the MongoDB `_id`.

---

## Appendix: Module Status

| Module | Backend | Frontend | MongoDB | Status |
|---|---|---|---|---|
| Auth | ✅ | ✅ | ✅ | Complete |
| Patients | ✅ | ✅ | ✅ | Complete |
| Appointments | ✅ | ✅ | ✅ | Complete |
| Consultations | ✅ | ✅ | ✅ | Complete |
| IPD / Beds | ✅ | ✅ | ✅ | Complete |
| Lab | ✅ | ✅ | ✅ | Complete |
| Pharmacy | ✅ | ✅ | ✅ | Complete |
| Inventory | ✅ | ✅ | ✅ | Complete |
| Billing | ✅ | ✅ | ✅ | Complete |
| Admin | ✅ | ✅ | ✅ | Complete |
| Dashboard | ✅ | ✅ | ✅ | Complete |

---

*Documentation last updated: April 2026*  
*Nexus Med OS v2.5 — Built with Next.js, Express, MongoDB*

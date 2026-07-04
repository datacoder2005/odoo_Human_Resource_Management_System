# HRMS — Human Resource Management System

A full-stack HRMS web application built with React + Vite, Node.js + Express, and MongoDB Atlas.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, CSS (custom design system) |
| Backend | Node.js, Express 4, JWT, bcryptjs, express-validator |
| Database | MongoDB Atlas via Mongoose |
| Notifications | react-hot-toast |
| Icons | lucide-react |

---

## Project Structure

```
hrms/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # register + login
│   │   ├── userController.js     # CRUD for users/profiles
│   │   └── payrollController.js  # payroll CRUD
│   ├── middleware/authMiddleware.js  # protect + adminOnly
│   ├── models/
│   │   ├── userModel.js
│   │   ├── profileModel.js
│   │   ├── payrollModel.js
│   │   └── attendanceModel.js    # stub
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── payrollRoutes.js
│   │   └── seedRoutes.js         # dev only
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/                   # axios + typed API wrappers
    │   ├── components/
    │   │   ├── layout/            # Sidebar, Navbar, DashboardLayout
    │   │   └── ui/                # Avatar, Badge, LoadingSpinner, EmptyState
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Payroll.jsx
    │   │   ├── Attendance.jsx     # stub
    │   │   └── Leave.jsx          # stub
    │   ├── App.jsx
    │   ├── index.css              # full design system
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Setup Instructions

### 1. Clone & navigate
```bash
git clone <repo-url>
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
npm install
npm run dev     # starts on http://localhost:5000
```

Your `.env` file:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/hrms?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev     # starts on http://localhost:5173
```

### 4. Seed demo data (optional but recommended)
```bash
# With the backend running, call:
curl -X POST http://localhost:5000/api/seed

# Or open in browser: POST via Postman/Insomnia
```

Demo credentials after seeding:
| Role | Email | Password |
|---|---|---|
| Admin | admin@hrms.com | admin123 |
| Employee | james@hrms.com | employee123 |
| Employee | priya@hrms.com | employee123 |

---

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login + get JWT |

### Users (Bearer token required)
| Method | Route | Access |
|---|---|---|
| GET | /api/users/me | Self |
| PUT | /api/users/me | Self (limited fields) |
| GET | /api/users | Admin only |
| GET | /api/users/:id | Admin only |
| PUT | /api/users/:id | Admin only |

### Payroll
| Method | Route | Access |
|---|---|---|
| GET | /api/payroll/me | Self |
| GET | /api/payroll | Admin only |
| GET | /api/payroll/:userId | Admin only |
| POST | /api/payroll | Admin only |
| PUT | /api/payroll/:id | Admin only |

### Dev only
| Method | Route |
|---|---|
| POST | /api/seed |

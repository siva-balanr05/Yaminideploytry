# Yamini Infotech - Enterprise Business Management System

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791.svg?logo=postgresql)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

**A comprehensive ERP solution for business operations management**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [User Roles & Portals](#-user-roles--portals)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🎯 Overview

Yamini Infotech Business Management System is a full-stack enterprise resource planning (ERP) application designed to streamline business operations. It provides role-based portals for different user types including Admin, Reception, Salesman, Service Engineers, Office Staff, and Customers.

The system handles customer relationship management (CRM), sales tracking, service complaint management, inventory control, employee attendance, and much more.

---

## ✨ Features

### Core Modules

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT-based secure login with role-based access control (RBAC) |
| 👥 **Customer Management** | Complete CRM with customer profiles, history, and interactions |
| 📞 **Enquiry Management** | Track and manage sales enquiries with follow-up history |
| 🛠️ **Service Requests** | Complaint registration, assignment, and SLA tracking |
| 💼 **Sales Management** | Sales calls, shop visits, targets, and performance analytics |
| 📦 **Inventory & Products** | Product catalog, stock movements, and order management |
| 📍 **Attendance System** | GPS-based attendance with photo verification |
| 🔔 **Notifications** | Real-time in-app notifications and reminders |
| 📊 **Analytics & Reports** | Comprehensive dashboards and business reports |
| 🤖 **AI Chatbot** | Intelligent chatbot for customer support |
| 📝 **MIF Management** | Machine Installation Forms with mandatory audit logging |

### Key Highlights

- ✅ **Multi-Portal Architecture** - Dedicated interfaces for each user role
- ✅ **Real-time Notifications** - Instant alerts for important events
- ✅ **SLA Management** - Track service level agreements automatically
- ✅ **Audit Logging** - Complete audit trail for sensitive operations
- ✅ **Mobile Responsive** - Works on desktop, tablet, and mobile devices
- ✅ **API Documentation** - Auto-generated Swagger/OpenAPI docs
- ✅ **Automated Scheduling** - Background tasks for reminders and reports

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI Framework |
| Vite | 5.0 | Build Tool & Dev Server |
| React Router | 6.20 | Client-side Routing |
| Axios | 1.13 | HTTP Client |
| Lucide React | 0.562 | Icon Library |
| jsPDF | 4.0 | PDF Generation |
| Cypress | 15.8 | E2E Testing |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | Latest | Web Framework |
| SQLAlchemy | Latest | ORM |
| PostgreSQL | 12+ | Database |
| JWT (PyJWT) | Latest | Authentication |
| Bcrypt | Latest | Password Hashing |
| Pydantic | Latest | Data Validation |
| APScheduler | Latest | Task Scheduling |

---

## 📁 Project Structure

```
yamini-infotech/
├── 📂 backend/                    # FastAPI Backend
│   ├── main.py                    # Application entry point
│   ├── database.py                # Database configuration
│   ├── models.py                  # SQLAlchemy models
│   ├── schemas.py                 # Pydantic schemas
│   ├── auth.py                    # JWT & RBAC logic
│   ├── crud.py                    # Database operations
│   ├── scheduler.py               # Background task scheduler
│   ├── audit_logger.py            # Audit logging system
│   ├── notification_service.py    # Notification handling
│   ├── sla_utils.py               # SLA calculations
│   ├── 📂 routers/                # API Route Modules
│   │   ├── auth_routes.py         # Authentication endpoints
│   │   ├── customers.py           # Customer CRUD
│   │   ├── enquiries.py           # Enquiry management
│   │   ├── complaints.py          # Service complaints
│   │   ├── service_requests.py    # Service request handling
│   │   ├── service_engineer.py    # Engineer assignments
│   │   ├── sales.py               # Sales tracking
│   │   ├── products.py            # Product catalog
│   │   ├── orders.py              # Order management
│   │   ├── invoices.py            # Invoice generation
│   │   ├── attendance.py          # Attendance tracking
│   │   ├── mif.py                 # MIF records (audit logged)
│   │   ├── analytics.py           # Business analytics
│   │   ├── reports.py             # Report generation
│   │   ├── chatbot.py             # AI Chatbot API
│   │   └── ...                    # Other route modules
│   ├── 📂 services/               # Business Logic Services
│   │   └── chatbot_ai.py          # AI chatbot intelligence
│   └── 📂 uploads/                # File uploads storage
│
├── 📂 frontend/                   # React Frontend
│   ├── index.html                 # HTML entry point
│   ├── package.json               # Node.js dependencies
│   ├── vite.config.js             # Vite configuration
│   ├── 📂 src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Main application component
│   │   ├── styles.css             # Global styles
│   │   ├── 📂 admin/              # Admin Portal
│   │   │   ├── pages/             # Admin pages
│   │   │   ├── components/        # Admin components
│   │   │   ├── layout/            # Admin layout
│   │   │   └── services/          # Admin API services
│   │   ├── 📂 reception/          # Reception Portal
│   │   │   └── pages/             # Reception pages
│   │   ├── 📂 salesman/           # Salesman Portal
│   │   │   ├── pages/             # Salesman pages
│   │   │   ├── components/        # Salesman components
│   │   │   ├── layout/            # Salesman layout
│   │   │   └── hooks/             # Custom React hooks
│   │   ├── 📂 components/         # Shared Components
│   │   ├── 📂 contexts/           # React Contexts
│   │   ├── 📂 hooks/              # Shared Hooks
│   │   ├── 📂 layouts/            # Layout Components
│   │   ├── 📂 services/           # API Service Layer
│   │   ├── 📂 utils/              # Utility Functions
│   │   └── 📂 api/                # API Configuration
│   ├── 📂 public/                 # Static Assets
│   └── 📂 cypress/                # E2E Tests
│
├── 📂 docs/                       # Documentation
│   ├── 📂 admin/                  # Admin module docs
│   ├── 📂 guides/                 # User guides
│   ├── 📂 modules/                # Module documentation
│   └── 📂 security/               # Security docs
│
├── 📂 scripts/                    # Utility Scripts
│   ├── migrations/                # Database migrations
│   ├── setup/                     # Setup scripts
│   ├── tests/                     # Test scripts
│   └── utils/                     # Utility scripts
│
└── 📂 uploads/                    # Shared uploads directory
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.10+
- **PostgreSQL** 12+

### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE yamini_infotech;"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create environment file
cp .env.example .env

# Update database credentials in .env
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/yamini_infotech

# Install Python dependencies
pip install -r requirements.txt

# Initialize database (creates tables and seeds demo data)
python init_db.py

# Start development server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| ⚡ Backend API | http://localhost:8000 |
| 📚 API Docs | http://localhost:8000/docs |

---

## 👥 User Roles & Portals

### Demo Accounts

After running `init_db.py`, these demo accounts are available:

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| 👑 **Admin** | admin | admin123 | Full system access |
| 🏢 **Reception** | reception | reception123 | CRM & enquiry management |
| 💼 **Salesman** | salesman | sales123 | Sales calls, visits, attendance |
| 🔧 **Service Engineer** | engineer | engineer123 | Assigned complaints only |
| 📋 **Office Staff** | office | office123 | Operations, stock, MIF access |
| 👤 **Customer** | customer | customer123 | Own data, enquiries, bookings |

> ⚠️ **Security Warning:** Change all default passwords before deploying to production!

### Portal Features by Role

#### Admin Portal
- User management (CRUD operations)
- System settings configuration
- Analytics dashboards
- All module access
- Audit log viewing
- MIF access logs

#### Reception Portal
- Customer registration
- Enquiry management
- Visitor tracking
- Call routing
- Task assignment

#### Salesman Portal
- Daily call logging
- Shop visit recording
- GPS-based attendance
- Sales target tracking
- Customer interactions

#### Service Engineer Portal
- Assigned complaints view
- Status updates
- Service completion reports
- Attendance marking

#### Office Staff Portal
- Stock management
- Invoice generation
- MIF record access (logged)
- Report generation

#### Customer Portal
- View service history
- Track complaints
- Create bookings
- Provide feedback

---

## 📡 API Documentation

### Authentication Flow

```
1. POST /api/auth/login → Get JWT Token
2. Include token in headers: Authorization: Bearer <token>
3. Access protected endpoints
4. Token expires after 24 hours
```

### Key API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/logout` | Logout |

#### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customers/` | Create customer |
| GET | `/api/customers/` | List all customers |
| GET | `/api/customers/{id}` | Get customer by ID |
| PUT | `/api/customers/{id}` | Update customer |

#### Service Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints/` | Create complaint |
| GET | `/api/complaints/` | List all complaints |
| PUT | `/api/complaints/{id}/status` | Update status |
| GET | `/api/complaints/my-complaints` | Get engineer's complaints |

#### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sales/calls` | Log sales call |
| POST | `/api/sales/visits` | Log shop visit |
| GET | `/api/sales/my-calls` | Get salesman's calls |
| POST | `/api/sales/attendance` | Mark attendance |

### Interactive API Documentation

Visit `http://localhost:8000/docs` for Swagger UI with:
- All available endpoints
- Request/response schemas
- Authentication support
- Try-it-out functionality

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens** - Secure, stateless authentication
- **Bcrypt Hashing** - Industry-standard password encryption
- **Role-Based Access Control (RBAC)** - Granular permissions per role
- **Token Expiration** - 24-hour token validity

### Audit & Compliance
- **MIF Access Logging** - All Machine Installation Form access is logged
- **Audit Trail** - Complete history of critical operations
- **IP Tracking** - Record of access source
- **Timestamp Logging** - Precise timing of all actions

### Data Protection
- **Input Validation** - Pydantic schema validation
- **SQL Injection Prevention** - SQLAlchemy ORM protection
- **CORS Configuration** - Controlled cross-origin access
- **Sensitive Data Masking** - Protected confidential fields

---

## 🚀 Deployment

### Production Checklist

- [ ] Update `DATABASE_URL` with production PostgreSQL credentials
- [ ] Set strong `SECRET_KEY` (32+ random characters)
- [ ] Update CORS origins in `backend/main.py`
- [ ] Enable HTTPS/SSL
- [ ] Change all default passwords
- [ ] Build frontend: `npm run build`
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Use production WSGI server (gunicorn with uvicorn workers)

### Environment Variables

```env
# backend/.env
DATABASE_URL=postgresql://user:password@host:5432/yamini_infotech
SECRET_KEY=your-very-secure-random-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Running in Production

```bash
# Backend with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Frontend build
cd frontend && npm run build
# Serve dist/ folder with nginx or similar
```

---

## 📚 Additional Documentation

| Document | Description |
|----------|-------------|
| [CHATBOT_SETUP_GUIDE.md](CHATBOT_SETUP_GUIDE.md) | AI Chatbot configuration |
| [CHATBOT_DEPLOYMENT_GUIDE.md](CHATBOT_DEPLOYMENT_GUIDE.md) | Chatbot deployment instructions |
| [docs/ADMIN_NOTIFICATIONS_GUIDE.md](docs/ADMIN_NOTIFICATIONS_GUIDE.md) | Notification system guide |
| [docs/guides/QUICK_START.md](docs/guides/QUICK_START.md) | Quick start guide |
| [docs/guides/VOICE_INPUT_GUIDE.md](docs/guides/VOICE_INPUT_GUIDE.md) | Voice input feature guide |
| [frontend/ARCHITECTURE.md](frontend/ARCHITECTURE.md) | Frontend architecture details |

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Cannot connect to database | Verify PostgreSQL is running: `pg_isready` |
| Database does not exist | Create it: `psql -U postgres -c "CREATE DATABASE yamini_infotech;"` |
| Authentication failed | Check credentials in `.env` file |
| Demo data not seeding | Database must be empty for initial seed |
| CORS errors | Verify frontend URL is in CORS origins list |
| Port already in use | Kill existing process or use different port |

### Logs & Debugging

```bash
# Backend logs
uvicorn main:app --reload --log-level debug

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*-main.log
```

---

## 📄 License

**Proprietary Software** - Yamini Infotech © 2025-2026

All rights reserved. Unauthorized copying, modification, or distribution is prohibited.

---

<div align="center">

**Built with ❤️ by Yamini Infotech**

[Report Bug](mailto:support@yaminiinfotech.com) · [Request Feature](mailto:support@yaminiinfotech.com)

</div>

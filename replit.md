# Pukis Monitoring - Sales Dashboard Application

## Overview

Pukis Monitoring is a business intelligence application for tracking daily sales performance and expenses across multiple outlets. The application enables daily sales data entry, expense management (daily and monthly), performance analytics, and automated reporting for a food retail business. It provides real-time dashboards showing revenue, gross margins, and sales trends with the ability to generate WhatsApp-formatted summaries for quick sharing.

The system is designed with a mobile-first approach to support field operations, featuring touch-friendly inputs, clear data visualization, and efficient workflows for daily sales tracking and expense monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Separated Architecture

The application uses a separated frontend/backend architecture:
- **Frontend**: Next.js 14 (port 5000 in development)
- **Backend**: Python FastAPI (port 8000)
- **Database**: PostgreSQL (using DATABASE_URL environment variable)
- **Process Manager**: process-compose (runs both frontend and backend)

### Frontend Architecture

**Framework & Routing**
- Next.js 14 with App Router for React development
- React 18 with TypeScript for type-safe component development
- File-based routing via Next.js App Router (`app/` directory)
- Client components with "use client" directive

**State Management**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod validation for form state and input validation
- Local component state using React hooks
- JWT tokens stored in localStorage for authentication

**UI Component System**
- Shadcn/ui component library (New York style variant) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design-inspired approach prioritizing data clarity and mobile usability
- Custom typography system: Inter for UI text, JetBrains Mono for numeric/currency displays

**Data Visualization**
- Recharts library for rendering line charts, bar charts, and trend visualizations
- Custom MetricCard components for displaying KPIs
- Responsive grid layouts adapting from single column (mobile) to multi-column (desktop)

### Backend Architecture (FastAPI)

**Server Framework**
- Python FastAPI with async support
- Uvicorn ASGI server
- JWT-based authentication with bcrypt password hashing

**API Design**
- RESTful endpoints following resource-based URL patterns
- JSON request/response format
- Input validation using Pydantic schemas
- Centralized error handling with descriptive error messages
- CORS configured for frontend communication

**Database Layer**
- SQLAlchemy ORM for database operations
- PostgreSQL database (using DATABASE_URL environment variable)
- psycopg2-binary for PostgreSQL connectivity

### Project Structure

```
backend/                      # FastAPI Backend
├── app/
│   ├── main.py              # FastAPI application entry
│   ├── database.py          # SQLAlchemy database connection
│   ├── models/
│   │   └── models.py        # SQLAlchemy models (users, outlets, sales, expenses)
│   ├── routers/
│   │   ├── auth.py          # Authentication endpoints (login, logout, user)
│   │   ├── outlets.py       # Outlet CRUD endpoints
│   │   ├── sales.py         # Sales CRUD + MTD endpoints
│   │   └── expenses.py      # Expense CRUD endpoints
│   └── services/
│       └── auth.py          # JWT and password utilities
├── run.py                   # Uvicorn server runner
├── seed.py                  # Database seeding (super admin)
├── requirements.txt         # Python dependencies
└── pukis_monitoring.db      # SQLite database file

app/                          # Next.js App Router pages
├── admin-login/page.tsx      # Email/password login page
├── super-admin/              # Super admin pages
│   └── admins/page.tsx       # Admin management page
├── dashboard-harian/page.tsx # Daily dashboard
├── dashboard-mtd/page.tsx    # MTD dashboard
├── outlets/page.tsx          # Outlet management
├── expenses/page.tsx         # Expense management
├── layout.tsx                # Root layout with Providers
├── page.tsx                  # Sales input (home page)
└── not-found.tsx             # 404 page

src/
├── components/               # React components
│   ├── ui/                   # Shadcn/ui components
│   ├── app-sidebar.tsx       # Navigation sidebar
│   ├── authenticated-layout.tsx  # Auth wrapper (JWT-based)
│   └── providers.tsx         # QueryClient, Toaster
├── hooks/
│   └── use-auth.ts          # JWT authentication hook
└── lib/
    ├── queryClient.ts        # TanStack Query setup with JWT headers
    └── utils.ts              # Utility functions

shared/
└── schema.ts                 # Drizzle schema (kept for reference)
```

### Data Storage Solutions

**Database Schema (SQLite/SQLAlchemy)**

The application uses four primary tables:

1. **users** - Stores user authentication data
   - id: UUID primary key
   - email: Unique email address
   - first_name, last_name: User name fields
   - profile_image_url: Optional profile image
   - role: Enum (super_admin, owner, admin_outlet, finance)
   - password: bcrypt hashed (for admin users)
   - assigned_outlet_id: Foreign key to outlets (for admin_outlet role)
   - created_at: Timestamp

2. **outlets** - Stores outlet master data
   - id: UUID primary key
   - name: Outlet name
   - cogs_per_piece: Cost of goods sold per piece
   - created_at: Timestamp

3. **sales** - Daily sales transaction records
   - id: UUID primary key
   - outlet_id: Foreign key to outlets
   - date: Date field (YYYY-MM-DD format)
   - Payment channels: cash, qris, grab, gofood, shopee, tiktok
   - Inventory: total_sold, remaining, returned, total_production
   - sold_out_time: Optional timestamp
   - created_at: Timestamp

4. **expenses** - Daily, monthly, and salary expense records
   - id: UUID primary key
   - outlet_id: Foreign key to outlets
   - date: Date field (YYYY-MM-DD format)
   - type: Enum (harian, bulanan, gaji)
   - description: Expense details
   - amount: Expense value (>= 0)
   - receipt_url: Optional file upload path
   - created_at: Timestamp

### Authentication and Authorization

**JWT-Based Authentication:**
- Email/password login via POST /api/auth/login
- JWT tokens with configurable expiration
- Token stored in localStorage on frontend
- Authorization header: `Bearer <token>`
- Protected routes require valid JWT

**User Roles:**
- `super_admin` - Can create/manage other admin users, full system access
- `owner` - Full access to all outlets and data
- `admin_outlet` - Access to assigned outlet only
- `finance` - Read access for financial reporting

**Admin Management:**
- SUPER_ADMIN can create admin users via /super-admin/admins page
- Admin users login with email/password at /admin-login
- Sidebar shows "Manajemen Admin" menu for SUPER_ADMIN only

### External Dependencies

**Python Packages (Backend)**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM
- `python-jose` - JWT handling
- `passlib` + `bcrypt` - Password hashing
- `python-multipart` - File uploads
- `aiofiles` - Async file operations

**NPM Packages - Frontend**
- `next` - React framework with App Router
- `@tanstack/react-query` - Async state management and data fetching
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod integration for form validation
- `date-fns` - Date manipulation and formatting
- `recharts` - Charting library
- `lucide-react` - Icon library
- `react-icons` - Additional icon sets

**NPM Packages - UI Components**
- `@radix-ui/*` - Headless UI primitives
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Type-safe variant-based component styling
- `clsx` & `tailwind-merge` - Conditional class name utilities

### Environment Variables

**Frontend (.env or Replit Secrets):**
- `NEXT_PUBLIC_API_URL` - FastAPI backend URL (http://localhost:8000)

**Backend (.env or Replit Secrets):**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for JWT signing
- `PGDATABASE`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` - PostgreSQL credentials

## Running the Application

**Development (Using process-compose):**
```bash
./start.sh
# Or directly:
process-compose up -t=false
# Runs backend on http://localhost:8000
# Runs frontend on http://localhost:5000
```

**Manual Development (Separate Terminals):**

Terminal 1 - Backend:
```bash
cd backend
python run.py
# Runs on http://localhost:8000
```

Terminal 2 - Frontend:
```bash
npx next dev --port 5000
# Runs on http://localhost:5000
```

**Seed Super Admin:**
```bash
cd backend
python seed.py
# Creates: superadmin@pukis.id / superadmin123
```

**Production Build:**
```bash
# Both services with process-compose
process-compose up -t=false
```

## API Endpoints

**Authentication:**
- POST /api/auth/login - Login with email/password
- POST /api/auth/logout - Logout (invalidate token)
- GET /api/auth/user - Get current user info

**Outlets:**
- GET /api/outlets - List all outlets
- POST /api/outlets - Create outlet
- DELETE /api/outlets/{id} - Delete outlet

**Sales:**
- GET /api/sales - List sales (with filters: outlet_id, start_date, end_date)
- POST /api/sales - Create sale
- PATCH /api/sales/{id} - Update sale
- DELETE /api/sales/{id} - Delete sale
- GET /api/sales/mtd - Get MTD summary

**Expenses:**
- GET /api/expenses - List expenses (with filters: outlet_id, start_date, end_date, type)
- POST /api/expenses - Create expense (with optional file upload)
- DELETE /api/expenses/{id} - Delete expense

**Super Admin:**
- GET /api/super-admin/admins - List admin users
- POST /api/super-admin/admins - Create admin user
- DELETE /api/super-admin/admins/{id} - Delete admin user

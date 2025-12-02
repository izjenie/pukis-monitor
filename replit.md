# Pukis Monitoring - Sales Dashboard Application

## Overview

Pukis Monitoring is a business intelligence application for tracking daily sales performance and expenses across multiple outlets. The application enables daily sales data entry, expense management (daily and monthly), performance analytics, and automated reporting for a food retail business. It provides real-time dashboards showing revenue, gross margins, and sales trends with the ability to generate WhatsApp-formatted summaries for quick sharing.

The system is designed with a mobile-first approach to support field operations, featuring touch-friendly inputs, clear data visualization, and efficient workflows for daily sales tracking and expense monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- Next.js 14 with App Router for full-stack React development
- React 18 with TypeScript for type-safe component development
- File-based routing via Next.js App Router (`app/` directory)
- Server-side rendering (SSR) and client components with "use client" directive

**State Management**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod validation for form state and input validation
- Local component state using React hooks

**UI Component System**
- Shadcn/ui component library (New York style variant) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design-inspired approach prioritizing data clarity and mobile usability
- Custom typography system: Inter for UI text, JetBrains Mono for numeric/currency displays

**Data Visualization**
- Recharts library for rendering line charts, bar charts, and trend visualizations
- Custom MetricCard components for displaying KPIs
- Responsive grid layouts adapting from single column (mobile) to multi-column (desktop)

### Backend Architecture

**Server Framework**
- Next.js API Route Handlers in `app/api/` directory
- Node.js runtime with ES modules
- Serverless-compatible architecture

**API Design**
- RESTful endpoints following resource-based URL patterns
- JSON request/response format
- Input validation using Zod schemas derived from database models
- Centralized error handling with descriptive error messages

**Database Layer**
- Drizzle ORM for type-safe database operations
- Neon serverless PostgreSQL as the database provider
- WebSocket support via the @neondatabase/serverless driver
- Schema-first approach with TypeScript type inference

### Project Structure

```
app/                          # Next.js App Router pages
├── api/                      # API Route Handlers
│   ├── auth/                 # Authentication endpoints
│   │   ├── admin-login/route.ts  # Email/password login for admin users
│   │   ├── callback/route.ts     # OAuth callback
│   │   ├── login/route.ts        # Replit Auth login redirect
│   │   ├── logout/route.ts       # Logout handler
│   │   └── user/route.ts         # Current user info
│   ├── super-admin/              # Super admin endpoints
│   │   └── admins/               # Admin user CRUD
│   │       ├── route.ts          # GET list, POST create
│   │       └── [id]/route.ts     # DELETE admin
│   ├── outlets/              # Outlet CRUD
│   ├── sales/                # Sales CRUD + MTD
│   └── expenses/             # Expense CRUD
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
│   ├── authenticated-layout.tsx  # Auth wrapper
│   └── providers.tsx         # QueryClient, Toaster
├── db/
│   ├── db.ts                 # Database connection
│   └── storage.ts            # Data access layer
├── hooks/                    # Custom React hooks
└── lib/
    ├── auth.ts               # Replit Auth (openid-client v6)
    ├── queryClient.ts        # TanStack Query setup
    └── utils.ts              # Utility functions

shared/
└── schema.ts                 # Drizzle schema + Zod types
```

### Data Storage Solutions

**Database Schema**

The application uses four primary tables:

1. **users** - Stores user authentication data
   - Unique identifier (from Replit Auth or auto-generated UUID for admin users)
   - Email, first name, last name
   - Profile image URL
   - Role (super_admin, owner, admin_outlet, finance)
   - Password (hashed, optional - only for admin users created by SUPER_ADMIN)
   - assignedOutletId (for admin_outlet role)
   - Creation timestamp

2. **outlets** - Stores outlet master data
   - Unique identifier (UUID)
   - Outlet name
   - Cost of goods sold (COGS) per piece for margin calculations
   - Creation timestamp

3. **sales** - Daily sales transaction records
   - Links to outlet via foreign key relationship
   - Date field for daily aggregation (YYYY-MM-DD format)
   - Multiple payment channel columns (cash, QRIS, Grab, GoFood, Shopee, TikTok)
   - Inventory tracking (total sold, remaining, returned, total production)
   - Optional sold-out time tracking
   - Automatic timestamp management

4. **expenses** - Daily and monthly expense records
   - Links to outlet via foreign key relationship
   - Date field (YYYY-MM-DD format)
   - Type field distinguishing between daily ("harian") and monthly ("bulanan") expenses
   - Description field for expense details
   - Amount field for expense value (validated >= 0)
   - Automatic timestamp management

**Calculated Fields Strategy**
- Gross margin and percentages computed in application layer rather than database
- Server-side calculations in storage layer return enriched SalesWithCalculations objects
- MTD (Month-to-Date) aggregations performed via date range queries

**Schema Evolution**
- Drizzle Kit for schema migrations
- Version-controlled migration files in `/migrations` directory
- Push-based deployment model for schema changes (`npm run db:push`)

### Data Integrity and Transaction Handling

**Sales + Expenses Transaction Pattern**
- Sales input page implements "best effort" rollback when saving sales with daily expenses
- Uses multi-request pattern: one POST for sale, followed by N POSTs for expenses
- On expense creation failure, performs compensating DELETE operations:
  - Deletes the created sale record
  - Deletes any already-created expense records
  - Each DELETE wrapped in try-catch to ensure all cleanup attempts execute
  - Always invalidates relevant query caches after rollback

**Known Limitations**
- Edge case: Network failure after database commit but before response receipt may leave orphaned records
- Likelihood: Extremely rare in normal operation
- Impact: Limited to individual transactions, no cascading corruption
- Manual recovery: Query expenses by date/outlet to identify and remove orphans if needed
- Future improvement: Implement POST /api/sales-with-expenses endpoint with database-level transaction support

**Outlet Deletion**
- Deletion dialog uses manual control pattern (regular Button with controlled state)
- Dialog remains open on error to allow retry
- Invalidates multiple query keys (outlets, sales, expenses) on successful delete
- User receives clear feedback on success or failure

### Authentication and Authorization

**Dual Authentication System:**
1. **Replit Auth** - OAuth/OIDC for general users
   - Integration via openid-client v6
   - PKCE flow with proper code_verifier/code_challenge
   - State parameter for CSRF protection
   - Iron-session for secure session management

2. **Email/Password Login** - For admin users created by SUPER_ADMIN
   - bcrypt for password hashing
   - Session-based authentication via iron-session
   - Login endpoint: POST /api/auth/admin-login
   - Login page: /admin-login

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

**Third-Party Services**
- **Neon Database** - Serverless PostgreSQL database hosting with WebSocket support for real-time connections
- **Replit Auth** - OpenID Connect authentication provider
- **Google Fonts** - CDN delivery of Inter and JetBrains Mono typefaces

**NPM Packages - Core**
- `next` - Full-stack React framework with App Router
- `@neondatabase/serverless` - Database driver with connection pooling
- `drizzle-orm` - Type-safe ORM with schema definition and query builder
- `drizzle-zod` - Automatic Zod schema generation from Drizzle schemas
- `openid-client` v6 - OAuth/OIDC client for Replit Auth
- `iron-session` - Encrypted session management

**NPM Packages - Frontend**
- `@tanstack/react-query` - Async state management and data fetching
- `react-hook-form` - Form state management with performance optimization
- `@hookform/resolvers` - Zod integration for form validation
- `date-fns` - Date manipulation and formatting with Indonesian locale support
- `recharts` - Charting library for data visualization
- `lucide-react` - Icon library
- `react-icons` - Additional icon sets (Grab, Shopee, TikTok brand icons)

**NPM Packages - UI Components**
- `@radix-ui/*` - Headless UI primitives (22+ component packages)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Type-safe variant-based component styling
- `clsx` & `tailwind-merge` - Conditional class name utilities

**Development Tools**
- `typescript` - Type checking and compilation
- `drizzle-kit` - Database migration tools

**API Integration Pattern**
- Custom `apiRequest` wrapper in `queryClient.ts` centralizes fetch logic
- Query key construction via `buildQueryUrl` supporting filter parameters
- Automatic error handling with response status checking
- Credentials included for session support

**Deployment Configuration**
- Environment variable `DATABASE_URL` required for database connection
- Next.js production build via `next build`
- Run with `npx next dev --port 5000` for development
- Run with `npx next start --port 5000` for production

## Running the Application

**Development:**
```bash
npx next dev --port 5000
```

**Production Build:**
```bash
npx next build
npx next start --port 5000
```

**Database Migration:**
```bash
npm run db:push
```

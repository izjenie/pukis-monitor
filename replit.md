# Pukis Monitoring - Sales Dashboard Application

## Overview

Pukis Monitoring is a business intelligence application for tracking daily sales performance and expenses across multiple outlets. The application enables daily sales data entry, expense management (daily and monthly), performance analytics, and automated reporting for a food retail business. It provides real-time dashboards showing revenue, gross margins, and sales trends with the ability to generate WhatsApp-formatted summaries for quick sharing.

The system is designed with a mobile-first approach to support field operations, featuring touch-friendly inputs, clear data visualization, and efficient workflows for daily sales tracking and expense monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React 18 with TypeScript for type-safe component development
- Wouter for lightweight client-side routing
- Vite as the build tool and development server

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
- Express.js for REST API endpoints
- Node.js runtime with ES modules
- Separate development (Vite middleware integration) and production servers

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

### Data Storage Solutions

**Database Schema**

The application uses three primary tables:

1. **outlets** - Stores outlet master data
   - Unique identifier (UUID)
   - Outlet name
   - Cost of goods sold (COGS) per piece for margin calculations
   - Creation timestamp

2. **sales** - Daily sales transaction records
   - Links to outlet via foreign key relationship
   - Date field for daily aggregation (YYYY-MM-DD format)
   - Multiple payment channel columns (cash, QRIS, Grab, GoFood, Shopee, TikTok)
   - Inventory tracking (total sold, remaining, returned, total production)
   - Optional sold-out time tracking
   - Automatic timestamp management

3. **expenses** - Daily and monthly expense records
   - Links to outlet via foreign key relationship
   - Date field (YYYY-MM-DD format)
   - Type field distinguishing between daily ("harian") and monthly ("bulanan") expenses
   - Description field for expense details
   - Amount field for expense value (validated >= 0)
   - Automatic timestamp management
   - Forms use react-hook-form with Zod validation for data integrity

**Calculated Fields Strategy**
- Gross margin and percentages computed in application layer rather than database
- Server-side calculations in storage layer return enriched SalesWithCalculations objects
- MTD (Month-to-Date) aggregations performed via date range queries

**Schema Evolution**
- Drizzle Kit for schema migrations
- Version-controlled migration files in `/migrations` directory
- Push-based deployment model for schema changes

### Authentication and Authorization

Currently, the application does not implement authentication or authorization mechanisms. This represents a future enhancement area where session-based auth or token-based auth could be added. The codebase includes session middleware setup (connect-pg-simple) suggesting planned session management.

### External Dependencies

**Third-Party Services**
- **Neon Database** - Serverless PostgreSQL database hosting with WebSocket support for real-time connections
- **Google Fonts** - CDN delivery of Inter and JetBrains Mono typefaces

**NPM Packages - Core**
- `@neondatabase/serverless` - Database driver with connection pooling
- `drizzle-orm` - Type-safe ORM with schema definition and query builder
- `drizzle-zod` - Automatic Zod schema generation from Drizzle schemas
- `express` - HTTP server framework
- `connect-pg-simple` - PostgreSQL session store (currently unused)

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
- `vite` - Build tool and dev server
- `@vitejs/plugin-react` - React Fast Refresh support
- `typescript` - Type checking and compilation
- `tsx` - TypeScript execution for development server
- `esbuild` - Server bundle creation for production
- Replit-specific plugins for development experience enhancements

**API Integration Pattern**
- Custom `apiRequest` wrapper in `queryClient.ts` centralizes fetch logic
- Query key construction via `buildQueryUrl` supporting filter parameters
- Automatic error handling with response status checking
- Credentials included for future session support

**Deployment Configuration**
- Environment variable `DATABASE_URL` required for database connection
- Production build combines Vite client build and esbuild server bundle
- Static file serving in production mode from `dist/public`
- Development mode uses Vite middleware for HMR
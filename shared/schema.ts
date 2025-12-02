import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum - Added super_admin for managing other admins
export type UserRole = "super_admin" | "owner" | "admin_outlet" | "finance";

// Users table - Extended from Replit Auth with role-based access
// password field is optional - only used for admin users created by SUPER_ADMIN
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").$type<UserRole>().notNull().default("finance"),
  password: varchar("password"), // Hashed password for admin users (null for Replit Auth users)
  assignedOutletId: varchar("assigned_outlet_id"), // For admin_outlet role
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Schema for creating admin users (by SUPER_ADMIN)
export const insertAdminSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  firstName: z.string().min(1, "Nama harus diisi"),
  lastName: z.string().optional(),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["owner", "admin_outlet", "finance"], {
    errorMap: () => ({ message: "Role tidak valid" }),
  }),
  assignedOutletId: z.string().optional(),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;

// Outlets table
export const outlets = pgTable("outlets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cogsPerPiece: real("cogs_per_piece").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOutletSchema = createInsertSchema(outlets).omit({
  id: true,
  createdAt: true,
});

export type InsertOutlet = z.infer<typeof insertOutletSchema>;
export type Outlet = typeof outlets.$inferSelect;

// Sales records table
export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  outletId: varchar("outlet_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  cash: real("cash").notNull().default(0),
  qris: real("qris").notNull().default(0),
  grab: real("grab").notNull().default(0),
  gofood: real("gofood").notNull().default(0),
  shopee: real("shopee").notNull().default(0),
  tiktok: real("tiktok").notNull().default(0),
  totalSold: integer("total_sold").notNull().default(0),
  remaining: integer("remaining").notNull().default(0),
  returned: integer("returned").notNull().default(0),
  totalProduction: integer("total_production").notNull().default(0),
  soldOutTime: text("sold_out_time"), // HH:mm format
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSalesSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  cash: z.number().min(0, "Cash harus >= 0"),
  qris: z.number().min(0, "QRIS harus >= 0"),
  grab: z.number().min(0, "Grab harus >= 0"),
  gofood: z.number().min(0, "GoFood harus >= 0"),
  shopee: z.number().min(0, "Shopee harus >= 0"),
  tiktok: z.number().min(0, "TikTok harus >= 0"),
  totalSold: z.number().int().min(0, "Total terjual harus >= 0"),
  remaining: z.number().int().min(0, "Sisa harus >= 0"),
  returned: z.number().int().min(0, "Return harus >= 0"),
  totalProduction: z.number().int().min(0, "Total produksi harus >= 0"),
});

export const updateSalesSchema = insertSalesSchema.partial();

export type InsertSales = z.infer<typeof insertSalesSchema>;
export type Sales = typeof sales.$inferSelect;

// Calculated types for dashboard
export type SalesWithCalculations = Sales & {
  totalRevenue: number;
  cogsSold: number;
  grossMargin: number;
  grossMarginPercentage: number;
  outletName?: string;
  cogsPerPiece?: number;
};

export type DailySummary = {
  date: string;
  outletId: string;
  outletName: string;
  totalRevenue: number;
  totalSold: number;
  cogsSold: number;
  grossMargin: number;
  grossMarginPercentage: number;
  soldOutTime?: string;
};

export type MTDSummary = {
  outletId: string;
  outletName: string;
  totalRevenue: number;
  totalSold: number;
  totalGrossMargin: number;
  avgGrossMarginPercentage: number;
  dailySales: Array<{
    date: string;
    revenue: number;
    grossMargin: number;
    unitsSold: number;
  }>;
};

export type OutletRanking = {
  outletId: string;
  outletName: string;
  totalRevenue: number;
  totalGrossMargin: number;
  totalSold: number;
  rank: number;
};

// Expenses type enum
export type ExpenseType = "harian" | "bulanan";

// Expenses table
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  outletId: varchar("outlet_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  type: varchar("type").$type<ExpenseType>().notNull(), // "harian" atau "bulanan"
  description: text("description").notNull(),
  amount: real("amount").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.number().min(0, "Jumlah harus >= 0"),
  type: z.enum(["harian", "bulanan"], {
    errorMap: () => ({ message: "Jenis harus 'harian' atau 'bulanan'" }),
  }),
  description: z.string().min(1, "Deskripsi harus diisi"),
});

export const updateExpenseSchema = z.object({
  outletId: z.string().optional(),
  date: z.string().optional(),
  type: z.enum(["harian", "bulanan"], {
    errorMap: () => ({ message: "Jenis harus 'harian' atau 'bulanan'" }),
  }).optional(),
  description: z.string().min(1, "Deskripsi harus diisi").optional(),
  amount: z.number().min(0, "Jumlah harus >= 0").optional(),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Expense with outlet name for display
export type ExpenseWithOutlet = Expense & {
  outletName?: string;
};

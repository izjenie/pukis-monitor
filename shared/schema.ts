import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

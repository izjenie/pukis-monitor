import {
  type Outlet,
  type InsertOutlet,
  type Sales,
  type InsertSales,
  type SalesWithCalculations,
  type MTDSummary,
  type User,
  type UpsertUser,
  outlets,
  sales,
  users,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  getOutlets(): Promise<Outlet[]>;
  getOutlet(id: string): Promise<Outlet | undefined>;
  createOutlet(outlet: InsertOutlet): Promise<Outlet>;
  updateOutlet(id: string, outlet: InsertOutlet): Promise<Outlet | undefined>;
  deleteOutlet(id: string): Promise<boolean>;

  getSales(filters?: { date?: string; outletId?: string }): Promise<Sales[]>;
  getSalesById(id: string): Promise<Sales | undefined>;
  createSales(sales: InsertSales): Promise<Sales>;
  updateSales(id: string, sales: Partial<InsertSales>): Promise<Sales | undefined>;
  deleteSales(id: string): Promise<boolean>;

  getSalesWithCalculations(filters?: {
    date?: string;
    outletId?: string;
  }): Promise<SalesWithCalculations[]>;

  getMTDSales(date: string, outletId?: string): Promise<SalesWithCalculations[]>;
  getMTDSummary(date: string): Promise<MTDSummary[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getOutlets(): Promise<Outlet[]> {
    return await db.select().from(outlets);
  }

  async getOutlet(id: string): Promise<Outlet | undefined> {
    const [outlet] = await db.select().from(outlets).where(eq(outlets.id, id));
    return outlet || undefined;
  }

  async createOutlet(insertOutlet: InsertOutlet): Promise<Outlet> {
    const [outlet] = await db
      .insert(outlets)
      .values(insertOutlet)
      .returning();
    return outlet;
  }

  async updateOutlet(
    id: string,
    insertOutlet: InsertOutlet
  ): Promise<Outlet | undefined> {
    const [outlet] = await db
      .update(outlets)
      .set(insertOutlet)
      .where(eq(outlets.id, id))
      .returning();
    return outlet || undefined;
  }

  async deleteOutlet(id: string): Promise<boolean> {
    const result = await db.delete(outlets).where(eq(outlets.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSales(filters?: {
    date?: string;
    outletId?: string;
  }): Promise<Sales[]> {
    let query = db.select().from(sales);

    const conditions = [];
    if (filters?.date) {
      conditions.push(eq(sales.date, filters.date));
    }
    if (filters?.outletId) {
      conditions.push(eq(sales.outletId, filters.outletId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;
    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getSalesById(id: string): Promise<Sales | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale || undefined;
  }

  async createSales(insertSales: InsertSales): Promise<Sales> {
    const [sale] = await db
      .insert(sales)
      .values(insertSales)
      .returning();
    return sale;
  }

  async updateSales(
    id: string,
    updateData: Partial<InsertSales>
  ): Promise<Sales | undefined> {
    const [sale] = await db
      .update(sales)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(sales.id, id))
      .returning();
    return sale || undefined;
  }

  async deleteSales(id: string): Promise<boolean> {
    const result = await db.delete(sales).where(eq(sales.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  private calculateSalesMetrics(
    sale: Sales,
    outlet?: Outlet
  ): SalesWithCalculations {
    const totalRevenue =
      sale.cash +
      sale.qris +
      sale.grab +
      sale.gofood +
      sale.shopee +
      sale.tiktok;

    const cogsPerPiece = outlet?.cogsPerPiece || 0;
    const cogsSold = sale.totalSold * cogsPerPiece;
    const grossMargin = totalRevenue - cogsSold;
    const grossMarginPercentage =
      totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

    return {
      ...sale,
      totalRevenue,
      cogsSold,
      grossMargin,
      grossMarginPercentage,
      outletName: outlet?.name,
      cogsPerPiece,
    };
  }

  async getSalesWithCalculations(filters?: {
    date?: string;
    outletId?: string;
  }): Promise<SalesWithCalculations[]> {
    const salesData = await this.getSales(filters);
    const outletsData = await this.getOutlets();
    const outletMap = new Map(outletsData.map((o) => [o.id, o]));

    return salesData.map((sale) =>
      this.calculateSalesMetrics(sale, outletMap.get(sale.outletId))
    );
  }

  private getMTDPeriod(date: Date): { start: Date; end: Date } {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    if (day >= 10) {
      const start = new Date(year, month, 10);
      const end = new Date(year, month + 1, 9);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    } else {
      const start = new Date(year, month - 1, 10);
      const end = new Date(year, month, 9);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  }

  async getMTDSales(
    date: string,
    outletId?: string
  ): Promise<SalesWithCalculations[]> {
    const currentDate = new Date(date);
    const { start, end } = this.getMTDPeriod(currentDate);

    const startDateStr = start.toISOString().split("T")[0];
    const endDateStr = end.toISOString().split("T")[0];

    const conditions = [
      gte(sales.date, startDateStr),
      lte(sales.date, endDateStr),
    ];

    if (outletId) {
      conditions.push(eq(sales.outletId, outletId));
    }

    const mtdSales = await db
      .select()
      .from(sales)
      .where(and(...conditions));

    const outletsData = await this.getOutlets();
    const outletMap = new Map(outletsData.map((o) => [o.id, o]));

    return mtdSales
      .map((sale) => this.calculateSalesMetrics(sale, outletMap.get(sale.outletId)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getMTDSummary(date: string): Promise<MTDSummary[]> {
    const currentDate = new Date(date);
    const { start, end } = this.getMTDPeriod(currentDate);

    const startDateStr = start.toISOString().split("T")[0];
    const endDateStr = end.toISOString().split("T")[0];

    const outletsData = await this.getOutlets();
    const mtdSales = await db
      .select()
      .from(sales)
      .where(and(gte(sales.date, startDateStr), lte(sales.date, endDateStr)));

    const outletMap = new Map(outletsData.map((o) => [o.id, o]));

    const summaryMap = new Map<string, MTDSummary>();

    for (const outlet of outletsData) {
      const outletSales = mtdSales.filter((s) => s.outletId === outlet.id);

      const dailySales = outletSales.map((sale) => {
        const metrics = this.calculateSalesMetrics(sale, outlet);
        return {
          date: sale.date,
          revenue: metrics.totalRevenue,
          grossMargin: metrics.grossMargin,
          unitsSold: sale.totalSold,
        };
      });

      const totalRevenue = dailySales.reduce((sum, d) => sum + d.revenue, 0);
      const totalGrossMargin = dailySales.reduce(
        (sum, d) => sum + d.grossMargin,
        0
      );
      const totalSold = dailySales.reduce((sum, d) => sum + d.unitsSold, 0);
      const avgGrossMarginPercentage =
        totalRevenue > 0 ? (totalGrossMargin / totalRevenue) * 100 : 0;

      summaryMap.set(outlet.id, {
        outletId: outlet.id,
        outletName: outlet.name,
        totalRevenue,
        totalSold,
        totalGrossMargin,
        avgGrossMarginPercentage,
        dailySales,
      });
    }

    return Array.from(summaryMap.values()).sort(
      (a, b) => b.totalGrossMargin - a.totalGrossMargin
    );
  }
}

export const storage = new DatabaseStorage();

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOutletSchema, insertSalesSchema, updateSalesSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/outlets", async (req, res) => {
    try {
      const outlets = await storage.getOutlets();
      res.json(outlets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/outlets/:id", async (req, res) => {
    try {
      const outlet = await storage.getOutlet(req.params.id);
      if (!outlet) {
        return res.status(404).json({ message: "Outlet tidak ditemukan" });
      }
      res.json(outlet);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/outlets", async (req, res) => {
    try {
      const validatedData = insertOutletSchema.parse(req.body);
      const outlet = await storage.createOutlet(validatedData);
      res.status(201).json(outlet);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/outlets/:id", async (req, res) => {
    try {
      const validatedData = insertOutletSchema.parse(req.body);
      const outlet = await storage.updateOutlet(req.params.id, validatedData);
      if (!outlet) {
        return res.status(404).json({ message: "Outlet tidak ditemukan" });
      }
      res.json(outlet);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/outlets/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteOutlet(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Outlet tidak ditemukan" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sales", async (req, res) => {
    try {
      const { date, outletId } = req.query;
      const sales = await storage.getSalesWithCalculations({
        date: date as string | undefined,
        outletId: outletId as string | undefined,
      });
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sales/mtd", async (req, res) => {
    try {
      const { date, outletId } = req.query;
      if (!date) {
        return res.status(400).json({ message: "Parameter date diperlukan" });
      }
      const sales = await storage.getMTDSales(
        date as string,
        outletId as string | undefined
      );
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sales/mtd-summary", async (req, res) => {
    try {
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ message: "Parameter date diperlukan" });
      }
      const summary = await storage.getMTDSummary(date as string);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const sale = await storage.getSalesById(req.params.id);
      if (!sale) {
        return res.status(404).json({ message: "Data penjualan tidak ditemukan" });
      }
      res.json(sale);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const validatedData = insertSalesSchema.parse(req.body);

      if (validatedData.totalProduction < validatedData.totalSold) {
        return res.status(400).json({
          message: "Total produksi harus >= total terjual",
        });
      }

      const outlet = await storage.getOutlet(validatedData.outletId);
      if (!outlet) {
        return res.status(404).json({ message: "Outlet tidak ditemukan" });
      }

      const existingSales = await storage.getSales({
        date: validatedData.date,
        outletId: validatedData.outletId,
      });

      if (existingSales.length > 0) {
        return res.status(400).json({
          message: "Data penjualan untuk tanggal dan outlet ini sudah ada. Silakan edit data yang sudah ada.",
        });
      }

      const sale = await storage.createSales(validatedData);
      res.status(201).json(sale);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/sales/:id", async (req, res) => {
    try {
      const validatedData = updateSalesSchema.parse(req.body);
      const sale = await storage.updateSales(req.params.id, validatedData);
      if (!sale) {
        return res.status(404).json({ message: "Data penjualan tidak ditemukan" });
      }
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSales(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Data penjualan tidak ditemukan" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

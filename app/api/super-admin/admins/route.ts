import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { storage } from "@/db/storage";
import { insertAdminSchema } from "@shared/schema";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya SUPER_ADMIN yang dapat mengakses halaman ini." },
        { status: 403 }
      );
    }

    const admins = await storage.getAdminUsers();
    
    const sanitizedAdmins = admins.map(admin => ({
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      assignedOutletId: admin.assignedOutletId,
      createdAt: admin.createdAt,
    }));

    return NextResponse.json(sanitizedAdmins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data admin" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya SUPER_ADMIN yang dapat membuat admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const result = insertAdminSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0];
      return NextResponse.json(
        { error: firstError || "Data tidak valid" },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, password, role, assignedOutletId } = result.data;

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = await storage.createAdminUser({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role,
      assignedOutletId,
    });

    return NextResponse.json({
      id: newAdmin.id,
      email: newAdmin.email,
      firstName: newAdmin.firstName,
      lastName: newAdmin.lastName,
      role: newAdmin.role,
      assignedOutletId: newAdmin.assignedOutletId,
      createdAt: newAdmin.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Gagal membuat admin" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { getSession } from "@/lib/auth";
import { storage } from "@/db/storage";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0];
      return NextResponse.json(
        { error: firstError || "Data tidak valid" },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Akun ini tidak dapat login dengan password. Silakan gunakan Replit Auth." },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    if (user.role === "super_admin") {
      return NextResponse.json(
        { error: "SUPER_ADMIN harus login melalui Replit Auth" },
        { status: 401 }
      );
    }

    const session = await getSession();
    
    delete session.codeVerifier;
    delete session.state;
    delete session.accessToken;
    delete session.refreshToken;
    
    session.user = {
      id: user.id,
      email: user.email || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      profileImageUrl: user.profileImageUrl || undefined,
      role: user.role,
    };
    session.expiresAt = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Gagal melakukan login" },
      { status: 500 }
    );
  }
}

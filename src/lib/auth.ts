import * as client from "openid-client";
import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import memoize from "memoizee";
import { storage } from "@/db/storage";

export interface SessionData {
  user?: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    role?: string;
  };
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  codeVerifier?: string;
  state?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "pukis_session",
  cookieOptions: {
    secure: true,
    httpOnly: true,
    sameSite: "none" as const,
    maxAge: 7 * 24 * 60 * 60,
  },
};

export const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session.user || !session.expiresAt) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  
  if (now <= session.expiresAt) {
    const user = await storage.getUser(session.user.id);
    return user;
  }

  if (!session.refreshToken) {
    return null;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, session.refreshToken);
    const claims = tokenResponse.claims();
    
    session.accessToken = tokenResponse.access_token;
    session.refreshToken = tokenResponse.refresh_token;
    session.expiresAt = claims?.exp;
    await session.save();
    
    const user = await storage.getUser(session.user.id);
    return user;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return null;
  }
}

export async function upsertUserFromClaims(claims: any) {
  const existingUserById = await storage.getUser(claims.sub);
  
  if (!existingUserById && claims.email) {
    const existingUserByEmail = await storage.getUserByEmail(claims.email);
    if (existingUserByEmail) {
      if (existingUserByEmail.password) {
        throw new Error("Email ini sudah terdaftar sebagai akun admin. Silakan login melalui halaman Admin Login.");
      }
      return await storage.upsertUser({
        id: existingUserByEmail.id,
        email: claims.email,
        firstName: claims.first_name,
        lastName: claims.last_name,
        profileImageUrl: claims.profile_image_url,
        role: existingUserByEmail.role,
      });
    }
  }
  
  return await storage.upsertUser({
    id: claims.sub,
    email: claims.email,
    firstName: claims.first_name,
    lastName: claims.last_name,
    profileImageUrl: claims.profile_image_url,
    role: existingUserById?.role || "finance",
  });
}

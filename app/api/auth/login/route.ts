import { NextRequest, NextResponse } from "next/server";
import * as client from "openid-client";
import { getOidcConfig, getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const config = await getOidcConfig();
    const session = await getSession();
    
    // Get the correct callback URL - use x-forwarded headers for Replit proxy
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const hostname = forwardedHost || request.headers.get("host") || request.nextUrl.hostname;
    // Always use https on Replit (check if it's a replit.dev domain or forwarded as https)
    const isReplit = hostname.includes("replit.dev") || hostname.includes("replit.app");
    const protocol = forwardedProto || (isReplit ? "https" : (process.env.NODE_ENV === "production" ? "https" : "http"));
    const callbackUrl = `${protocol}://${hostname}/api/auth/callback`;
    
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();
    
    session.codeVerifier = codeVerifier;
    session.state = state;
    await session.save();
    
    const authUrl = client.buildAuthorizationUrl(config, {
      redirect_uri: callbackUrl,
      scope: "openid email profile offline_access",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state: state,
      prompt: "login consent",
    });
    
    return NextResponse.redirect(authUrl.href);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}

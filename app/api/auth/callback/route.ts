import { NextRequest, NextResponse } from "next/server";
import * as client from "openid-client";
import { getOidcConfig, getSession, upsertUserFromClaims } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Get Replit domain at the top level so it's accessible in catch block
  const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0];
  
  try {
    const config = await getOidcConfig();
    const session = await getSession();
    
    const codeVerifier = session.codeVerifier;
    const expectedState = session.state;
    
    if (!codeVerifier) {
      console.log("No code verifier found in session");
      const loginUrl = replitDomain 
        ? `https://${replitDomain}/api/auth/login`
        : new URL("/api/auth/login", request.url).href;
      return NextResponse.redirect(loginUrl);
    }
    
    const error = request.nextUrl.searchParams.get("error");
    if (error) {
      console.error("OAuth2 error:", error);
      const loginUrl = replitDomain 
        ? `https://${replitDomain}/api/auth/login`
        : new URL("/api/auth/login", request.url).href;
      return NextResponse.redirect(loginUrl);
    }
    
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    if (!code) {
      console.error("No code in callback");
      const loginUrl = replitDomain 
        ? `https://${replitDomain}/api/auth/login`
        : new URL("/api/auth/login", request.url).href;
      return NextResponse.redirect(loginUrl);
    }
    
    // Build the correct callback URL using REPLIT_DOMAINS
    const callbackUrl = replitDomain 
      ? `https://${replitDomain}/api/auth/callback?code=${code}&state=${state}&iss=${encodeURIComponent(request.nextUrl.searchParams.get("iss") || "")}`
      : request.url;
    
    console.log("Token exchange URL:", callbackUrl);
    
    const tokenResponse = await client.authorizationCodeGrant(
      config,
      new URL(callbackUrl),
      {
        pkceCodeVerifier: codeVerifier,
        expectedState: expectedState,
        idTokenExpected: true,
      }
    );
    
    const claims = tokenResponse.claims();
    if (!claims) {
      const loginUrl = replitDomain 
        ? `https://${replitDomain}/api/auth/login`
        : new URL("/api/auth/login", request.url).href;
      return NextResponse.redirect(loginUrl);
    }
    
    const user = await upsertUserFromClaims(claims);
    
    session.user = {
      id: user.id,
      email: user.email || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      profileImageUrl: user.profileImageUrl || undefined,
      role: user.role,
    };
    session.accessToken = tokenResponse.access_token;
    session.refreshToken = tokenResponse.refresh_token;
    session.expiresAt = claims.exp;
    delete session.codeVerifier;
    delete session.state;
    await session.save();
    
    // Redirect to the correct Replit domain
    const homeUrl = replitDomain 
      ? `https://${replitDomain}/`
      : new URL("/", request.url).href;
    
    return NextResponse.redirect(homeUrl);
  } catch (error) {
    console.error("Callback error:", error);
    // Redirect to login on the correct domain
    const loginUrl = replitDomain 
      ? `https://${replitDomain}/api/auth/login`
      : new URL("/api/auth/login", request.url).href;
    return NextResponse.redirect(loginUrl);
  }
}

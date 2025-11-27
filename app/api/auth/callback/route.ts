import { NextRequest, NextResponse } from "next/server";
import * as client from "openid-client";
import { getOidcConfig, getSession, upsertUserFromClaims } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const config = await getOidcConfig();
    const session = await getSession();
    
    const codeVerifier = session.codeVerifier;
    const expectedState = session.state;
    
    if (!codeVerifier) {
      return NextResponse.redirect(new URL("/api/auth/login", request.url));
    }
    
    const error = request.nextUrl.searchParams.get("error");
    if (error) {
      console.error("OAuth2 error:", error);
      return NextResponse.redirect(new URL("/api/auth/login", request.url));
    }
    
    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
      console.error("No code in callback");
      return NextResponse.redirect(new URL("/api/auth/login", request.url));
    }
    
    const tokenResponse = await client.authorizationCodeGrant(
      config,
      new URL(request.url),
      {
        pkceCodeVerifier: codeVerifier,
        expectedState: expectedState,
        idTokenExpected: true,
      }
    );
    
    const claims = tokenResponse.claims();
    if (!claims) {
      return NextResponse.redirect(new URL("/api/auth/login", request.url));
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
    
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(new URL("/api/auth/login", request.url));
  }
}

import { NextRequest, NextResponse } from "next/server";
import * as client from "openid-client";
import { getOidcConfig, getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const config = await getOidcConfig();
    const session = await getSession();
    
    // Use REPLIT_DOMAINS environment variable for the correct callback URL
    const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0];
    const callbackUrl = replitDomain 
      ? `https://${replitDomain}/api/auth/callback`
      : `${request.nextUrl.origin}/api/auth/callback`;
    
    console.log("Callback URL:", callbackUrl);
    
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

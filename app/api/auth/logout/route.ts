import { NextRequest, NextResponse } from "next/server";
import * as client from "openid-client";
import { getOidcConfig, getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const config = await getOidcConfig();
    const session = await getSession();
    
    session.destroy();
    
    const hostname = request.headers.get("host") || request.nextUrl.hostname;
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const postLogoutRedirectUri = `${protocol}://${hostname}`;
    
    const endSessionUrl = client.buildEndSessionUrl(config, {
      client_id: process.env.REPL_ID!,
      post_logout_redirect_uri: postLogoutRedirectUri,
    });
    
    return NextResponse.redirect(endSessionUrl.href);
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse, type NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default function middleware(req: NextRequest) {
  // Handle CORS preflight for mobile API routes
  if (req.nextUrl.pathname.startsWith("/api/mobile/")) {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }
    const res = NextResponse.next();
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  // All other routes: run NextAuth protection
  return (auth as any)(req);
}

export const config = {
  // Protect all routes except static assets, API routes handled separately,
  // and Next.js internals.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/api/auth",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const subdomain = extractSubdomain(hostname);

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const tenantId = subdomain === "default" ? "default" : subdomain;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-id", tenantId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  return response;
}

function extractSubdomain(hostname: string): string {
  const parts = hostname.replace(/:\d+$/, "").split(".");
  if (
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    parts.length < 3
  ) {
    return "default";
  }
  return parts[0];
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

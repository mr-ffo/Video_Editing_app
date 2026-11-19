import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionTokenWeb,
} from "./src/lib/webAuth";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (e.g. .svg, .png, .mp4)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ico)$).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow authentication endpoints and public assets
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout")
  ) {
    return NextResponse.next();
  }

  // 2. Read and verify session token using Edge-safe Web Crypto
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const secret =
    process.env.STUDIO_SESSION_SECRET ||
    "syntax-ops-default-session-secret-salt-2026-production";
  const expectedEmail = (
    process.env.STUDIO_LOGIN_EMAIL || "mail-favour@gmail.com"
  )
    .trim()
    .toLowerCase();

  const session = token ? await verifySessionTokenWeb(token, secret) : null;
  const isAuthenticated = Boolean(session && session.email === expectedEmail);

  // 3. Handle /login page routing
  if (pathname === "/login") {
    if (isAuthenticated) {
      // Already authenticated; redirect to studio dashboard
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 4. Protect API routes: Return 401 Unauthorized for unauthenticated requests
  if (pathname.startsWith("/api/")) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized: Active studio session required." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 5. Protect all application pages: Redirect unauthenticated requests to /login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default middleware;

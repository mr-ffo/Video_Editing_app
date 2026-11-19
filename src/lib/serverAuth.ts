import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  getAuthConfig,
  verifySessionToken,
  type SessionPayload,
} from "./auth";

/**
 * Extracts and verifies the session token from a standard Web Request or Next.js Request.
 */
export const validateRequestSession = (
  request: Request
): { authenticated: boolean; user?: { email: string }; error?: string } => {
  const cookieHeader = request.headers.get("cookie") || "";
  const authConfig = getAuthConfig();

  if (!authConfig.sessionSecret) {
    return {
      authenticated: false,
      error: "Authentication service misconfigured: STUDIO_SESSION_SECRET is missing.",
    };
  }

  // Parse cookies
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .filter(([k]) => Boolean(k))
      .map(([k, ...v]) => [decodeURIComponent(k), decodeURIComponent(v.join("="))])
  );

  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return { authenticated: false, error: "No session cookie present." };
  }

  const payload: SessionPayload | null = verifySessionToken(token, authConfig.sessionSecret);
  if (!payload) {
    return { authenticated: false, error: "Session invalid or expired." };
  }

  // Ensure session belongs to the designated single-user email
  if (payload.email !== authConfig.email) {
    return { authenticated: false, error: "Session email mismatch." };
  }

  return {
    authenticated: true,
    user: { email: payload.email },
  };
};

/**
 * Convenience helper for API route handlers to immediately enforce authentication.
 * Returns null if authenticated, or a 401 NextResponse if unauthenticated.
 */
export const requireApiAuth = (request: Request): NextResponse | null => {
  const { authenticated, error } = validateRequestSession(request);

  if (!authenticated) {
    return NextResponse.json(
      { error: error || "Unauthorized: Valid session required." },
      { status: 401 }
    );
  }

  return null;
};

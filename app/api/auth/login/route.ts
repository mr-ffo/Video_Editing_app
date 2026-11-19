import { NextResponse } from "next/server";
import {
  getAuthConfig,
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginRateLimit,
} from "../../../../src/lib/auth";

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    // 1. Enforce rate limiting
    const rateLimit = checkLoginRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please wait ${rateLimit.retryAfterSec || 900} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    // 2. Parse and validate request body
    let body: { email?: unknown; password?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const authConfig = getAuthConfig();

    if (!authConfig.password) {
      return NextResponse.json(
        {
          error:
            "Studio authentication is not configured: STUDIO_LOGIN_PASSWORD or STUDIO_LOGIN_PASSWORD_HASH missing.",
        },
        { status: 500 }
      );
    }

    const normalizedInputEmail = email.trim().toLowerCase();
    const isEmailValid = normalizedInputEmail === authConfig.email;
    const isPasswordValid = isEmailValid
      ? await verifyPassword(password, authConfig.password)
      : false;

    if (!isEmailValid || !isPasswordValid) {
      recordLoginFailure(clientIp);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 3. Login succeeded — clear rate limiter
    resetLoginRateLimit(clientIp);

    // 4. Create signed session token
    const token = createSessionToken(
      normalizedInputEmail,
      authConfig.sessionSecret
    );

    const response = NextResponse.json({
      success: true,
      user: { email: normalizedInputEmail },
    });

    // 5. Set HttpOnly, secure, SameSite=lax session cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { error: `Authentication failed: ${message}` },
      { status: 500 }
    );
  }
}

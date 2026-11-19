import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../../src/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out." });

  // Invalidate session cookie by setting maxAge to 0
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

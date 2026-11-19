import { NextResponse } from "next/server";
import { validateRequestSession } from "../../../../src/lib/serverAuth";

export async function GET(request: Request) {
  const result = validateRequestSession(request);

  if (!result.authenticated) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: result.user,
  });
}

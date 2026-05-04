import { NextResponse, type NextRequest } from "next/server";
import {
  adminCookieName,
  getAdminPasswordHash,
  hashAdminPassword,
  isExpectedHash,
  isSecureRequest,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const expected = getAdminPasswordHash();

  if (!expected) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_PASSWORD_HASH is not configured." },
      { status: 500 },
    );
  }

  const candidate = hashAdminPassword(password);

  if (!isExpectedHash(candidate, expected)) {
    return NextResponse.json(
      { ok: false, message: "Invalid password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, expected, {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(request),
  });

  return response;
}

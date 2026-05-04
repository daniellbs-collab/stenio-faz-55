import { NextResponse, type NextRequest } from "next/server";
import { adminCookieName, isSecureRequest } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(request),
  });

  return response;
}

import { createHash, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const adminCookieName = "admin-auth";

export function hashAdminPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function getAdminPasswordHash() {
  return process.env.ADMIN_PASSWORD_HASH;
}

export function isExpectedHash(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

export function isAdminRequest(request: NextRequest) {
  const expected = getAdminPasswordHash();
  const auth = request.cookies.get(adminCookieName)?.value;

  return Boolean(expected && auth && isExpectedHash(auth, expected));
}

export function isSecureRequest(request: NextRequest) {
  return (
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https"
  );
}

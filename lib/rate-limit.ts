import { createHash } from "crypto";
import type { NextRequest } from "next/server";

const submitWindowMs = 60 * 60 * 1000;
const maxSubmitsPerWindow = 3;
const buckets = new Map<string, number[]>();

export function getIpHash(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return createHash("sha256")
    .update(`${ip}${process.env.IP_SALT ?? ""}`)
    .digest("hex");
}

export function isRateLimited(scope: string, ipHash: string) {
  const key = `${scope}:${ipHash}`;
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter(
    (timestamp) => now - timestamp < submitWindowMs,
  );

  if (recent.length >= maxSubmitsPerWindow) {
    buckets.set(key, recent);
    return true;
  }

  buckets.set(key, [...recent, now]);
  return false;
}

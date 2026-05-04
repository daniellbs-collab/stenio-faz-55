import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIpHash, isRateLimited } from "@/lib/rate-limit";
import { rsvpSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = rsvpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const ipHash = getIpHash(request);

  if (isRateLimited("rsvp", ipHash)) {
    return NextResponse.json(
      { ok: false, message: "Rate limit exceeded." },
      { status: 429 },
    );
  }

  await prisma.rsvp.create({
    data: {
      ...parsed.data,
      ipHash,
    },
  });

  const confirmed = await prisma.rsvp.findMany({
    select: { guests: true },
    where: { attending: true },
  });
  const totalConfirmed = confirmed.reduce((total, rsvp) => total + 1 + rsvp.guests, 0);

  return NextResponse.json({ ok: true, totalConfirmed });
}

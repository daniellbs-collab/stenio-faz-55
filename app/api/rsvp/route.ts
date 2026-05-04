import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIpHash, isRateLimited } from "@/lib/rate-limit";
import { sendRsvpReportEmail } from "@/lib/rsvp-report-email";
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

  const savedRsvp = await prisma.rsvp.create({
    data: {
      ...parsed.data,
      ipHash,
    },
    select: {
      attending: true,
      createdAt: true,
      guests: true,
      message: true,
      name: true,
    },
  });

  const allRsvps = await prisma.rsvp.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      attending: true,
      createdAt: true,
      guests: true,
      message: true,
      name: true,
    },
  });
  const confirmedRsvps = allRsvps.filter((rsvp) => rsvp.attending);
  const declinedRsvps = allRsvps.filter((rsvp) => !rsvp.attending);
  const totalGuests = confirmedRsvps.reduce((total, rsvp) => total + rsvp.guests, 0);
  const totalConfirmed = confirmedRsvps.reduce(
    (total, rsvp) => total + 1 + rsvp.guests,
    0,
  );

  sendRsvpReportEmail({
    latestRsvps: allRsvps.slice(0, 10),
    metrics: {
      confirmedPeople: totalConfirmed,
      confirmedRsvps: confirmedRsvps.length,
      declinedRsvps: declinedRsvps.length,
      totalGuests,
      totalRsvps: allRsvps.length,
    },
    rsvp: savedRsvp,
  }).catch((error) => {
    console.error("[rsvp-report-email] Failed to send RSVP report.", error);
  });

  return NextResponse.json({ ok: true, totalConfirmed });
}

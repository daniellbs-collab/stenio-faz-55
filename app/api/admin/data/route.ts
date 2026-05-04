import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const [rsvps, messages] = await Promise.all([
    prisma.rsvp.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        attending: true,
        createdAt: true,
        guests: true,
        id: true,
        message: true,
        name: true,
      },
    }),
    prisma.guestbookMessage.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        id: true,
        message: true,
        name: true,
      },
    }),
  ]);

  return NextResponse.json({
    messages: messages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })),
    rsvps: rsvps.map((rsvp) => ({
      ...rsvp,
      createdAt: rsvp.createdAt.toISOString(),
    })),
  });
}

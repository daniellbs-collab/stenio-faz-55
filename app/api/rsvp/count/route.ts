import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

export async function GET() {
  const [confirmedRows, declined] = await Promise.all([
    prisma.rsvp.findMany({
      select: { guests: true },
      where: { attending: true },
    }),
    prisma.rsvp.count({
      where: { attending: false },
    }),
  ]);

  const confirmed = confirmedRows.reduce(
    (total, rsvp) => total + 1 + rsvp.guests,
    0,
  );

  return NextResponse.json({ confirmed, declined });
}

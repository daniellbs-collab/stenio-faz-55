import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIpHash, isRateLimited } from "@/lib/rate-limit";
import { guestbookSchema } from "@/lib/validators";

export async function GET() {
  const messages = await prisma.guestbookMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    messages: messages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = guestbookSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const ipHash = getIpHash(request);

  if (isRateLimited("guestbook", ipHash)) {
    return NextResponse.json(
      { ok: false, message: "Rate limit exceeded." },
      { status: 429 },
    );
  }

  const message = await prisma.guestbookMessage.create({
    data: parsed.data,
  });

  return NextResponse.json({
    ok: true,
    message: {
      ...message,
      createdAt: message.createdAt.toISOString(),
    },
  });
}

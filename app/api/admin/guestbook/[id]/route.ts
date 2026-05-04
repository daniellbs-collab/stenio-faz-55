import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.guestbookMessage.delete({
      where: { id },
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Message not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function csvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const rsvps = await prisma.rsvp.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["Nome", "Comparece", "Acompanhantes", "Recado", "Data"],
    ...rsvps.map((rsvp) => [
      rsvp.name,
      rsvp.attending ? "Sim" : "Não",
      rsvp.guests,
      rsvp.message ?? "",
      formatDate(rsvp.createdAt),
    ]),
  ];

  const csv = `\uFEFF${rows
    .map((row) => row.map((cell) => csvCell(cell)).join(";"))
    .join("\r\n")}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": 'attachment; filename="stenio-55-rsvps.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}

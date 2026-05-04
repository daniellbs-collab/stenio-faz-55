const dtStart = "20260507T220000Z";
const dtEnd = "20260508T040000Z";
const calendarLocation =
  "Boteco Caju Limão, SIG Quadra 8 - Cruzeiro / Sudoeste / Octogonal, Brasília - DF, 70610-480, Brasil";

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatUtcDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function GET() {
  const event = {
    description:
      "Boteco Caju Limão - Sudoeste. Mesa garantida, geladeira lotada. Só falta você.",
    dtStamp: formatUtcDate(new Date()),
    geo: "-15.7975;-47.9215",
    location: calendarLocation,
    summary: "Stênio faz 55",
    uid: `${crypto.randomUUID()}@steniofaz55.eteolabs.com.br`,
  };

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Stenio Faz 55//Convite//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${event.dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `GEO:${event.geo}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new Response(calendar, {
    headers: {
      "Content-Disposition": 'attachment; filename="stenio-55.ics"',
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
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

  return (
    <AdminDashboard
      initialMessages={messages.map((message) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
      }))}
      initialRsvps={rsvps.map((rsvp) => ({
        ...rsvp,
        createdAt: rsvp.createdAt.toISOString(),
      }))}
    />
  );
}

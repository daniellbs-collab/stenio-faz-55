"use client";

import { useMemo, useState } from "react";
import {
  Download,
  LogOut,
  MessageCircle,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminRsvp = {
  id: string;
  name: string;
  attending: boolean;
  guests: number;
  message: string | null;
  createdAt: string;
};

export type AdminGuestbookMessage = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

type AdminDashboardProps = {
  initialMessages: AdminGuestbookMessage[];
  initialRsvps: AdminRsvp[];
};

type Tab = "rsvps" | "mural";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function AdminDashboard({
  initialMessages,
  initialRsvps,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("rsvps");
  const [rsvpQuery, setRsvpQuery] = useState("");
  const [messageQuery, setMessageQuery] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const confirmed = initialRsvps
      .filter((rsvp) => rsvp.attending)
      .reduce((total, rsvp) => total + 1 + rsvp.guests, 0);
    const declined = initialRsvps.filter((rsvp) => !rsvp.attending).length;

    return {
      confirmed,
      declined,
      messages: messages.length,
      totalRsvps: initialRsvps.length,
    };
  }, [initialRsvps, messages.length]);

  const filteredRsvps = useMemo(() => {
    const query = normalize(rsvpQuery);
    return initialRsvps.filter((rsvp) => normalize(rsvp.name).includes(query));
  }, [initialRsvps, rsvpQuery]);

  const filteredMessages = useMemo(() => {
    const query = normalize(messageQuery);
    return messages.filter((message) => {
      return (
        normalize(message.name).includes(query) ||
        normalize(message.message).includes(query)
      );
    });
  }, [messageQuery, messages]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  async function removeMessage(message: AdminGuestbookMessage) {
    const confirmed = window.confirm(`Remover recado de ${message.name}?`);
    if (!confirmed) return;

    setRemovingId(message.id);
    const previous = messages;
    setMessages((current) => current.filter((item) => item.id !== message.id));

    const response = await fetch(`/api/admin/guestbook/${message.id}`, {
      method: "DELETE",
    });

    setRemovingId(null);

    if (!response.ok) {
      setMessages(previous);
      toast.error("Nao consegui remover o recado.");
      return;
    }

    toast.success("Recado removido.");
  }

  const cards = [
    {
      icon: UserCheck,
      label: "Confirmados",
      value: metrics.confirmed,
    },
    {
      icon: UserX,
      label: "Nao confirmados",
      value: metrics.declined,
    },
    {
      icon: Users,
      label: "RSVPs totais",
      value: metrics.totalRsvps,
    },
    {
      icon: MessageCircle,
      label: "Recados no mural",
      value: metrics.messages,
    },
  ];

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-primary/15 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl font-semibold text-accent">
              Painel admin
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold">
              Stenio faz 55
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="/api/admin/export.csv">
                <Download aria-hidden="true" className="mr-2 h-4 w-4" />
                Exportar CSV
              </a>
            </Button>
            <Button type="button" variant="outline" onClick={logout}>
              <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ icon: Icon, label, value }) => (
            <div
              className="rounded-lg border border-primary/10 bg-white/55 p-5 shadow-sm"
              key={label}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-foreground/65">{label}</p>
                <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-4 font-display text-4xl font-semibold">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap gap-2 border-b border-primary/15">
            {[
              { id: "rsvps" as const, label: "RSVPs" },
              { id: "mural" as const, label: "Mural" },
            ].map((item) => (
              <button
                className={cn(
                  "min-h-11 rounded-t-md px-5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  tab === item.id
                    ? "bg-primary text-background"
                    : "text-primary hover:bg-primary/10",
                )}
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "rsvps" ? (
            <div className="mt-6">
              <SearchBox
                label="Buscar RSVP por nome"
                value={rsvpQuery}
                onChange={setRsvpQuery}
              />
              <div className="mt-4 overflow-hidden rounded-lg border border-primary/10 bg-white/55 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead className="bg-primary text-background">
                      <tr>
                        <th className="px-4 py-3 font-medium">Nome</th>
                        <th className="px-4 py-3 font-medium">Comparece?</th>
                        <th className="px-4 py-3 font-medium">Acompanhantes</th>
                        <th className="px-4 py-3 font-medium">Recado</th>
                        <th className="px-4 py-3 font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRsvps.map((rsvp) => (
                        <tr className="border-t border-primary/10" key={rsvp.id}>
                          <td className="px-4 py-3 font-medium">{rsvp.name}</td>
                          <td className="px-4 py-3">
                            {rsvp.attending ? "Sim" : "Nao"}
                          </td>
                          <td className="px-4 py-3">{rsvp.guests}</td>
                          <td className="max-w-sm px-4 py-3 text-foreground/70">
                            {rsvp.message || "-"}
                          </td>
                          <td className="px-4 py-3">{formatDate(rsvp.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredRsvps.length === 0 ? (
                  <p className="p-5 text-sm text-foreground/65">
                    Nenhum RSVP encontrado.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {tab === "mural" ? (
            <div className="mt-6">
              <SearchBox
                label="Buscar no mural"
                value={messageQuery}
                onChange={setMessageQuery}
              />
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredMessages.map((message) => (
                  <article
                    className="rounded-lg border border-primary/10 bg-white/55 p-5 shadow-sm"
                    key={message.id}
                  >
                    <p className="whitespace-pre-wrap leading-7">{message.message}</p>
                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-display text-lg font-semibold">
                          {message.name}
                        </p>
                        <p className="mt-1 text-xs text-foreground/60">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                      <Button
                        className="border-red-700 text-red-700 hover:bg-red-700 hover:text-white"
                        disabled={removingId === message.id}
                        type="button"
                        variant="outline"
                        onClick={() => removeMessage(message)}
                      >
                        <Trash2 aria-hidden="true" className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
              {filteredMessages.length === 0 ? (
                <p className="mt-4 rounded-lg border border-primary/10 bg-white/55 p-5 text-sm text-foreground/65">
                  Nenhum recado encontrado.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function SearchBox({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block max-w-md text-sm font-medium">
      {label}
      <div className="relative mt-2">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60"
        />
        <input
          className="w-full rounded-md border border-primary/20 bg-white/70 px-4 py-3 pl-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

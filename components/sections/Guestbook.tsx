"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, MessageCircle, Send, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { guestbookSchema, type GuestbookInput } from "@/lib/validators";

type GuestbookMessage = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

type GuestbookResponse = {
  messages: GuestbookMessage[];
};

type SubmitResponse = {
  ok: boolean;
  message?: GuestbookMessage;
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-primary/20 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

const noteColors = ["#FFE9D6", "#DCEFE3", "#F5DCE0", "#FFF4C2"];
const rotations = ["-rotate-1", "rotate-1", "-rotate-2", "rotate-2"];

function hashText(value: string) {
  return value.split("").reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

function getRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return "agora";
  if (minutes === 1) return "há 1 minuto";
  if (minutes < 60) return `há ${minutes} minutos`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "há 1 hora";
  if (hours < 24) return `há ${hours} horas`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "há 1 dia";
  return `há ${days} dias`;
}

export function Guestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [sent, setSent] = useState(false);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<GuestbookInput>({
    defaultValues: {
      message: "",
      name: "",
    },
    resolver: zodResolver(guestbookSchema),
  });

  const messageText = watch("message") ?? "";

  async function fetchMessages() {
    try {
      const response = await fetch("/api/guestbook");
      if (!response.ok) return;
      const data = (await response.json()) as GuestbookResponse;
      setMessages(data.messages);
    } catch {
      // The form remains usable if the wall refresh fails.
    }
  }

  useEffect(() => {
    fetchMessages();
    const interval = window.setInterval(fetchMessages, 30000);

    return () => window.clearInterval(interval);
  }, []);

  async function onSubmit(values: GuestbookInput) {
    const response = await fetch("/api/guestbook", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const data = (await response.json().catch(() => null)) as SubmitResponse | null;

    if (response.status === 429) {
      toast.error("Calma aí, parceiro. Tenta de novo em alguns minutos.");
      return;
    }

    if (!response.ok || !data?.ok || !data.message) {
      toast.error("Não consegui mandar o recado. Tenta de novo daqui a pouco.");
      return;
    }

    setMessages((current) => [data.message as GuestbookMessage, ...current]);
    setSent(true);
    reset();
  }

  const emptyState = useMemo(
    () => messages.length === 0 && !sent,
    [messages.length, sent],
  );

  return (
    <section id="mural" className="bg-background px-5 py-20 text-foreground">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-2xl font-semibold text-accent">Mural</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Deixa um recado pro aniversariante
          </h2>
          <p className="mt-5 text-base leading-7 text-foreground/80 sm:text-lg">
            Memória boa, piada interna, abraço daqueles. Vai tudo no mural.
          </p>
        </div>

        <form
          className="mx-auto mt-10 w-full max-w-md rounded-lg bg-accent/35 p-5 shadow-sm sm:p-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label className="text-sm font-medium" htmlFor="guestbook-name">
              Seu nome
            </label>
            <div className="relative">
              <UserRound
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60"
              />
              <input
                id="guestbook-name"
                className={cn(fieldClassName, "pl-10")}
                placeholder="Quem está mandando?"
                {...register("name")}
              />
            </div>
            {errors.name ? (
              <p className="mt-2 text-sm text-red-700">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium" htmlFor="guestbook-message">
                Recado
              </label>
              <span className="text-xs text-foreground/60">
                {messageText.length}/240
              </span>
            </div>
            <textarea
              id="guestbook-message"
              className={cn(fieldClassName, "min-h-32 resize-y")}
              maxLength={240}
              placeholder="Manda aquele abraço..."
              {...register("message")}
            />
            {errors.message ? (
              <p className="mt-2 text-sm text-red-700">{errors.message.message}</p>
            ) : null}
          </div>

          <Button className="mt-5 w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send aria-hidden="true" className="mr-2 h-4 w-4" />
            )}
            Mandar recado
          </Button>

          {sent ? (
            <p className="mt-4 text-center text-sm font-medium text-primary">
              Recadinho no mural.
            </p>
          ) : null}
        </form>

        {emptyState ? (
          <div className="mx-auto mt-14 flex max-w-md flex-col items-center text-center text-foreground/60">
            <MessageCircle aria-hidden="true" className="h-20 w-20 opacity-20" />
            <p className="mt-4 font-display text-2xl font-semibold text-foreground">
              Ainda ninguém deixou recado.
            </p>
            <p className="mt-2">Quebra o gelo aí!</p>
          </div>
        ) : (
          <div className="mt-14 columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
            {messages.map((item) => {
              const hash = hashText(item.id);
              const background = noteColors[hash % noteColors.length];
              const rotation = rotations[hash % rotations.length];

              return (
                <article
                  className={cn(
                    "mb-4 break-inside-avoid rounded-md p-6 shadow-md transition hover:scale-[1.03] hover:shadow-xl",
                    rotation,
                  )}
                  key={item.id}
                  style={{ backgroundColor: background }}
                >
                  <p className="whitespace-pre-wrap text-base leading-7">
                    {item.message}
                  </p>
                  <footer className="mt-5">
                    <p className="font-display text-lg font-semibold">— {item.name}</p>
                    <p className="mt-1 text-xs text-foreground/60">
                      {getRelativeTime(item.createdAt)}
                    </p>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

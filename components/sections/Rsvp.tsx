"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, MessageCircle, UserRound, UsersRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { rsvpSchema, type RsvpFormInput, type RsvpInput } from "@/lib/validators";

type CountResponse = {
  confirmed: number;
  declined: number;
};

type SubmitResponse = {
  ok: boolean;
  totalConfirmed?: number;
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-primary/20 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export function Rsvp() {
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [submitted, setSubmitted] = useState<RsvpInput | null>(null);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<RsvpFormInput, unknown, RsvpInput>({
    defaultValues: {
      attending: true,
      guests: 0,
      message: "",
      name: "",
    },
    resolver: zodResolver(rsvpSchema),
  });

  const attending = watch("attending");
  const message = watch("message") ?? "";

  useEffect(() => {
    let ignore = false;

    async function fetchCount() {
      try {
        const response = await fetch("/api/rsvp/count");
        if (!response.ok) return;
        const data = (await response.json()) as CountResponse;
        if (!ignore) setConfirmedCount(data.confirmed);
      } catch {
        // The counter is decorative; the form still works if this fetch fails.
      }
    }

    fetchCount();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!attending) {
      setValue("guests", 0, { shouldValidate: true });
    }
  }, [attending, setValue]);

  const title = useMemo(() => {
    if (confirmedCount === 0) return "Seja o primeiro a confirmar presença";
    if (confirmedCount === 1) return "1 já confirmou presença";
    return `${confirmedCount} já confirmaram presença`;
  }, [confirmedCount]);

  async function onSubmit(values: RsvpInput) {
    const response = await fetch("/api/rsvp", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const data = (await response.json().catch(() => null)) as SubmitResponse | null;

    if (response.status === 429) {
      toast.error("Calma aí, parceiro. Tenta de novo em alguns minutos.");
      return;
    }

    if (!response.ok || !data?.ok) {
      toast.error("Não consegui salvar sua confirmação. Tenta de novo daqui a pouco.");
      return;
    }

    if (typeof data.totalConfirmed === "number") {
      setConfirmedCount(data.totalConfirmed);
    }

    setSubmitted(values);

    if (values.attending) {
      confetti({
        colors: ["#1F4D3A", "#F5A98A", "#FAF6F0"],
        origin: { y: 0.6 },
        particleCount: 200,
        spread: 120,
      });
    }
  }

  function scrollToGuestbook() {
    document.getElementById("mural")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="rsvp" className="bg-accent px-5 py-20 text-foreground">
      <div className="mx-auto w-full max-w-xl">
        <div className="text-center">
          <p className="font-display text-2xl font-semibold">Confirmação</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Bora juntar a galera?
          </h2>
          <p className="mt-5 text-base leading-7 text-foreground/80 sm:text-lg">
            Confirma aí pra gente ajustar a mesa.
          </p>
          <p className="mt-5 inline-flex items-center rounded-md bg-background/70 px-4 py-2 text-sm font-medium text-primary">
            <UsersRound aria-hidden="true" className="mr-2 h-4 w-4" />
            {title}
          </p>
        </div>

        {submitted ? (
          <div className="mt-10 rounded-lg bg-background p-6 text-center shadow-md">
            <p className="font-display text-3xl font-semibold text-primary">
              {submitted.attending
                ? "Tá selada! Stênio mal pode te ver."
                : "Sentiremos sua falta! Manda um abraço pelo mural."}
            </p>
            <Button className="mt-6" type="button" onClick={scrollToGuestbook}>
              <MessageCircle aria-hidden="true" className="mr-2 h-4 w-4" />
              Deixar recado no mural
            </Button>
          </div>
        ) : (
          <form
            className="mt-10 rounded-lg bg-background p-5 shadow-md sm:p-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <label className="text-sm font-medium" htmlFor="name">
                Seu nome
              </label>
              <div className="relative">
                <UserRound
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60"
                />
                <input
                  id="name"
                  className={cn(fieldClassName, "pl-10")}
                  placeholder="Nome e sobrenome"
                  {...register("name")}
                />
              </div>
              {errors.name ? (
                <p className="mt-2 text-sm text-red-700">{errors.name.message}</p>
              ) : null}
            </div>

            <fieldset className="mt-6">
              <legend className="text-sm font-medium">Vai comparecer?</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  className={cn(
                    "min-h-12 rounded-md border px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    attending
                      ? "border-primary bg-primary text-background"
                      : "border-primary/30 bg-transparent text-primary hover:bg-primary/10",
                  )}
                  type="button"
                  onClick={() => setValue("attending", true, { shouldValidate: true })}
                >
                  Tô dentro
                </button>
                <button
                  className={cn(
                    "min-h-12 rounded-md border px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    !attending
                      ? "border-primary bg-primary text-background"
                      : "border-primary/30 bg-transparent text-primary hover:bg-primary/10",
                  )}
                  type="button"
                  onClick={() => setValue("attending", false, { shouldValidate: true })}
                >
                  Não vou conseguir
                </button>
              </div>
            </fieldset>

            {attending ? (
              <div className="mt-6">
                <div className="max-w-64">
                  <label className="text-sm font-medium" htmlFor="guests">
                    Quantos acompanhantes?
                  </label>
                  <input
                    id="guests"
                    className={fieldClassName}
                    inputMode="numeric"
                    max={3}
                    min={0}
                    type="number"
                    {...register("guests")}
                  />
                  {errors.guests ? (
                    <p className="mt-2 text-sm text-red-700">{errors.guests.message}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium" htmlFor="message">
                  Recado pro Stênio
                </label>
                <span className="text-xs text-foreground/60">{message.length}/500</span>
              </div>
              <textarea
                id="message"
                className={cn(fieldClassName, "min-h-28 resize-y")}
                maxLength={500}
                placeholder="Capricha no brinde..."
                {...register("message")}
              />
              {errors.message ? (
                <p className="mt-2 text-sm text-red-700">{errors.message.message}</p>
              ) : null}
            </div>

            <Button className="mt-6 w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirmar
            </Button>

            <p className="mt-4 text-center text-xs text-foreground/60">
              A gente só guarda seu nome e a confirmação. Nada mais.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

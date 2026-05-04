"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Calendar, Clock, Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const eventDate = "2026-05-07T19:00:00-03:00";
const calendarLocation =
  "Boteco Caju Limão, SIG Quadra 8 - Cruzeiro / Sudoeste / Octogonal, Brasília - DF, 70610-480, Brasil";
const googleCalendarParams = new URLSearchParams({
  action: "TEMPLATE",
  dates: "20260507T220000Z/20260508T040000Z",
  details: "Boteco Caju Limão - Sudoeste",
  location: calendarLocation,
  text: "Stênio faz 55",
});
const googleCalendarUrl = `https://calendar.google.com/calendar/render?${googleCalendarParams.toString()}`;

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isToday: boolean;
};

const detailItems = [
  { icon: Calendar, text: "Quinta, 07 de maio de 2026" },
  { icon: Clock, text: "A partir das 19h" },
  { icon: MapPin, text: "Boteco Caju Limão · Sudoeste" },
];

function getTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      isToday: true,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    isToday: false,
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Countdown({ targetDate }: { targetDate: string }) {
  const reduceMotion = useReducedMotion();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(targetDate),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isToday) {
    return (
      <motion.div
        animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
        className="flex min-h-48 items-center justify-center rounded-lg bg-primary px-6 py-10 text-center text-background"
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="font-display text-6xl font-semibold sm:text-7xl">
          É HOJE!
        </p>
      </motion.div>
    );
  }

  const cards = [
    { label: "DIAS", value: timeLeft.days },
    { label: "HORAS", value: timeLeft.hours },
    { label: "MIN", value: timeLeft.minutes },
    { label: "SEG", value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          className="flex min-h-32 flex-col items-center justify-center overflow-hidden rounded-lg bg-primary px-3 py-5 text-background shadow-sm"
          key={card.label}
        >
          <div className="relative flex h-16 items-center justify-center">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                animate={{ y: 0, opacity: 1 }}
                className="font-display text-5xl font-semibold leading-none tabular-nums"
                exit={reduceMotion ? undefined : { y: -20, opacity: 0 }}
                initial={reduceMotion ? false : { y: 20, opacity: 0 }}
                key={`${card.label}-${card.value}`}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {String(card.value).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="mt-3 text-xs font-medium uppercase tracking-[0.2em]">
            {card.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function EventDetails() {
  return (
    <section id="detalhes" className="bg-background px-5 py-20 text-foreground">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 font-display text-2xl font-semibold text-accent">
            Contagem regressiva
          </p>
          <Countdown targetDate={eventDate} />
        </div>

        <div>
          <p className="font-display text-2xl font-semibold text-accent">
            Salve a data
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            O brinde já tem dia, hora e lugar.
          </h2>

          <ul className="mt-8 space-y-4">
            {detailItems.map(({ icon: Icon, text }) => (
              <li className="flex items-center gap-3" key={text}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-background">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="text-base font-medium sm:text-lg">{text}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-lg text-foreground/80">
            Mesa garantida, geladeira lotada. Só falta você.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a
                href={googleCalendarUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Calendar aria-hidden="true" className="mr-2 h-4 w-4" />
                Adicionar ao Google Calendar
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/calendar.ics">
                <Download aria-hidden="true" className="mr-2 h-4 w-4" />
                Baixar .ics
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

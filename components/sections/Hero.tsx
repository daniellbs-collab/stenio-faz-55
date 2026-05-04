"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { ChevronDown, MapPin, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=633M%2BW7+Sudoeste%2FOctogonal+Bras%C3%ADlia+-+DF";

const audioSrc = "/media/audio/funny-happy-birthday.mp3";

const textContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.4,
      staggerChildren: 0.15,
    },
  },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

function SoundtrackPlayer({ reduceMotion }: { reduceMotion: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

  async function playAudio() {
    const audio = audioRef.current;

    if (!audio) {
      return false;
    }

    audio.volume = 0.22;

    try {
      await audio.play();
      setIsPlaying(true);
      setNeedsGesture(false);
      return true;
    } catch {
      setIsPlaying(false);
      setNeedsGesture(true);
      return false;
    }
  }

  function pauseAudio() {
    audioRef.current?.pause();
    setIsPlaying(false);
  }

  async function toggleAudio() {
    if (isPlaying) {
      pauseAudio();
      return;
    }

    await playAudio();
  }

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = 0.22;

    function handleEnded() {
      setIsPlaying(false);
    }

    function handlePause() {
      setIsPlaying(false);
    }

    function handlePlay() {
      setIsPlaying(true);
    }

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setNeedsGesture(true);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      void playAudio();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [reduceMotion]);

  useEffect(() => {
    if (isPlaying || reduceMotion) {
      return;
    }

    async function handleFirstGesture() {
      await playAudio();
    }

    window.addEventListener("pointerdown", handleFirstGesture, { once: true });
    window.addEventListener("keydown", handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };
  }, [isPlaying, reduceMotion]);

  return (
    <div className="mt-6 flex w-full max-w-md flex-col items-center">
      <audio ref={audioRef} loop preload="metadata" src={audioSrc}>
        <track kind="captions" />
      </audio>
      <button
        aria-pressed={isPlaying}
        className="inline-flex min-h-12 items-center gap-3 rounded-full border border-primary/25 bg-background/70 px-5 py-3 text-sm font-semibold text-primary shadow-sm backdrop-blur transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
        onClick={toggleAudio}
        type="button"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-background">
          {isPlaying ? (
            <Pause aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Play aria-hidden="true" className="h-4 w-4 fill-current" />
          )}
        </span>
        <span className="text-left">
          <span className="block">Trilha do brinde</span>
          <span className="block text-xs font-medium text-foreground/65">
            {isPlaying
              ? "parabéns em modo festa"
              : needsGesture
                ? "toque para ativar"
                : "tentando tocar"}
          </span>
        </span>
      </button>
    </div>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      void confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.3 },
        colors: ["#1F4D3A", "#F5A98A", "#FAF6F0"],
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [reduceMotion]);

  function scrollToRsvp() {
    document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToDetails() {
    document.getElementById("detalhes")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className="relative flex min-h-screen min-h-[100svh] w-full items-center justify-center bg-accent px-5 pb-24 pt-8 text-foreground sm:pb-28">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <motion.p
          className="mb-5 text-xs font-medium uppercase tracking-[0.22em] text-primary sm:text-sm"
          initial={reduceMotion ? false : { opacity: 0, y: -12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          07.05.2026 · QUINTA · 19H
        </motion.p>

        <motion.video
          aria-hidden="true"
          autoPlay
          className="mb-6 w-full max-w-[min(600px,90vw)] drop-shadow-2xl"
          initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          loop
          muted
          playsInline
          poster="/media/hero-poster.jpg"
          preload="metadata"
        >
          <source src="/media/hero.webm" type="video/webm" />
          <source src="/media/hero.mp4" type="video/mp4" />
        </motion.video>

        <motion.div
          className="flex flex-col items-center"
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          variants={textContainer}
        >
          <motion.h1
            className="font-display text-[clamp(3rem,8vw,6rem)] font-semibold leading-[0.95] tracking-normal"
            variants={textItem}
          >
            Stênio faz 55
          </motion.h1>
          <motion.p
            className="mt-5 text-balance text-lg font-medium sm:text-2xl"
            variants={textItem}
          >
            55 motivos pra brindar. Vem com a gente?
          </motion.p>
          <motion.p
            className="mt-3 flex items-center gap-2 text-sm font-medium text-primary sm:text-base"
            variants={textItem}
          >
            <MapPin aria-hidden="true" className="h-4 w-4" />
            Boteco Caju Limão · Sudoeste
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-3"
            variants={textItem}
          >
            <Button type="button" onClick={scrollToRsvp}>
              Tô dentro
            </Button>
            <Button asChild variant="outline">
              <a href={mapsUrl} rel="noopener noreferrer" target="_blank">
                Como chegar
              </a>
            </Button>
          </motion.div>
          <motion.div variants={textItem}>
            <SoundtrackPlayer reduceMotion={Boolean(reduceMotion)} />
          </motion.div>
        </motion.div>
      </div>
      <motion.button
        aria-label="Rolar para ver os detalhes"
        animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 rounded-md px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent sm:bottom-6"
        onClick={scrollToDetails}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        type="button"
      >
        <span>role pra ver os detalhes</span>
        <ChevronDown aria-hidden="true" className="h-5 w-5" />
      </motion.button>
    </header>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, RotateCcw, Send, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { quizQuestions } from "@/lib/quiz-data";

type QuizPhase = "intro" | "playing" | "result";

type QuizState = {
  phase: QuizPhase;
  currentIndex: number;
  answers: number[];
};

const initialState: QuizState = {
  phase: "intro",
  currentIndex: 0,
  answers: [],
};

function getResultMessage(score: number) {
  if (score >= 8) return "Você é da família. Stênio te deve uma.";
  if (score >= 6) return "Mandou bem, parceiro!";
  if (score >= 4) return "Tá no caminho. Próximo happy hour eu te explico.";
  return "Você conheceu o Stênio agora? Vem na festa pra atualizar.";
}

function getScore(answers: number[]) {
  return answers.reduce((score, answer, index) => {
    return score + (answer === quizQuestions[index]?.correctIndex ? 1 : 0);
  }, 0);
}

export function Quiz() {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<QuizState>(initialState);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const currentQuestion = quizQuestions[state.currentIndex];
  const total = quizQuestions.length;
  const score = useMemo(() => getScore(state.answers), [state.answers]);
  const answered = selectedOption !== null;
  const progress = state.phase === "playing" ? ((state.currentIndex + 1) / total) * 100 : 0;

  useEffect(() => {
    if (state.phase !== "result" || reduceMotion) return;

    confetti({
      colors: ["#1F4D3A", "#F5A98A", "#FAF6F0"],
      origin: { y: 0.55 },
      particleCount: Math.max(80, score * 28),
      spread: 110,
    });
  }, [reduceMotion, score, state.phase]);

  useEffect(() => {
    if (selectedOption === null || !currentQuestion) return;

    const timeout = window.setTimeout(() => {
      const nextAnswers = [...state.answers, selectedOption];
      const nextIndex = state.currentIndex + 1;

      if (nextIndex >= total) {
        setState({
          answers: nextAnswers,
          currentIndex: state.currentIndex,
          phase: "result",
        });
      } else {
        setState({
          answers: nextAnswers,
          currentIndex: nextIndex,
          phase: "playing",
        });
      }

      setSelectedOption(null);
      setFeedback("");
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [currentQuestion, selectedOption, state.answers, state.currentIndex, total]);

  function startQuiz() {
    setState({ ...initialState, phase: "playing" });
    setSelectedOption(null);
    setFeedback("");
  }

  function selectOption(index: number) {
    if (answered || !currentQuestion) return;

    const isCorrect = index === currentQuestion.correctIndex;
    setSelectedOption(index);
    setFeedback(isCorrect ? currentQuestion.reaction.right : currentQuestion.reaction.wrong);

    if (isCorrect && !reduceMotion) {
      confetti({
        colors: ["#F5A98A", "#FAF6F0"],
        origin: { y: 0.65 },
        particleCount: 55,
        spread: 70,
      });
    }
  }

  function resetQuiz() {
    setState(initialState);
    setSelectedOption(null);
    setFeedback("");
  }

  async function shareScore() {
    const url = window.location.href.split("#")[0];
    const text = `Acertei ${score}/${total} no quiz do aniversário do Stênio! ${url}`;

    if (navigator.share) {
      await navigator.share({
        text,
        title: "Quiz Stênio faz 55",
        url,
      });
      return;
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <section
      id="quiz"
      className="bg-gradient-to-b from-primary to-primary/90 px-5 py-20 text-background"
    >
      <div className="mx-auto w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {state.phase === "intro" ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-2xl text-center"
              exit={reduceMotion ? undefined : { opacity: 0, y: -16 }}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              key="intro"
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <p className="font-display text-2xl font-semibold text-accent">Quiz</p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Quanto você conhece o Stênio?
              </h2>
              <p className="mt-5 text-base leading-7 text-background/80 sm:text-lg">
                9 perguntas. Quem acertar mais ganha o respeito da galera e nada mais.
              </p>
              <Button
                className="mt-8 bg-accent text-foreground hover:bg-accent/90"
                type="button"
                onClick={startQuiz}
              >
                <Sparkles aria-hidden="true" className="mr-2 h-4 w-4" />
                Bora!
              </Button>
            </motion.div>
          ) : null}

          {state.phase === "playing" && currentQuestion ? (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -80 }}
              initial={reduceMotion ? false : { opacity: 0, x: 80 }}
              key={currentQuestion.id}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="mb-8">
                <div className="flex items-center justify-between gap-4 text-sm font-medium text-background/75">
                  <span>
                    Pergunta {state.currentIndex + 1} de {total}
                  </span>
                  <span>
                    {state.answers.length}/{total} respondidas
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/15">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-lg border border-background/15 bg-background/10 p-5 shadow-lg backdrop-blur sm:p-8">
                <h3 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
                  {currentQuestion.question}
                </h3>

                <div className="mt-8 grid gap-3 md:grid-cols-2">
                  {currentQuestion.options.map((option, index) => {
                    const isCorrect = index === currentQuestion.correctIndex;
                    const isSelected = selectedOption === index;
                    const showCorrect = answered && isCorrect;
                    const showWrong = answered && isSelected && !isCorrect;

                    return (
                      <button
                        className={cn(
                          "min-h-14 rounded-md border border-background/20 bg-background/10 px-4 py-3 text-left text-sm font-medium text-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-base",
                          !answered && "hover:bg-background/20",
                          showCorrect && "border-emerald-300 bg-emerald-500 text-white",
                          showWrong && "border-red-300 bg-red-500 text-white",
                        )}
                        disabled={answered}
                        key={option}
                        type="button"
                        onClick={() => selectOption(index)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div aria-live="polite" className="sr-only">
                  {feedback}
                </div>

                <AnimatePresence>
                  {answered ? (
                    <motion.div
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-10 flex items-center justify-center bg-primary/75 p-4 backdrop-blur-md"
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      initial={reduceMotion ? false : { opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                      <motion.div
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={cn(
                          "w-full max-w-lg rounded-lg border p-6 text-center shadow-2xl",
                          selectedOption === currentQuestion.correctIndex
                            ? "border-emerald-200 bg-emerald-500 text-white"
                            : "border-red-200 bg-red-500 text-white",
                        )}
                        initial={
                          reduceMotion ? false : { opacity: 0, scale: 0.94, y: 18 }
                        }
                        transition={{ duration: 0.22, ease: "easeOut" }}
                      >
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                          {selectedOption === currentQuestion.correctIndex ? (
                            <CheckCircle2 aria-hidden="true" className="h-8 w-8" />
                          ) : (
                            <XCircle aria-hidden="true" className="h-8 w-8" />
                          )}
                        </div>
                        <p className="mt-4 font-display text-3xl font-semibold">
                          {selectedOption === currentQuestion.correctIndex
                            ? "Boa!"
                            : "Quase!"}
                        </p>
                        <p className="mt-3 text-base font-medium leading-7 text-white/90">
                          {feedback}
                        </p>
                        {selectedOption !== currentQuestion.correctIndex ? (
                          <p className="mt-4 rounded-md bg-white/15 px-4 py-3 text-sm font-medium">
                            Resposta certa:{" "}
                            {currentQuestion.options[currentQuestion.correctIndex]}
                          </p>
                        ) : null}
                        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/20">
                          <motion.div
                            animate={{ width: "100%" }}
                            className="h-full rounded-full bg-white"
                            initial={{ width: "0%" }}
                            transition={{ duration: 1.35, ease: "linear" }}
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}

          {state.phase === "result" ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-2xl text-center"
              exit={reduceMotion ? undefined : { opacity: 0, y: -16 }}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              key="result"
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <p className="font-display text-2xl font-semibold text-accent">Resultado</p>
              <p className="mt-5 font-display text-7xl font-semibold leading-none sm:text-8xl">
                {score}/{total}
              </p>
              <h2 className="mt-6 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {getResultMessage(score)}
              </h2>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  className="bg-accent text-foreground hover:bg-accent/90"
                  type="button"
                  onClick={resetQuiz}
                >
                  <RotateCcw aria-hidden="true" className="mr-2 h-4 w-4" />
                  Jogar de novo
                </Button>
                <Button
                  className="border-background text-background hover:bg-background hover:text-primary"
                  type="button"
                  variant="outline"
                  onClick={shareScore}
                >
                  <Send aria-hidden="true" className="mr-2 h-4 w-4" />
                  Compartilhar score
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

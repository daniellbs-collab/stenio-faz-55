"use client";

import { useState } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/admin/login", {
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    setLoading(false);

    if (!response.ok) {
      setError(
        response.status === 401
          ? "Senha incorreta."
          : "Não consegui validar a senha agora.",
      );
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-accent px-5 py-12 text-foreground">
      <form
        className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg"
        onSubmit={handleSubmit}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-background">
          <LockKeyhole aria-hidden="true" className="h-5 w-5" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold">
          Admin Stênio 55
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/70">
          Acesso restrito para acompanhar confirmações e recados.
        </p>

        <label className="mt-6 block text-sm font-medium" htmlFor="password">
          Senha
        </label>
        <input
          autoComplete="current-password"
          autoFocus
          className="mt-2 w-full rounded-md border border-primary/20 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

        <Button className="mt-6 w-full" disabled={loading} type="submit">
          {loading ? (
            <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Entrar
        </Button>
      </form>
    </main>
  );
}

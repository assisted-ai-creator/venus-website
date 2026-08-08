"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api, ApiError } from "@/components/admin/api";
import { Plate, TitleBand } from "@/components/chart/Plate";
import { Wordmark } from "@/components/site/Wordmark";

function SignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);
  const [name, setName] = useState("");

  // A deployment with no accounts yet offers to create the first one, so the
  // school is never locked out of a panel it has just deployed.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => {
        if (r.ok && !cancelled) router.replace(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [router, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (needsSetup) {
        await api.post("/bootstrap", { email, password, name: name || "Administrator" });
      }
      await api.post("/session", { email, password });
      router.replace(next);
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setBusy(false);
    }
  };

  return (
    <main className="ground-ink grid min-h-dvh place-items-center p-5">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center text-paper">
          <Wordmark className="justify-center" />
        </div>

        <Plate>
          <TitleBand plate={needsSetup ? "SETUP" : "ACCESS"}>
            {needsSetup ? "Create the first administrator" : "Sign in to the panel"}
          </TitleBand>

          <form onSubmit={submit} className="space-y-4 p-6">
            {error ? (
              <p className="border-2 border-alert bg-[#fdf2f0] px-3 py-2 text-sm text-alert">{error}</p>
            ) : null}

            {needsSetup ? (
              <label className="block">
                <span className="chart-label mb-1.5 block opacity-70">Your name</span>
                <input
                  className="field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Principal's office"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="chart-label mb-1.5 block opacity-70">Email address</span>
              <input
                className="field"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="chart-label mb-1.5 block opacity-70">Password</span>
              <input
                className="field"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={needsSetup ? "new-password" : "current-password"}
                minLength={needsSetup ? 10 : undefined}
              />
              {needsSetup ? (
                <span className="mt-1.5 block text-xs text-ink-soft">At least ten characters.</span>
              ) : null}
            </label>

            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              {busy ? "Working…" : needsSetup ? "Create account and sign in" : "Sign in"}
            </button>

            <p className="border-t-2 border-paper-shade pt-4 text-center text-xs text-ink-soft">
              {needsSetup ? (
                <button type="button" className="underline" onClick={() => setNeedsSetup(false)}>
                  I already have an account
                </button>
              ) : (
                <button type="button" className="underline" onClick={() => setNeedsSetup(true)}>
                  First time here? Set up the first administrator
                </button>
              )}
            </p>
          </form>
        </Plate>

        <p className="mt-5 text-center text-xs text-navy-300">
          This panel is limited to approved addresses when the IP gate is switched on.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="ground-ink grid min-h-dvh place-items-center">
          <p className="chart-label text-navy-200">Loading…</p>
        </main>
      }
    >
      <SignIn />
    </Suspense>
  );
}

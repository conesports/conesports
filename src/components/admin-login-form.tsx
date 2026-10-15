"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setPending(false);
      setError("Invalid email or password.");
      return;
    }

    const session = await fetch("/api/auth/session").then((res) => res.json());
    if (!session?.user?.isAdmin) {
      await signOut({ redirect: false });
      setPending(false);
      setError("This account does not have admin access.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-white/15 bg-white/5 p-6">
      <label className="block text-sm text-white/80">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full border border-white/20 bg-black px-3 py-3 text-sm text-white outline-none focus:border-white"
        />
      </label>
      <label className="block text-sm text-white/80">
        Password
        <span className="relative mt-2 block">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full border border-white/20 bg-black px-3 py-3 pr-16 text-sm text-white outline-none focus:border-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-bold tracking-[0.12em] text-white/60 uppercase transition hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn-solid w-full disabled:opacity-60">
        {pending ? "Signing in…" : "Admin log in"}
      </button>
    </form>
  );
}

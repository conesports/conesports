"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: redirectTo })}
      className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
    >
      Log out
    </button>
  );
}

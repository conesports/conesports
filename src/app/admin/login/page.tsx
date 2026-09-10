import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-black px-4 py-16 text-white">
      <div className="hero-glow pointer-events-none absolute -left-24 top-1/4 h-[50%] w-[50%] rounded-full" />
      <div className="relative w-full max-w-md">
        <div className="mb-10 text-center">
          <BrandLogo variant="light" layout="mark" className="mx-auto h-20" priority />
          <p className="admin-label mt-6 text-white/55">Back office</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight uppercase">
            Admin sign in
          </h1>
        </div>
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}

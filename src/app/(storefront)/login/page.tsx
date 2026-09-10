import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <section className="space-y-6">
      <h1 className="text-center text-2xl font-semibold tracking-tight">Log in</h1>
      <Suspense>
        <LoginForm googleEnabled={googleEnabled} />
      </Suspense>
    </section>
  );
}

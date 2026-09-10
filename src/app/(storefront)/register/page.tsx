import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Create an account
      </h1>
      <RegisterForm />
    </section>
  );
}

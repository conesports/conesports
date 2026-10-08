import Link from "next/link";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-zinc-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-card ${className}`.trim()}>
      {title ? <h2 className="admin-card-title">{title}</h2> : null}
      {children}
    </section>
  );
}

export function AdminBackLink({ href = "/admin/dashboard" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-black"
    >
      <span aria-hidden="true">←</span>
      Back
    </Link>
  );
}

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const items = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <AdminPageHeader title="Messages" description="Contact form submissions." />
      {items.length === 0 ? (
        <p className="text-sm">No messages yet.</p>
      ) : (
        <ul className="space-y-4 text-sm">
          {items.map((m) => (
            <li key={m.id} className="border p-3">
              <p className="font-medium">
                {m.name} · {m.email}
                {m.phone ? ` · ${m.phone}` : ""}
              </p>
              <p className="text-zinc-600">
                {m.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                {m.subject ? ` · ${m.subject}` : ""}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{m.body}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

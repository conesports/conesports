import { AdminPageHeader } from "@/components/admin-page-header";

export default function LaterPhasePage({ title }: { title: string }) {
  return (
    <>
      <AdminPageHeader title={title} />
      <p className="text-sm text-zinc-600">This section lands in a later phase.</p>
    </>
  );
}

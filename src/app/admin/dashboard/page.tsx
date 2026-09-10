import { AdminDashboardView } from "@/components/admin-dashboard";
import { loadAdminDashboard } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await loadAdminDashboard();
  return <AdminDashboardView data={data} />;
}

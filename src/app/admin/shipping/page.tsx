import { AdminPageHeader } from "@/components/admin-page-header";
import { SettingsForm } from "@/components/settings-form";
import { getNgnPerUsd } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const ngnPerUsd = await getNgnPerUsd();

  return (
    <>
      <AdminPageHeader
        title="Shipping"
        description={`Rates are stored in naira. Live rate: ₦${ngnPerUsd.toLocaleString("en-NG")} = $1.`}
      />
      <p className="mb-4 text-sm text-zinc-600">
        Domestic uses first-item + extra-item. International uses the 1–5 item tiers, then the extra-item rate.
        Checkout always recomputes shipping on the server.
      </p>
      <SettingsForm group="shipping" />
    </>
  );
}

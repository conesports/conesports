import { AdminPageHeader } from "@/components/admin-page-header";
import { SettingsForm } from "@/components/settings-form";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Paystack (NG) and Flutterwave (international). Empty secret fields keep the existing value."
      />
      <h2 className="mb-3 text-sm font-medium">Payments</h2>
      <SettingsForm group="payments" />
      <h2 className="mb-3 mt-10 text-sm font-medium">Email</h2>
      <p className="mb-3 text-sm text-zinc-600">
        Resend API key and from-address. Empty secret fields keep the existing value.
      </p>
      <SettingsForm group="email" />
      <h2 className="mb-3 mt-10 text-sm font-medium">Store</h2>
      <SettingsForm group="store" />
      <h2 className="mb-3 mt-10 text-sm font-medium">Social media</h2>
      <p className="mb-3 text-sm text-zinc-600">
        Facebook, Instagram, and TikTok profile URLs for the storefront footer. Icons always show; add a URL to make each one clickable.
      </p>
      <SettingsForm group="marketing" />
    </>
  );
}

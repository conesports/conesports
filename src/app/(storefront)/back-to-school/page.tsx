import { HubPage, hubMetadata } from "@/components/hub-page";

export const dynamic = "force-dynamic";
export const generateMetadata = hubMetadata("back-to-school");

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <HubPage slug="back-to-school" searchParams={searchParams} />;
}

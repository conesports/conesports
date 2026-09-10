import { HubPage, hubMetadata } from "@/components/hub-page";

export const dynamic = "force-dynamic";
export const generateMetadata = hubMetadata("women");

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <HubPage slug="women" searchParams={searchParams} />;
}

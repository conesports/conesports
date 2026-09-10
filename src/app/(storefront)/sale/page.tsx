import { HubPage, hubMetadata } from "@/components/hub-page";

export const dynamic = "force-dynamic";
export const generateMetadata = hubMetadata("sale");

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <HubPage slug="sale" searchParams={searchParams} />;
}

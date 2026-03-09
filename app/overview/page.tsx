import { getOverview } from "@/lib/dashboard";
import { requireRoleOrRedirect } from "@/lib/auth";
import { getCurrentSiteId } from "@/lib/request";
import { NorthStarOverview } from "@/components/northstar/NorthStarOverview";

export default async function OverviewPage() {
  await requireRoleOrRedirect("editor");
  const siteId = await getCurrentSiteId();
  const data = await getOverview(siteId, "30d");

  return <NorthStarOverview overview={data as any} />;
}

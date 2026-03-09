import { getOverview } from "@/lib/dashboard";
import { getCurrentSiteId } from "@/lib/request";
import { requireRoleOrRedirect } from "@/lib/auth";
import { ChannelPage } from "@/components/northstar/ChannelPage";

export default async function YandexAdsPage() {
  await requireRoleOrRedirect("editor");
  const siteId = await getCurrentSiteId();
  const data = await getOverview(siteId, "30d");
  return <ChannelPage title="Yandex Ads" channel="yandex" trend={(data as any).trend ?? []} />;
}

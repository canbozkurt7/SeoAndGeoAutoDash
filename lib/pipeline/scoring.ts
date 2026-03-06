import type {
  AlertConfig,
  DailyScoreOutput,
  GeoObservationInput,
  SeoSnapshotInput
} from "@/lib/types";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
}

export function computeSeoScore(snapshot: SeoSnapshotInput): number {
  const ctrWeight = Math.min(snapshot.ctr * 100, 10) * 5;
  const posWeight = Math.max(0, 100 - snapshot.avg_position * 4);
  const conversionWeight = Math.min(snapshot.conversions * 2, 20);
  return clampScore(ctrWeight + posWeight * 0.3 + conversionWeight);
}

export function computeGeoCitationScore(
  observations: GeoObservationInput[],
  siteDomain: string
): number {
  if (!observations.length) {
    return 0;
  }
  const hits = observations.filter((obs) =>
    obs.cited_domains.some((d) => d.includes(siteDomain))
  ).length;
  return clampScore((hits / observations.length) * 100);
}

export function computeDailyScore(args: {
  siteId: string;
  date: string;
  snapshot: SeoSnapshotInput;
  observations: GeoObservationInput[];
  siteDomain: string;
  previous?: { seo_score: number; geo_citation_score: number };
  alertConfig: AlertConfig;
}): DailyScoreOutput {
  const seo_score = computeSeoScore(args.snapshot);
  const geo_citation_score = computeGeoCitationScore(
    args.observations,
    args.siteDomain
  );
  const seo_delta = seo_score - (args.previous?.seo_score ?? seo_score);
  const geo_delta =
    geo_citation_score - (args.previous?.geo_citation_score ?? geo_citation_score);

  const alert_flags: string[] = [];
  if (seo_delta <= -Math.abs(args.alertConfig.seo_drop_threshold)) {
    alert_flags.push("seo_drop");
  }
  if (geo_delta <= -Math.abs(args.alertConfig.geo_drop_threshold)) {
    alert_flags.push("geo_drop");
  }
  if (
    seo_delta >= Math.abs(args.alertConfig.spike_threshold) ||
    geo_delta >= Math.abs(args.alertConfig.spike_threshold)
  ) {
    alert_flags.push("positive_spike");
  }

  return {
    site_id: args.siteId,
    date: args.date,
    seo_score,
    geo_citation_score,
    seo_delta,
    geo_delta,
    alert_flags
  };
}

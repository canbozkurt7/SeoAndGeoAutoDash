import { dailyData } from "./mockData";

const last30 = dailyData.slice(-30);
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

// --- KPIs ---
export const metaKPIs = {
  spend: sum(last30.map((d) => d.meta.spend ?? 0)),
  reach: Math.round(sum(last30.map((d) => d.meta.impressions)) * 0.62),
  cpm: Math.round((sum(last30.map((d) => d.meta.spend ?? 0)) / sum(last30.map((d) => d.meta.impressions))) * 1000 * 100) / 100,
  roas: Math.round((sum(last30.map((d) => d.meta.revenue)) / sum(last30.map((d) => d.meta.spend ?? 0))) * 100) / 100,
};

// --- Funnel ---
export interface FunnelStage {
  stage: string;
  value: number;
  dropOff: number;
}

const totalImpr = sum(last30.map((d) => d.meta.impressions));
const totalReach = metaKPIs.reach;
const totalClicks = sum(last30.map((d) => d.meta.clicks));
const lpViews = Math.round(totalClicks * 0.82);
const purchases = sum(last30.map((d) => d.meta.conversions));

export const funnelData: FunnelStage[] = [
  { stage: "Impressions", value: totalImpr, dropOff: 0 },
  { stage: "Reach", value: totalReach, dropOff: Math.round((1 - totalReach / totalImpr) * 100) },
  { stage: "Clicks", value: totalClicks, dropOff: Math.round((1 - totalClicks / totalReach) * 100) },
  { stage: "Landing Page Views", value: lpViews, dropOff: Math.round((1 - lpViews / totalClicks) * 100) },
  { stage: "Purchases", value: purchases, dropOff: Math.round((1 - purchases / lpViews) * 100) },
];

// --- Placement Breakdown ---
export interface PlacementData {
  placement: string;
  spendShare: number;
  ctr: number;
  roas: number;
}

export const placements: PlacementData[] = [
  { placement: "Feed", spendShare: 42, ctr: 2.8, roas: 7.2 },
  { placement: "Stories", spendShare: 24, ctr: 1.9, roas: 5.4 },
  { placement: "Reels", spendShare: 22, ctr: 3.4, roas: 8.1 },
  { placement: "Audience Network", spendShare: 12, ctr: 0.8, roas: 2.6 },
];

// --- Creative Performance ---
export interface Creative {
  id: string;
  name: string;
  format: "Video" | "Image" | "Carousel";
  spend: number;
  impressions: number;
  ctr: number;
  hookRate: number;
  roas: number;
}

export const creatives: Creative[] = [
  { id: "cr1", name: "Summer Sale — Hero Video", format: "Video", spend: 8200, impressions: 420000, ctr: 3.2, hookRate: 42, roas: 8.4 },
  { id: "cr2", name: "Product Showcase Carousel", format: "Carousel", spend: 6800, impressions: 380000, ctr: 2.8, hookRate: 0, roas: 7.1 },
  { id: "cr3", name: "UGC Testimonial #1", format: "Video", spend: 5400, impressions: 290000, ctr: 3.6, hookRate: 48, roas: 9.2 },
  { id: "cr4", name: "Static Promo — 20% Off", format: "Image", spend: 4200, impressions: 310000, ctr: 1.8, hookRate: 0, roas: 5.8 },
  { id: "cr5", name: "Reel — Behind the Scenes", format: "Video", spend: 3800, impressions: 260000, ctr: 4.1, hookRate: 52, roas: 6.4 },
  { id: "cr6", name: "Collection — New Arrivals", format: "Carousel", spend: 3200, impressions: 220000, ctr: 2.4, hookRate: 0, roas: 6.8 },
  { id: "cr7", name: "DPA — Electronics", format: "Image", spend: 4800, impressions: 440000, ctr: 1.6, hookRate: 0, roas: 4.2 },
  { id: "cr8", name: "UGC Testimonial #2", format: "Video", spend: 2800, impressions: 180000, ctr: 3.8, hookRate: 38, roas: 7.6 },
];

// --- Frequency Warnings ---
export interface FrequencyWarning {
  campaign: string;
  frequency: number;
}

export const frequencyWarnings: FrequencyWarning[] = [
  { campaign: "Retargeting — Website Visitors", frequency: 4.2 },
  { campaign: "Retargeting — Cart Abandoners", frequency: 3.8 },
];

// --- Daily chart ---
export const metaDailyChart = dailyData.map((d) => ({
  date: d.date,
  spend: d.meta.spend ?? 0,
  impressions: d.meta.impressions,
  clicks: d.meta.clicks,
  conversions: d.meta.conversions,
  revenue: d.meta.revenue,
}));

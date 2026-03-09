import { dailyData } from "./mockData";

// --- Search Terms ---
export interface SearchTerm {
  query: string;
  matchType: "Exact" | "Phrase" | "Broad";
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  qualityScore: number;
}

export const searchTerms: SearchTerm[] = [
  { query: "buy electronics online", matchType: "Broad", impressions: 42000, clicks: 3200, ctr: 7.62, cpc: 1.24, conversions: 180, qualityScore: 8 },
  { query: "best laptop deals 2024", matchType: "Phrase", impressions: 38000, clicks: 2800, ctr: 7.37, cpc: 1.52, conversions: 140, qualityScore: 7 },
  { query: "brand name store", matchType: "Exact", impressions: 28000, clicks: 8400, ctr: 30.0, cpc: 0.42, conversions: 420, qualityScore: 10 },
  { query: "wireless headphones sale", matchType: "Phrase", impressions: 22000, clicks: 1800, ctr: 8.18, cpc: 1.88, conversions: 82, qualityScore: 6 },
  { query: "cheap smartphones", matchType: "Broad", impressions: 34000, clicks: 2200, ctr: 6.47, cpc: 2.10, conversions: 64, qualityScore: 5 },
  { query: "smart tv 55 inch", matchType: "Phrase", impressions: 18000, clicks: 1400, ctr: 7.78, cpc: 1.68, conversions: 58, qualityScore: 7 },
  { query: "gaming keyboard mechanical", matchType: "Broad", impressions: 15000, clicks: 1100, ctr: 7.33, cpc: 1.92, conversions: 42, qualityScore: 6 },
  { query: "brand name electronics", matchType: "Exact", impressions: 24000, clicks: 6800, ctr: 28.33, cpc: 0.56, conversions: 340, qualityScore: 9 },
  { query: "tablet for drawing", matchType: "Phrase", impressions: 12000, clicks: 880, ctr: 7.33, cpc: 2.20, conversions: 38, qualityScore: 5 },
  { query: "4k monitor deals", matchType: "Broad", impressions: 16000, clicks: 1200, ctr: 7.50, cpc: 1.76, conversions: 52, qualityScore: 7 },
  { query: "usb c hub adapter", matchType: "Phrase", impressions: 9200, clicks: 720, ctr: 7.83, cpc: 1.44, conversions: 36, qualityScore: 8 },
  { query: "noise cancelling earbuds", matchType: "Broad", impressions: 20000, clicks: 1600, ctr: 8.0, cpc: 1.96, conversions: 68, qualityScore: 6 },
  { query: "brand name laptop", matchType: "Exact", impressions: 19000, clicks: 5200, ctr: 27.37, cpc: 0.64, conversions: 280, qualityScore: 9 },
  { query: "portable charger 20000mah", matchType: "Phrase", impressions: 8400, clicks: 640, ctr: 7.62, cpc: 1.34, conversions: 28, qualityScore: 7 },
  { query: "bluetooth speaker waterproof", matchType: "Broad", impressions: 11000, clicks: 820, ctr: 7.45, cpc: 1.82, conversions: 34, qualityScore: 6 },
];

// --- Device Breakdown ---
export interface DeviceBreakdown {
  device: string;
  clicks: number;
  conversions: number;
  share: number;
}

export const deviceBreakdown: DeviceBreakdown[] = [
  { device: "Desktop", clicks: 28400, conversions: 1240, share: 48 },
  { device: "Mobile", clicks: 24800, conversions: 720, share: 42 },
  { device: "Tablet", clicks: 5800, conversions: 180, share: 10 },
];

// --- Bid Strategies ---
export interface BidStrategy {
  name: string;
  type: "Target CPA" | "Target ROAS" | "Maximize Conversions" | "Maximize Clicks";
  target: number;
  actual: number;
  campaigns: number;
  status: "On Track" | "Below Target" | "Above Target";
}

export const bidStrategies: BidStrategy[] = [
  { name: "Brand Portfolio", type: "Target CPA", target: 12.0, actual: 10.40, campaigns: 3, status: "Above Target" },
  { name: "Shopping Smart", type: "Target ROAS", target: 5.0, actual: 5.80, campaigns: 2, status: "Above Target" },
  { name: "Generic Search", type: "Maximize Conversions", target: 0, actual: 42, campaigns: 2, status: "On Track" },
  { name: "Display Remarket", type: "Maximize Clicks", target: 0, actual: 8400, campaigns: 1, status: "Below Target" },
];

// --- Google daily aggregates ---
export const googleDailyChart = dailyData.map((d) => ({
  date: d.date,
  impressions: d.google.impressions,
  conversions: d.google.conversions,
  ctr: d.google.impressions > 0 ? Math.round((d.google.clicks / d.google.impressions) * 10000) / 100 : 0,
  spend: d.google.spend ?? 0,
  clicks: d.google.clicks,
}));

// --- KPIs ---
const last30 = dailyData.slice(-30);
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

export const googleKPIs = {
  spend: sum(last30.map((d) => d.google.spend ?? 0)),
  conversions: sum(last30.map((d) => d.google.conversions)),
  roas: Math.round((sum(last30.map((d) => d.google.revenue)) / sum(last30.map((d) => d.google.spend ?? 0))) * 100) / 100,
  avgCPC: Math.round((sum(last30.map((d) => d.google.spend ?? 0)) / sum(last30.map((d) => d.google.clicks))) * 100) / 100,
};

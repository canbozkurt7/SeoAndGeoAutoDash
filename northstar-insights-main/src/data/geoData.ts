export interface CountryPerformance {
  country: string;
  code: string;
  spend: number;
  revenue: number;
  conversions: number;
  clicks: number;
  impressions: number;
  roas: number;
  cpa: number;
  channels: { google: number; meta: number; yandex: number };
}

export interface GeoAnomaly {
  id: string;
  country: string;
  type: "spike" | "drop" | "opportunity";
  metric: string;
  message: string;
  change: number;
}

export const countryPerformance: CountryPerformance[] = [
  { country: "United States", code: "US", spend: 42800, revenue: 198000, conversions: 2840, clicks: 48200, impressions: 1420000, roas: 4.63, cpa: 15.07, channels: { google: 52, meta: 38, yandex: 0 } },
  { country: "Germany", code: "DE", spend: 18200, revenue: 82400, conversions: 1240, clicks: 22800, impressions: 680000, roas: 4.53, cpa: 14.68, channels: { google: 45, meta: 42, yandex: 0 } },
  { country: "United Kingdom", code: "GB", spend: 22400, revenue: 94200, conversions: 1580, clicks: 28400, impressions: 820000, roas: 4.21, cpa: 14.18, channels: { google: 48, meta: 40, yandex: 0 } },
  { country: "Russia", code: "RU", spend: 14800, revenue: 48200, conversions: 920, clicks: 16400, impressions: 520000, roas: 3.26, cpa: 16.09, channels: { google: 12, meta: 8, yandex: 72 } },
  { country: "France", code: "FR", spend: 12400, revenue: 52800, conversions: 880, clicks: 18200, impressions: 540000, roas: 4.26, cpa: 14.09, channels: { google: 44, meta: 46, yandex: 0 } },
  { country: "Canada", code: "CA", spend: 9800, revenue: 38400, conversions: 620, clicks: 14200, impressions: 420000, roas: 3.92, cpa: 15.81, channels: { google: 50, meta: 42, yandex: 0 } },
  { country: "Australia", code: "AU", spend: 8200, revenue: 34800, conversions: 480, clicks: 11800, impressions: 380000, roas: 4.24, cpa: 17.08, channels: { google: 46, meta: 44, yandex: 0 } },
  { country: "Brazil", code: "BR", spend: 6800, revenue: 22400, conversions: 380, clicks: 9800, impressions: 320000, roas: 3.29, cpa: 17.89, channels: { google: 38, meta: 54, yandex: 0 } },
  { country: "Japan", code: "JP", spend: 7400, revenue: 28200, conversions: 420, clicks: 10200, impressions: 340000, roas: 3.81, cpa: 17.62, channels: { google: 55, meta: 35, yandex: 0 } },
  { country: "India", code: "IN", spend: 4200, revenue: 12800, conversions: 280, clicks: 8400, impressions: 280000, roas: 3.05, cpa: 15.0, channels: { google: 42, meta: 50, yandex: 0 } },
  { country: "Turkey", code: "TR", spend: 3800, revenue: 11200, conversions: 220, clicks: 6200, impressions: 210000, roas: 2.95, cpa: 17.27, channels: { google: 40, meta: 35, yandex: 18 } },
  { country: "Kazakhstan", code: "KZ", spend: 2800, revenue: 8400, conversions: 160, clicks: 4200, impressions: 140000, roas: 3.0, cpa: 17.5, channels: { google: 20, meta: 15, yandex: 58 } },
];

export const geoAnomalies: GeoAnomaly[] = [
  { id: "a1", country: "Germany", type: "spike", metric: "ROAS", message: "ROAS surged +34% vs prior period — investigate scaling budget", change: 34 },
  { id: "a2", country: "Russia", type: "drop", metric: "CTR", message: "CTR dropped −18% — creative fatigue likely on Yandex YAN", change: -18 },
  { id: "a3", country: "Brazil", type: "opportunity", metric: "CPA", message: "CPA 22% below target — room to increase spend profitably", change: -22 },
  { id: "a4", country: "India", type: "spike", metric: "Conversions", message: "Conversion volume up +42% after Meta lookalike expansion", change: 42 },
  { id: "a5", country: "United Kingdom", type: "drop", metric: "Impressions", message: "Impression share declining — competitor bidding aggressively", change: -15 },
];

export const regionTrends = (() => {
  const regions = ["North America", "Europe", "CIS", "APAC", "LATAM"];
  const days: { date: string; [region: string]: number | string }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const noise = () => 0.85 + Math.random() * 0.3;
    days.push({
      date: d.toISOString().split("T")[0],
      "North America": Math.round(1800 * noise()),
      "Europe": Math.round(1400 * noise()),
      "CIS": Math.round(600 * noise()),
      "APAC": Math.round(520 * noise()),
      "LATAM": Math.round(240 * noise()),
    });
  }
  return { regions, days };
})();

// Organic / Google Search Console mock data

export interface OrganicOverviewKPI {
  label: string;
  value: number;
  change: number;
  format: "number" | "percent" | "seconds";
}

export const organicOverviewKPIs: OrganicOverviewKPI[] = [
  { label: "Total Clicks", value: 42_830, change: 8.4, format: "number" },
  { label: "Total Impressions", value: 1_284_000, change: 12.1, format: "number" },
  { label: "Avg CTR", value: 3.34, change: -0.6, format: "percent" },
  { label: "Avg Position", value: 14.2, change: -1.8, format: "number" },
];

export interface OrganicTrendPoint {
  date: string;
  clicks: number;
  impressions: number;
}

const generateTrend = (): OrganicTrendPoint[] => {
  const points: OrganicTrendPoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const noise = () => 0.85 + Math.random() * 0.3;
    points.push({
      date: d.toISOString().split("T")[0],
      clicks: Math.round(1400 * noise()),
      impressions: Math.round(42000 * noise()),
    });
  }
  return points;
};
export const organicTrend = generateTrend();

export interface PageRow {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export const topPages: PageRow[] = [
  { url: "/products/electronics", clicks: 4820, impressions: 98000, ctr: 4.92, position: 3.2 },
  { url: "/blog/best-laptops-2025", clicks: 3940, impressions: 124000, ctr: 3.18, position: 5.1 },
  { url: "/", clicks: 3680, impressions: 86000, ctr: 4.28, position: 2.4 },
  { url: "/products/fashion", clicks: 2910, impressions: 72000, ctr: 4.04, position: 4.8 },
  { url: "/blog/summer-trends", clicks: 2340, impressions: 68000, ctr: 3.44, position: 6.3 },
  { url: "/products/home-garden", clicks: 2180, impressions: 54000, ctr: 4.04, position: 5.7 },
  { url: "/deals", clicks: 1960, impressions: 48000, ctr: 4.08, position: 3.9 },
  { url: "/blog/tech-reviews", clicks: 1740, impressions: 62000, ctr: 2.81, position: 8.2 },
  { url: "/about", clicks: 1220, impressions: 32000, ctr: 3.81, position: 4.1 },
  { url: "/contact", clicks: 890, impressions: 21000, ctr: 4.24, position: 2.8 },
  { url: "/blog/seo-guide", clicks: 1580, impressions: 44000, ctr: 3.59, position: 7.4 },
  { url: "/products/accessories", clicks: 1340, impressions: 38000, ctr: 3.53, position: 6.1 },
];

export interface KeywordRow {
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  trend: "up" | "down" | "stable";
}

export const topKeywords: KeywordRow[] = [
  { keyword: "best laptops 2025", clicks: 3200, impressions: 82000, ctr: 3.9, position: 3.4, trend: "up" },
  { keyword: "electronics store online", clicks: 2840, impressions: 64000, ctr: 4.44, position: 2.8, trend: "up" },
  { keyword: "summer fashion trends", clicks: 2100, impressions: 58000, ctr: 3.62, position: 5.2, trend: "stable" },
  { keyword: "home garden furniture", clicks: 1780, impressions: 42000, ctr: 4.24, position: 4.1, trend: "up" },
  { keyword: "tech reviews 2025", clicks: 1540, impressions: 48000, ctr: 3.21, position: 6.8, trend: "down" },
  { keyword: "buy laptop cheap", clicks: 1320, impressions: 38000, ctr: 3.47, position: 7.2, trend: "stable" },
  { keyword: "wireless headphones best", clicks: 1180, impressions: 34000, ctr: 3.47, position: 5.9, trend: "up" },
  { keyword: "online deals today", clicks: 1060, impressions: 28000, ctr: 3.79, position: 4.6, trend: "down" },
  { keyword: "seo guide beginners", clicks: 980, impressions: 32000, ctr: 3.06, position: 8.4, trend: "up" },
  { keyword: "smart home devices", clicks: 860, impressions: 26000, ctr: 3.31, position: 6.2, trend: "stable" },
  { keyword: "fashion accessories women", clicks: 740, impressions: 22000, ctr: 3.36, position: 7.8, trend: "down" },
  { keyword: "kitchen appliances sale", clicks: 620, impressions: 18000, ctr: 3.44, position: 9.1, trend: "stable" },
];

export interface CoreWebVital {
  metric: string;
  abbr: string;
  value: number;
  unit: string;
  rating: "good" | "needs-improvement" | "poor";
  threshold: { good: number; poor: number };
  description: string;
}

export const coreWebVitals: CoreWebVital[] = [
  {
    metric: "Largest Contentful Paint",
    abbr: "LCP",
    value: 2.1,
    unit: "s",
    rating: "good",
    threshold: { good: 2.5, poor: 4.0 },
    description: "Measures loading performance. Should occur within 2.5s.",
  },
  {
    metric: "Interaction to Next Paint",
    abbr: "INP",
    value: 180,
    unit: "ms",
    rating: "needs-improvement",
    threshold: { good: 200, poor: 500 },
    description: "Measures interactivity responsiveness. Should be under 200ms.",
  },
  {
    metric: "Cumulative Layout Shift",
    abbr: "CLS",
    value: 0.08,
    unit: "",
    rating: "good",
    threshold: { good: 0.1, poor: 0.25 },
    description: "Measures visual stability. Should be under 0.1.",
  },
  {
    metric: "First Contentful Paint",
    abbr: "FCP",
    value: 1.4,
    unit: "s",
    rating: "good",
    threshold: { good: 1.8, poor: 3.0 },
    description: "Measures when first content appears. Should be under 1.8s.",
  },
  {
    metric: "Time to First Byte",
    abbr: "TTFB",
    value: 620,
    unit: "ms",
    rating: "needs-improvement",
    threshold: { good: 800, poor: 1800 },
    description: "Measures server response time. Should be under 800ms.",
  },
];

export interface CWVHistoryPoint {
  date: string;
  lcp: number;
  inp: number;
  cls: number;
}

const generateCWVHistory = (): CWVHistoryPoint[] => {
  const points: CWVHistoryPoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    points.push({
      date: d.toISOString().split("T")[0],
      lcp: +(2.0 + Math.random() * 0.8).toFixed(2),
      inp: Math.round(150 + Math.random() * 100),
      cls: +(0.04 + Math.random() * 0.1).toFixed(3),
    });
  }
  return points;
};
export const cwvHistory = generateCWVHistory();

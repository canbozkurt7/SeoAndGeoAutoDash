import { dailyData } from "./mockData";

const last30 = dailyData.slice(-30);
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

// --- KPIs ---
export const yandexKPIs = {
  spendRub: sum(last30.map((d) => (d.yandex.spend ?? 0))) * 92,
  clicks: sum(last30.map((d) => d.yandex.clicks)),
  cpcRub: Math.round((sum(last30.map((d) => (d.yandex.spend ?? 0))) * 92) / sum(last30.map((d) => d.yandex.clicks))),
  conversions: sum(last30.map((d) => d.yandex.conversions)),
};

// --- Currency rates ---
export const currencyRates: Record<string, number> = {
  RUB: 1,
  USD: 1 / 92,
  EUR: 1 / 100,
};

// --- Region Performance ---
export interface RegionData {
  region: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
}

export const regionPerformance: RegionData[] = [
  { region: "Moscow", impressions: 320000, clicks: 8200, ctr: 2.56, cpc: 142, conversions: 280 },
  { region: "Saint Petersburg", impressions: 180000, clicks: 4800, ctr: 2.67, cpc: 156, conversions: 160 },
  { region: "Novosibirsk", impressions: 82000, clicks: 2200, ctr: 2.68, cpc: 128, conversions: 72 },
  { region: "Yekaterinburg", impressions: 68000, clicks: 1800, ctr: 2.65, cpc: 134, conversions: 58 },
  { region: "Kazan", impressions: 54000, clicks: 1400, ctr: 2.59, cpc: 148, conversions: 44 },
  { region: "Nizhny Novgorod", impressions: 42000, clicks: 1100, ctr: 2.62, cpc: 138, conversions: 36 },
  { region: "Samara", impressions: 36000, clicks: 920, ctr: 2.56, cpc: 152, conversions: 28 },
  { region: "Rostov-on-Don", impressions: 32000, clicks: 840, ctr: 2.63, cpc: 144, conversions: 24 },
  { region: "Krasnodar", impressions: 28000, clicks: 720, ctr: 2.57, cpc: 158, conversions: 22 },
  { region: "Voronezh", impressions: 22000, clicks: 580, ctr: 2.64, cpc: 136, conversions: 18 },
];

// --- Heatmap (7 days × 24 hours) ---
export const clickHeatmap: number[][] = Array.from({ length: 7 }, () =>
  Array.from({ length: 24 }, (_, h) => {
    const base = h >= 9 && h <= 21 ? 80 : 20;
    const peak = h >= 11 && h <= 14 ? 40 : 0;
    return Math.round((base + peak) * (0.7 + Math.random() * 0.6));
  })
);

export const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// --- Daily chart ---
export const yandexDailyChart = dailyData.map((d) => ({
  date: d.date,
  clicks: d.yandex.clicks,
  cpc: d.yandex.clicks > 0 ? Math.round(((d.yandex.spend ?? 0) * 92) / d.yandex.clicks) : 0,
  spend: (d.yandex.spend ?? 0) * 92,
  conversions: d.yandex.conversions,
}));

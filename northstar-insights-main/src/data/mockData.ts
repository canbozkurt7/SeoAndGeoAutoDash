// Generate 90 days of daily data
const generateDailyData = () => {
  const days: DailyData[] = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const seasonality = 1 + 0.15 * Math.sin((i / 90) * Math.PI * 2);
    const weekendFactor = isWeekend ? 0.75 : 1;
    const noise = () => 0.85 + Math.random() * 0.3;

    days.push({
      date: dateStr,
      google: {
        spend: Math.round(480 * seasonality * weekendFactor * noise()),
        revenue: Math.round(3800 * seasonality * weekendFactor * noise()),
        clicks: Math.round(920 * seasonality * weekendFactor * noise()),
        impressions: Math.round(28000 * seasonality * weekendFactor * noise()),
        conversions: Math.round(22 * seasonality * weekendFactor * noise()),
      },
      meta: {
        spend: Math.round(520 * seasonality * weekendFactor * noise()),
        revenue: Math.round(3200 * seasonality * weekendFactor * noise()),
        clicks: Math.round(780 * seasonality * weekendFactor * noise()),
        impressions: Math.round(42000 * seasonality * weekendFactor * noise()),
        conversions: Math.round(18 * seasonality * weekendFactor * noise()),
      },
      yandex: {
        spend: Math.round(280 * seasonality * weekendFactor * noise()),
        revenue: Math.round(1600 * seasonality * weekendFactor * noise()),
        clicks: Math.round(420 * seasonality * weekendFactor * noise()),
        impressions: Math.round(15000 * seasonality * weekendFactor * noise()),
        conversions: Math.round(8 * seasonality * weekendFactor * noise()),
      },
      organic: {
        sessions: Math.round(480 * seasonality * noise()),
        clicks: Math.round(480 * seasonality * noise()),
        impressions: Math.round(14000 * seasonality * noise()),
        conversions: Math.round(6 * seasonality * noise()),
        revenue: Math.round(800 * seasonality * noise()),
      },
    });
  }
  return days;
};

export interface ChannelDaily {
  spend?: number;
  revenue: number;
  clicks: number;
  impressions: number;
  conversions: number;
  sessions?: number;
}

export interface DailyData {
  date: string;
  google: ChannelDaily;
  meta: ChannelDaily;
  yandex: ChannelDaily;
  organic: ChannelDaily & { sessions: number };
}

export const dailyData = generateDailyData();

// Aggregate KPIs
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const last7 = dailyData.slice(-7);
const prev7 = dailyData.slice(-14, -7);

const totalSpend = (d: DailyData) => (d.google.spend ?? 0) + (d.meta.spend ?? 0) + (d.yandex.spend ?? 0);
const totalRevenue = (d: DailyData) => d.google.revenue + d.meta.revenue + d.yandex.revenue + d.organic.revenue;
const totalConversions = (d: DailyData) => d.google.conversions + d.meta.conversions + d.yandex.conversions + d.organic.conversions;
const paidSessions = (d: DailyData) => d.google.clicks + d.meta.clicks + d.yandex.clicks;

const calcChange = (current: number, previous: number) =>
  previous === 0 ? 0 : Math.round(((current - previous) / previous) * 1000) / 10;

export const blendedKPIs = {
  totalSpend: {
    value: sum(last7.map(totalSpend)),
    change: calcChange(sum(last7.map(totalSpend)), sum(prev7.map(totalSpend))),
    sparkline: last7.map(totalSpend),
  },
  totalRevenue: {
    value: sum(last7.map(totalRevenue)),
    change: calcChange(sum(last7.map(totalRevenue)), sum(prev7.map(totalRevenue))),
    sparkline: last7.map(totalRevenue),
  },
  blendedROAS: {
    value: Math.round((sum(last7.map(totalRevenue)) / sum(last7.map(totalSpend))) * 100) / 100,
    change: calcChange(
      sum(last7.map(totalRevenue)) / sum(last7.map(totalSpend)),
      sum(prev7.map(totalRevenue)) / sum(prev7.map(totalSpend))
    ),
    sparkline: last7.map((d) => {
      const s = totalSpend(d);
      return s > 0 ? Math.round((totalRevenue(d) / s) * 100) / 100 : 0;
    }),
  },
  totalConversions: {
    value: sum(last7.map(totalConversions)),
    change: calcChange(sum(last7.map(totalConversions)), sum(prev7.map(totalConversions))),
    sparkline: last7.map(totalConversions),
  },
  paidSessions: {
    value: sum(last7.map(paidSessions)),
    change: calcChange(sum(last7.map(paidSessions)), sum(prev7.map(paidSessions))),
    sparkline: last7.map(paidSessions),
  },
  organicSessions: {
    value: sum(last7.map((d) => d.organic.sessions)),
    change: calcChange(
      sum(last7.map((d) => d.organic.sessions)),
      sum(prev7.map((d) => d.organic.sessions))
    ),
    sparkline: last7.map((d) => d.organic.sessions),
  },
};

export const channelMix = {
  google: sum(dailyData.slice(-30).map((d) => d.google.spend ?? 0)),
  meta: sum(dailyData.slice(-30).map((d) => d.meta.spend ?? 0)),
  yandex: sum(dailyData.slice(-30).map((d) => d.yandex.spend ?? 0)),
};

type CampaignStatus = "Active" | "Paused";
type Platform = "google" | "meta" | "yandex";

export interface Campaign {
  id: string;
  platform: Platform;
  name: string;
  status: CampaignStatus;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

const mkCampaign = (
  id: string,
  platform: Platform,
  name: string,
  status: CampaignStatus,
  spend: number,
  impressions: number,
  clicks: number,
  conversions: number,
  revenue: number
): Campaign => ({ id, platform, name, status, spend, impressions, clicks, conversions, revenue });

export const campaigns: Campaign[] = [
  mkCampaign("g1", "google", "Brand Search — US", "Active", 8200, 420000, 18400, 520, 48000),
  mkCampaign("g2", "google", "Shopping — Electronics", "Active", 12400, 680000, 24200, 380, 62000),
  mkCampaign("g3", "google", "Performance Max — Q1", "Active", 9800, 520000, 15800, 440, 38000),
  mkCampaign("g4", "google", "Search — Competitors", "Active", 6200, 280000, 9800, 210, 18200),
  mkCampaign("g5", "google", "Display — Remarketing", "Paused", 4800, 1200000, 8400, 180, 14800),
  mkCampaign("g6", "google", "Search — Generic", "Active", 3600, 180000, 6200, 150, 12400),
  mkCampaign("g7", "google", "Shopping — Fashion", "Active", 2200, 120000, 4200, 140, 9800),
  mkCampaign("g8", "google", "Video — YouTube", "Paused", 1000, 340000, 2800, 120, 5200),
  mkCampaign("m1", "meta", "Prospecting — Lookalike", "Active", 14200, 1800000, 22400, 380, 52000),
  mkCampaign("m2", "meta", "Retargeting — Website Visitors", "Active", 11800, 920000, 16800, 420, 48000),
  mkCampaign("m3", "meta", "Conversion — Catalog Sales", "Active", 10200, 1400000, 19200, 340, 38400),
  mkCampaign("m4", "meta", "Awareness — Brand Video", "Active", 8400, 2800000, 8200, 120, 12000),
  mkCampaign("m5", "meta", "Retargeting — Cart Abandoners", "Active", 4800, 480000, 8800, 280, 32000),
  mkCampaign("m6", "meta", "Conversion — Lead Gen", "Paused", 3000, 620000, 5400, 90, 8000),
  mkCampaign("y1", "yandex", "Search — Brand RU", "Active", 6800, 320000, 8200, 280, 22000),
  mkCampaign("y2", "yandex", "YAN — Display Network", "Active", 4200, 890000, 4800, 160, 12800),
  mkCampaign("y3", "yandex", "Search — Product Categories", "Active", 3800, 240000, 3600, 140, 10200),
  mkCampaign("y4", "yandex", "Retargeting — RU", "Paused", 2200, 180000, 1600, 100, 6400),
];

export const getCTR = (clicks: number, impressions: number) =>
  impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0;

export const getCPC = (spend: number, clicks: number) =>
  clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0;

export const getConvRate = (conversions: number, clicks: number) =>
  clicks > 0 ? Math.round((conversions / clicks) * 10000) / 100 : 0;

export const getROAS = (revenue: number, spend: number) =>
  spend > 0 ? Math.round((revenue / spend) * 100) / 100 : 0;

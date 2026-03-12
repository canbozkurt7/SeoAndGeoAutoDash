export interface ReportSummary {
  title: string;
  description: string;
  lastGenerated: string;
  metrics: { label: string; value: string; change: number }[];
}

export const reportSummaries: ReportSummary[] = [
  {
    title: "Weekly Performance",
    description: "Cross-channel spend, revenue, and efficiency metrics for the last 7 days.",
    lastGenerated: "2026-03-11",
    metrics: [
      { label: "Total Spend", value: "$38.2K", change: 4.2 },
      { label: "Revenue", value: "$164.8K", change: 8.1 },
      { label: "Blended ROAS", value: "4.31x", change: 3.8 },
      { label: "Conversions", value: "1,842", change: 5.4 },
    ],
  },
  {
    title: "Channel Comparison",
    description: "Side-by-side performance of Google, Meta, Yandex, and Organic channels.",
    lastGenerated: "2026-03-10",
    metrics: [
      { label: "Google ROAS", value: "4.82x", change: 2.1 },
      { label: "Meta ROAS", value: "3.94x", change: -1.2 },
      { label: "Yandex ROAS", value: "3.26x", change: 6.8 },
      { label: "Organic Conv.", value: "284", change: 12.4 },
    ],
  },
  {
    title: "Geo Performance",
    description: "Top-performing regions with spend allocation and CPA trends.",
    lastGenerated: "2026-03-09",
    metrics: [
      { label: "Top Region", value: "US — $42.8K", change: 0 },
      { label: "Best ROAS", value: "US — 4.63x", change: 5.2 },
      { label: "Lowest CPA", value: "UK — $14.18", change: -3.1 },
      { label: "Active Countries", value: "12", change: 0 },
    ],
  },
  {
    title: "Creative Analysis",
    description: "Top creatives by CTR, conversion rate, and hook rate across Meta and Google.",
    lastGenerated: "2026-03-08",
    metrics: [
      { label: "Top CTR", value: "Video — 3.8%", change: 12.4 },
      { label: "Best Conv. Rate", value: "Carousel — 4.2%", change: 8.1 },
      { label: "Avg Hook Rate", value: "42%", change: -2.3 },
      { label: "Creatives Tested", value: "48", change: 0 },
    ],
  },
];

export interface ScheduledReport {
  id: string;
  name: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  recipients: string;
  nextRun: string;
  status: "Active" | "Paused";
}

export const scheduledReports: ScheduledReport[] = [
  { id: "r1", name: "Daily Spend Alert", frequency: "Daily", recipients: "team@company.com", nextRun: "2026-03-13 08:00", status: "Active" },
  { id: "r2", name: "Weekly Performance Digest", frequency: "Weekly", recipients: "cmo@company.com", nextRun: "2026-03-16 09:00", status: "Active" },
  { id: "r3", name: "Monthly Executive Summary", frequency: "Monthly", recipients: "exec@company.com", nextRun: "2026-04-01 08:00", status: "Active" },
  { id: "r4", name: "Geo Anomaly Report", frequency: "Weekly", recipients: "geo-team@company.com", nextRun: "2026-03-16 10:00", status: "Paused" },
];

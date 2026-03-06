export type AppRole = "owner" | "editor";

export type LlmEngine = "chatgpt" | "perplexity" | "gemini";

export interface SeoSnapshotInput {
  site_id: string;
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avg_position: number;
  sessions: number;
  conversions: number;
}

export interface GeoObservationInput {
  site_id: string;
  prompt_id: string;
  engine: LlmEngine;
  cited_domains: string[];
  mention_domains: string[];
  response_id: string;
  run_at: string;
}

export interface DailyScoreOutput {
  site_id: string;
  date: string;
  seo_score: number;
  geo_citation_score: number;
  seo_delta: number;
  geo_delta: number;
  alert_flags: string[];
}

export interface PipelineRunResult {
  siteId: string;
  runDate: string;
  score: DailyScoreOutput;
  failedEngines: LlmEngine[];
  logs: string[];
}

export interface AlertConfig {
  seo_drop_threshold: number;
  geo_drop_threshold: number;
  spike_threshold: number;
}

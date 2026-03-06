import { createServiceSupabase } from "@/lib/supabase/server";
import type {
  AlertConfig,
  DailyScoreOutput,
  GeoObservationInput,
  LlmEngine,
  SeoSnapshotInput
} from "@/lib/types";

export interface SiteConfig {
  id: string;
  domain: string;
  url: string;
}

export interface IntegrationAccount {
  provider: "google";
  access_token: string;
  refresh_token: string;
  expires_at?: string;
}

export interface PromptRecord {
  id: string;
  prompt_text: string;
}

export class PipelineRepository {
  private readonly supabase = createServiceSupabase();

  async getSite(siteId: string): Promise<SiteConfig> {
    const { data, error } = await this.supabase
      .from("site")
      .select("id,domain,url")
      .eq("id", siteId)
      .single();
    if (error || !data) {
      throw new Error(`Site not found: ${siteId}`);
    }
    return data;
  }

  async getAlertConfig(siteId: string): Promise<AlertConfig> {
    const { data } = await this.supabase
      .from("site")
      .select("seo_drop_threshold,geo_drop_threshold,spike_threshold")
      .eq("id", siteId)
      .single();
    return {
      seo_drop_threshold: data?.seo_drop_threshold ?? 8,
      geo_drop_threshold: data?.geo_drop_threshold ?? 10,
      spike_threshold: data?.spike_threshold ?? 12
    };
  }

  async getGoogleIntegration(siteId: string): Promise<IntegrationAccount> {
    const { data, error } = await this.supabase
      .from("integration_account")
      .select("provider,access_token,refresh_token,expires_at")
      .eq("site_id", siteId)
      .eq("provider", "google")
      .single();
    if (error || !data) {
      throw new Error("Google integration missing");
    }
    return data as IntegrationAccount;
  }

  async updateGoogleToken(siteId: string, accessToken: string, expiresAt: string) {
    await this.supabase
      .from("integration_account")
      .update({ access_token: accessToken, expires_at: expiresAt })
      .eq("site_id", siteId)
      .eq("provider", "google");
  }

  async getActivePrompts(siteId: string): Promise<PromptRecord[]> {
    const { data } = await this.supabase
      .from("tracked_prompt")
      .select("id,prompt_text")
      .eq("site_id", siteId)
      .eq("is_active", true);
    return (data ?? []) as PromptRecord[];
  }

  async saveSeoSnapshot(input: SeoSnapshotInput) {
    await this.supabase.from("seo_snapshot_daily").upsert(input, {
      onConflict: "site_id,date"
    });
  }

  async saveObservation(input: GeoObservationInput) {
    await this.supabase.from("geo_observation").insert(input);
  }

  async saveGeoScore(input: DailyScoreOutput) {
    await this.supabase.from("geo_score_daily").upsert(input, {
      onConflict: "site_id,date"
    });
  }

  async createPromptBatch(siteId: string, runDate: string) {
    const { data, error } = await this.supabase
      .from("prompt_batch")
      .insert({
        site_id: siteId,
        run_date: runDate,
        status: "running"
      })
      .select("id")
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? "Unable to create prompt batch");
    }
    return data.id as string;
  }

  async finalizePromptBatch(batchId: string, status: string) {
    await this.supabase
      .from("prompt_batch")
      .update({ status })
      .eq("id", batchId);
  }

  async getPreviousScore(siteId: string, date: string) {
    const { data } = await this.supabase
      .from("geo_score_daily")
      .select("seo_score,geo_citation_score")
      .eq("site_id", siteId)
      .lt("date", date)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ?? undefined;
  }

  async logRun(args: {
    siteId: string;
    runDate: string;
    status: "success" | "partial_failure" | "failed";
    failedEngines: LlmEngine[];
    message: string;
  }) {
    await this.supabase.from("pipeline_run_log").insert({
      site_id: args.siteId,
      run_date: args.runDate,
      status: args.status,
      failed_engines: args.failedEngines,
      message: args.message
    });
  }

  async createAlertEvents(args: {
    siteId: string;
    runDate: string;
    flags: string[];
  }) {
    if (!args.flags.length) {
      return;
    }
    await this.supabase.from("alert_event").insert(
      args.flags.map((flag) => ({
        site_id: args.siteId,
        event_date: args.runDate,
        event_type: flag,
        severity:
          flag === "positive_spike" ? "info" : flag.includes("drop") ? "high" : "medium",
        status: "open"
      }))
    );
  }
}

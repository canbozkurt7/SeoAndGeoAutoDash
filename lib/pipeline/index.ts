import { googleProvider, type GoogleProvider } from "@/lib/providers/google";
import { llmProvider, type LlmProvider } from "@/lib/providers/llm";
import { sendCriticalAlerts, sendDailyDigest } from "@/lib/alerts";
import { PipelineRepository } from "@/lib/pipeline/repository";
import { computeDailyScore } from "@/lib/pipeline/scoring";
import type {
  GeoObservationInput,
  LlmEngine,
  PipelineRunResult,
  SeoSnapshotInput
} from "@/lib/types";

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 400,
  sleep: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms))
): Promise<T> {
  let attempt = 0;
  let error: unknown;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      error = err;
      if (attempt === retries) {
        break;
      }
      await sleep(delayMs * (attempt + 1));
      attempt += 1;
    }
  }
  throw error;
}

type PipelineDeps = {
  repo: Pick<
    PipelineRepository,
    | "getSite"
    | "getAlertConfig"
    | "getGoogleIntegration"
    | "updateGoogleToken"
    | "saveSeoSnapshot"
    | "getActivePrompts"
    | "saveObservation"
    | "getPreviousScore"
    | "saveGeoScore"
    | "createPromptBatch"
    | "finalizePromptBatch"
    | "createAlertEvents"
    | "logRun"
  >;
  google: GoogleProvider;
  llm: LlmProvider;
  sendDailyDigestFn: typeof sendDailyDigest;
  sendCriticalAlertsFn: typeof sendCriticalAlerts;
  sleep: (ms: number) => Promise<void>;
};

function defaultDeps(): PipelineDeps {
  return {
    repo: new PipelineRepository(),
    google: googleProvider,
    llm: llmProvider,
    sendDailyDigestFn: sendDailyDigest,
    sendCriticalAlertsFn: sendCriticalAlerts,
    sleep: async (ms: number) => {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  };
}

export async function runDailyPipelineWithDeps(
  siteId: string,
  runDate: string,
  deps: PipelineDeps
): Promise<PipelineRunResult> {
  const repo = deps.repo;
  const logs: string[] = [];
  const failedEngines: LlmEngine[] = [];

  const site = await repo.getSite(siteId);
  const batchId = await repo.createPromptBatch(siteId, runDate);
  try {
    const alertConfig = await repo.getAlertConfig(siteId);
    const integration = await repo.getGoogleIntegration(siteId);

    const refreshed = await withRetry(() =>
      deps.google.refreshToken({
        access_token: integration.access_token,
        refresh_token: integration.refresh_token,
        expires_at: integration.expires_at
      }),
      2,
      400,
      deps.sleep
    );
    await repo.updateGoogleToken(siteId, refreshed.access_token, refreshed.expires_at!);

    const metrics = await withRetry(() =>
      deps.google.fetchDailyMetrics({
        siteUrl: site.url,
        date: runDate,
        token: refreshed
      }),
      2,
      400,
      deps.sleep
    );

    const seoSnapshot: SeoSnapshotInput = {
      site_id: siteId,
      ...metrics
    };
    await repo.saveSeoSnapshot(seoSnapshot);
    logs.push("seo_snapshot_saved");

    const prompts = await repo.getActivePrompts(siteId);
    const observations: GeoObservationInput[] = [];
    const engines: LlmEngine[] = ["chatgpt", "perplexity", "gemini"];

    for (const prompt of prompts) {
      for (const engine of engines) {
        try {
          const response = await withRetry(() =>
            deps.llm.runPrompt(engine, prompt.prompt_text),
            2,
            400,
            deps.sleep
          );
          const observation: GeoObservationInput = {
            site_id: siteId,
            prompt_id: prompt.id,
            engine,
            cited_domains: response.citedDomains,
            mention_domains: response.mentionedDomains,
            response_id: response.id,
            run_at: new Date().toISOString()
          };
          observations.push(observation);
          await repo.saveObservation(observation);
        } catch {
          if (!failedEngines.includes(engine)) {
            failedEngines.push(engine);
          }
          logs.push(`engine_failed:${engine}:prompt:${prompt.id}`);
        }
      }
    }

    const previous = await repo.getPreviousScore(siteId, runDate);
    const score = computeDailyScore({
      siteId,
      date: runDate,
      snapshot: seoSnapshot,
      observations,
      siteDomain: site.domain,
      previous,
      alertConfig
    });

    await repo.saveGeoScore(score);
    await repo.createAlertEvents({
      siteId,
      runDate,
      flags: score.alert_flags
    });
    await deps.sendDailyDigestFn(siteId, runDate);
    await deps.sendCriticalAlertsFn(siteId, runDate);

    const status = failedEngines.length
      ? failedEngines.length === engines.length
        ? "failed"
        : "partial_failure"
      : "success";

    await repo.logRun({
      siteId,
      runDate,
      status,
      failedEngines,
      message: logs.join(" | ") || "run_completed"
    });
    await repo.finalizePromptBatch(batchId, status);

    return {
      siteId,
      runDate,
      score,
      failedEngines,
      logs
    };
  } catch (error) {
    await repo.logRun({
      siteId,
      runDate,
      status: "failed",
      failedEngines: ["chatgpt", "perplexity", "gemini"],
      message: String(error)
    });
    await repo.finalizePromptBatch(batchId, "failed");
    throw error;
  }
}

export async function runDailyPipeline(
  siteId: string,
  runDate: string
): Promise<PipelineRunResult> {
  return runDailyPipelineWithDeps(siteId, runDate, defaultDeps());
}

export async function run_daily_pipeline(siteId: string, runDate: string) {
  return runDailyPipeline(siteId, runDate);
}

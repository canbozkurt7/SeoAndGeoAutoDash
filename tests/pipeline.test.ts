import { describe, expect, it, vi } from "vitest";
import { runDailyPipelineWithDeps } from "@/lib/pipeline";
import type { LlmEngine } from "@/lib/types";

function buildRepoMock() {
  const saveObservation = vi.fn(async () => undefined);
  const createAlertEvents = vi.fn(async () => undefined);

  return {
    repo: {
      getSite: vi.fn(async () => ({
        id: "00000000-0000-0000-0000-000000000001",
        domain: "example.com",
        url: "https://example.com"
      })),
      getAlertConfig: vi.fn(async () => ({
        seo_drop_threshold: 8,
        geo_drop_threshold: 10,
        spike_threshold: 12
      })),
      getGoogleIntegration: vi.fn(async () => ({
        provider: "google",
        access_token: "at",
        refresh_token: "rt",
        expires_at: "2026-03-05T00:00:00Z"
      })),
      updateGoogleToken: vi.fn(async () => undefined),
      saveSeoSnapshot: vi.fn(async () => undefined),
      getActivePrompts: vi.fn(async () => [
        { id: "11111111-1111-1111-1111-111111111111", prompt_text: "Best SEO tools?" }
      ]),
      saveObservation,
      getPreviousScore: vi.fn(async () => ({
        seo_score: 80,
        geo_citation_score: 90
      })),
      saveGeoScore: vi.fn(async () => undefined),
      createPromptBatch: vi.fn(async () => "batch-1"),
      finalizePromptBatch: vi.fn(async () => undefined),
      createAlertEvents,
      logRun: vi.fn(async () => undefined)
    },
    saveObservation,
    createAlertEvents
  };
}

describe("pipeline", () => {
  it("keeps successful engines when one engine fails", async () => {
    const { repo, saveObservation, createAlertEvents } = buildRepoMock();
    const llmFailure = new Error("rate-limit");
    const llm = {
      runPrompt: vi.fn(async (engine: LlmEngine) => {
        if (engine === "gemini") {
          throw llmFailure;
        }
        return {
          id: `id-${engine}`,
          content: "ok",
          citedDomains: ["example.com"],
          mentionedDomains: ["example.com", "other.com"]
        };
      })
    };

    const result = await runDailyPipelineWithDeps(
      "00000000-0000-0000-0000-000000000001",
      "2026-03-05",
      {
        repo,
        google: {
          refreshToken: vi.fn(async (bundle) => ({
            ...bundle,
            access_token: "new-at",
            expires_at: "2026-03-06T00:00:00Z"
          })),
          fetchDailyMetrics: vi.fn(async ({ date }) => ({
            date,
            clicks: 100,
            impressions: 1000,
            ctr: 0.1,
            avg_position: 5,
            sessions: 200,
            conversions: 20
          }))
        },
        llm,
        sendDailyDigestFn: vi.fn(async () => undefined),
        sendCriticalAlertsFn: vi.fn(async () => undefined),
        sleep: vi.fn(async () => undefined)
      }
    );

    expect(result.failedEngines).toContain("gemini");
    expect(saveObservation).toHaveBeenCalledTimes(2);
    expect(createAlertEvents).toHaveBeenCalledTimes(1);
  });

  it("logs failed run when all engines fail", async () => {
    const { repo } = buildRepoMock();
    const result = await runDailyPipelineWithDeps(
      "00000000-0000-0000-0000-000000000001",
      "2026-03-05",
      {
        repo,
        google: {
          refreshToken: vi.fn(async (bundle) => ({
            ...bundle,
            access_token: "new-at",
            expires_at: "2026-03-06T00:00:00Z"
          })),
          fetchDailyMetrics: vi.fn(async ({ date }) => ({
            date,
            clicks: 100,
            impressions: 1000,
            ctr: 0.1,
            avg_position: 5,
            sessions: 200,
            conversions: 20
          }))
        },
        llm: {
          runPrompt: vi.fn(async () => {
            throw new Error("provider unavailable");
          })
        },
        sendDailyDigestFn: vi.fn(async () => undefined),
        sendCriticalAlertsFn: vi.fn(async () => undefined),
        sleep: vi.fn(async () => undefined)
      }
    );

    expect(result.failedEngines).toEqual(["chatgpt", "perplexity", "gemini"]);
  });
});

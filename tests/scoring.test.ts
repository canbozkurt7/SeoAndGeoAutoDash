import { describe, expect, it } from "vitest";
import { computeDailyScore, computeGeoCitationScore } from "@/lib/pipeline/scoring";

describe("scoring", () => {
  it("computes deterministic geo citation score", () => {
    const score = computeGeoCitationScore(
      [
        {
          site_id: "s",
          prompt_id: "p1",
          engine: "chatgpt",
          cited_domains: ["example.com"],
          mention_domains: [],
          response_id: "1",
          run_at: "2026-03-05T00:00:00Z"
        },
        {
          site_id: "s",
          prompt_id: "p2",
          engine: "gemini",
          cited_domains: ["other.com"],
          mention_domains: [],
          response_id: "2",
          run_at: "2026-03-05T00:00:00Z"
        }
      ],
      "example.com"
    );
    expect(score).toBe(50);
  });

  it("triggers drop alerts based on thresholds", () => {
    const result = computeDailyScore({
      siteId: "s",
      date: "2026-03-05",
      siteDomain: "example.com",
      snapshot: {
        site_id: "s",
        date: "2026-03-05",
        clicks: 5,
        impressions: 500,
        ctr: 0.01,
        avg_position: 26,
        sessions: 8,
        conversions: 1
      },
      observations: [],
      previous: {
        seo_score: 70,
        geo_citation_score: 80
      },
      alertConfig: {
        seo_drop_threshold: 8,
        geo_drop_threshold: 10,
        spike_threshold: 12
      }
    });

    expect(result.alert_flags).toContain("seo_drop");
    expect(result.alert_flags).toContain("geo_drop");
  });
});

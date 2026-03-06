import { describe, expect, it } from "vitest";
import { GoogleProviderError, googleProvider } from "@/lib/providers/google";

describe("google provider", () => {
  it("throws when refresh token is missing", async () => {
    await expect(
      googleProvider.refreshToken({
        access_token: "a",
        refresh_token: ""
      })
    ).rejects.toBeInstanceOf(GoogleProviderError);
  });

  it("returns a snapshot shape for a date", async () => {
    const metrics = await googleProvider.fetchDailyMetrics({
      siteUrl: "https://example.com",
      date: "2026-03-05",
      token: {
        access_token: "x",
        refresh_token: "y"
      }
    });
    expect(metrics.date).toBe("2026-03-05");
    expect(metrics.clicks).toBeTypeOf("number");
  });
});

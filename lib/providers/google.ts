import type { SeoSnapshotInput } from "@/lib/types";

export interface GoogleTokenBundle {
  access_token: string;
  refresh_token: string;
  expires_at?: string;
}

export interface GoogleProvider {
  refreshToken(bundle: GoogleTokenBundle): Promise<GoogleTokenBundle>;
  fetchDailyMetrics(args: {
    siteUrl: string;
    date: string;
    token: GoogleTokenBundle;
  }): Promise<Omit<SeoSnapshotInput, "site_id">>;
}

export class GoogleProviderError extends Error {}

export const googleProvider: GoogleProvider = {
  async refreshToken(bundle) {
    if (!bundle.refresh_token) {
      throw new GoogleProviderError("Google refresh token missing");
    }

    return {
      ...bundle,
      access_token: `refreshed-${Date.now()}`,
      expires_at: new Date(Date.now() + 3600_000).toISOString()
    };
  },
  async fetchDailyMetrics({ date }) {
    // Placeholder deterministic values for MVP before full Google API wiring.
    return {
      date,
      clicks: 120,
      impressions: 2200,
      ctr: 0.054,
      avg_position: 11.4,
      sessions: 210,
      conversions: 14
    };
  }
};

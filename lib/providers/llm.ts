import type { LlmEngine } from "@/lib/types";

export interface LlmRawResponse {
  id: string;
  content: string;
  citedDomains: string[];
  mentionedDomains: string[];
}

export interface LlmProvider {
  runPrompt(engine: LlmEngine, prompt: string): Promise<LlmRawResponse>;
}

function normalizeDomains(domains: string[]) {
  const cleaned = domains.map((value) =>
    value.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase().trim()
  );
  return Array.from(new Set(cleaned.filter(Boolean)));
}

export function normalizeLlmResponse(raw: LlmRawResponse): LlmRawResponse {
  return {
    ...raw,
    citedDomains: normalizeDomains(raw.citedDomains),
    mentionedDomains: normalizeDomains(raw.mentionedDomains)
  };
}

export class LlmProviderError extends Error {}

export const llmProvider: LlmProvider = {
  async runPrompt(engine, prompt) {
    if (!prompt) {
      throw new LlmProviderError("Prompt is required");
    }
    const sample = {
      chatgpt: ["example.com", "docs.example.com"],
      perplexity: ["example.com", "thirdparty.io"],
      gemini: ["example.com", "competitor.net"]
    } as const;
    const raw: LlmRawResponse = {
      id: `${engine}-${Date.now()}`,
      content: `Synthetic response for: ${prompt}`,
      citedDomains: [...sample[engine]],
      mentionedDomains: [...sample[engine], "news.site"]
    };
    return normalizeLlmResponse(raw);
  }
};

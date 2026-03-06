import { describe, expect, it } from "vitest";
import { normalizeLlmResponse } from "@/lib/providers/llm";

describe("llm provider normalization", () => {
  it("normalizes and deduplicates domains", () => {
    const normalized = normalizeLlmResponse({
      id: "id",
      content: "text",
      citedDomains: ["https://Example.com/docs", "example.com"],
      mentionedDomains: ["HTTP://Other.io/page", "other.io"]
    });

    expect(normalized.citedDomains).toEqual(["example.com"]);
    expect(normalized.mentionedDomains).toEqual(["other.io"]);
  });
});

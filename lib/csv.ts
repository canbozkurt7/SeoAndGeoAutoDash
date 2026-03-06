import { parse } from "csv-parse/sync";

export interface CsvPromptRow {
  query: string;
  intent?: string;
  priority?: number;
}

export function parsePromptCsv(content: string): CsvPromptRow[] {
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Record<string, string>[];

  return rows
    .map((row) => ({
      query: row.query,
      intent: row.intent ?? undefined,
      priority: row.priority ? Number(row.priority) : undefined
    }))
    .filter((row) => row.query && row.query.length > 0);
}

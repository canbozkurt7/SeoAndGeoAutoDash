"use client";

import { useCallback, useMemo, useState } from "react";

export type DatePreset = "7d" | "14d" | "30d" | "90d";

type DateRange = {
  from: Date;
  to: Date;
};

function presetToRange(preset: DatePreset): DateRange {
  const to = new Date();
  const from = new Date();
  const days = preset === "7d" ? 6 : preset === "14d" ? 13 : preset === "30d" ? 29 : 89;
  from.setDate(to.getDate() - days);
  return { from, to };
}

export function useDateRange() {
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [dateRange, setDateRange] = useState<DateRange>(presetToRange("30d"));

  const applyPreset = useCallback((nextPreset: DatePreset) => {
    setPreset(nextPreset);
    setDateRange(presetToRange(nextPreset));
  }, []);

  const applyCustomRange = useCallback((fromText: string, toText: string) => {
    if (!fromText || !toText) return;
    const from = new Date(fromText);
    const to = new Date(toText);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;
    setPreset("30d");
    setDateRange({ from, to });
  }, []);

  const label = useMemo(() => {
    const from = dateRange.from.toLocaleDateString("en-GB");
    const to = dateRange.to.toLocaleDateString("en-GB");
    return `${from} - ${to}`;
  }, [dateRange]);

  return { preset, dateRange, applyPreset, applyCustomRange, label };
}

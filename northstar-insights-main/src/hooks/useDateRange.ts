import { useState, useCallback } from "react";
import { DateRange } from "react-day-picker";
import { subDays, startOfDay } from "date-fns";

export type DatePreset = "today" | "7d" | "14d" | "30d" | "90d" | "custom";

const presetToRange = (preset: DatePreset): DateRange => {
  const today = startOfDay(new Date());
  switch (preset) {
    case "today": return { from: today, to: today };
    case "7d": return { from: subDays(today, 6), to: today };
    case "14d": return { from: subDays(today, 13), to: today };
    case "30d": return { from: subDays(today, 29), to: today };
    case "90d": return { from: subDays(today, 89), to: today };
    default: return { from: subDays(today, 29), to: today };
  }
};

export const useDateRange = () => {
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [dateRange, setDateRange] = useState<DateRange>(presetToRange("30d"));
  const [compareEnabled, setCompareEnabled] = useState(false);

  const handlePreset = useCallback((p: DatePreset) => {
    setPreset(p);
    if (p !== "custom") {
      setDateRange(presetToRange(p));
    }
  }, []);

  const handleCustomRange = useCallback((range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      setPreset("custom");
    }
  }, []);

  const getDays = useCallback((): number => {
    if (dateRange.from && dateRange.to) {
      return Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / 86400000) + 1;
    }
    return 30;
  }, [dateRange]);

  return { preset, setPreset: handlePreset, dateRange, setDateRange: handleCustomRange, compareEnabled, setCompareEnabled, getDays };
};

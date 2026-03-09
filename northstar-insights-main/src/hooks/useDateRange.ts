import { useState, useCallback } from "react";

export type DatePreset = "today" | "7d" | "14d" | "30d" | "90d" | "custom";

export const useDateRange = () => {
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [compareEnabled, setCompareEnabled] = useState(false);

  const getDays = useCallback((): number => {
    switch (preset) {
      case "today": return 1;
      case "7d": return 7;
      case "14d": return 14;
      case "30d": return 30;
      case "90d": return 90;
      default: return 30;
    }
  }, [preset]);

  return { preset, setPreset, compareEnabled, setCompareEnabled, getDays };
};

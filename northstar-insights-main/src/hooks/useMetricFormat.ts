import { useCallback } from "react";

export const useMetricFormat = () => {
  const formatNumber = useCallback((n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  }, []);

  const formatCurrency = useCallback((n: number, currency = "$"): string => {
    if (n >= 1_000_000) return `${currency}${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${currency}${(n / 1_000).toFixed(1)}K`;
    return `${currency}${n.toLocaleString()}`;
  }, []);

  const formatPercent = useCallback((n: number): string => `${n.toFixed(1)}%`, []);

  const formatROAS = useCallback((n: number): string => `${n.toFixed(2)}x`, []);

  return { formatNumber, formatCurrency, formatPercent, formatROAS };
};

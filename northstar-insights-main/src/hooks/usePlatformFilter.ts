import { useState, useCallback } from "react";

export type PlatformKey = "google" | "meta" | "yandex" | "organic";

export const usePlatformFilter = () => {
  const [active, setActive] = useState<PlatformKey[]>(["google", "meta", "yandex", "organic"]);

  const toggle = useCallback((key: PlatformKey) => {
    setActive((prev) =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter((k) => k !== key) : prev) : [...prev, key]
    );
  }, []);

  const isActive = useCallback((key: PlatformKey) => active.includes(key), [active]);

  return { active, toggle, isActive };
};

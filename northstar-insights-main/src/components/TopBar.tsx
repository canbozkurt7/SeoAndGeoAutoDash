import { RefreshCw } from "lucide-react";
import { useDateRange, DatePreset } from "@/hooks/useDateRange";
import { usePlatformFilter, PlatformKey } from "@/hooks/usePlatformFilter";

const presets: { label: string; value: DatePreset }[] = [
  { label: "Today", value: "today" },
  { label: "7D", value: "7d" },
  { label: "14D", value: "14d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
];

const platforms: { label: string; value: PlatformKey; color: string }[] = [
  { label: "Google", value: "google", color: "bg-google/20 text-google border-google/30" },
  { label: "Meta", value: "meta", color: "bg-meta/20 text-meta border-meta/30" },
  { label: "Yandex", value: "yandex", color: "bg-yandex/20 text-yandex border-yandex/30" },
  { label: "Organic", value: "organic", color: "bg-organic/20 text-organic border-organic/30" },
];

interface TopBarProps {
  title: string;
}

export const TopBar = ({ title }: TopBarProps) => {
  const { preset, setPreset } = useDateRange();
  const { isActive, toggle } = usePlatformFilter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>

        <div className="flex items-center gap-3">
          {/* Date Range */}
          <div className="flex items-center gap-1 bg-surface-1 rounded-lg p-1">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  preset === p.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-1.5">
            {platforms.map((p) => (
              <button
                key={p.value}
                onClick={() => toggle(p.value)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${
                  isActive(p.value) ? p.color : "bg-transparent text-muted-foreground border-border opacity-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">2m ago</span>
          </button>
        </div>
      </div>
    </header>
  );
};

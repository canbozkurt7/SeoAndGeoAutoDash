import { useState } from "react";
import { RefreshCw, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useDateRange, DatePreset } from "@/hooks/useDateRange";
import { usePlatformFilter, PlatformKey } from "@/hooks/usePlatformFilter";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const { preset, setPreset, dateRange, setDateRange } = useDateRange();
  const { isActive, toggle } = usePlatformFilter();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const formatDateLabel = () => {
    if (!dateRange?.from) return "Select dates";
    if (!dateRange.to || dateRange.from.getTime() === dateRange.to.getTime()) {
      return format(dateRange.from, "MMM d, yyyy");
    }
    return `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>

        <div className="flex items-center gap-3">
          {/* Date Range Presets */}
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

          {/* Calendar Picker */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 text-xs gap-1.5 border-border bg-surface-1 hover:bg-surface-hover",
                  preset === "custom" && "border-primary/50 text-primary"
                )}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{formatDateLabel()}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border-border" align="end" sideOffset={8}>
              <div className="p-3 border-b border-border">
                <p className="text-xs font-medium text-foreground mb-2">Quick Select</p>
                <div className="flex flex-wrap gap-1">
                  {presets.map(p => (
                    <button
                      key={p.value}
                      onClick={() => { setPreset(p.value); setCalendarOpen(false); }}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        preset === p.value ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range: DateRange | undefined) => {
                  if (!range) return;
                  setDateRange(range);
                  // Only close when both dates are selected and they differ (i.e. user clicked twice)
                  if (range.from && range.to && range.from.getTime() !== range.to.getTime()) {
                    setCalendarOpen(false);
                  }
                }}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
                disabled={(date) => date > new Date()}
              />
              <div className="px-3 pb-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{formatDateLabel()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px]"
                  onClick={() => setCalendarOpen(false)}
                >
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>

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

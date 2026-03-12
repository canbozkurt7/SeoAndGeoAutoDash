"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useDateRange, type DatePreset } from "@/components/dashboard/useDateRange";

const presets: { value: DatePreset; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "14d", label: "14D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" }
];

function toInputDate(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function TopBar({ title }: { title: string }) {
  const { preset, dateRange, applyPreset, applyCustomRange, label } = useDateRange();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [from, setFrom] = useState(toInputDate(dateRange.from));
  const [to, setTo] = useState(toInputDate(dateRange.to));

  useEffect(() => {
    setFrom(toInputDate(dateRange.from));
    setTo(toInputDate(dateRange.to));
  }, [dateRange.from, dateRange.to]);

  return (
    <header className="topbar">
      <h2>{title}</h2>
      <div className="topbar-right">
        {presets.map((p) => (
          <button
            key={p.value}
            className={`chip chip-btn ${preset === p.value ? "chip-active" : ""}`}
            onClick={() => applyPreset(p.value)}
          >
            {p.label}
          </button>
        ))}
        <button className="chip chip-btn" onClick={() => setCalendarOpen((v) => !v)}>
          <CalendarDays size={13} />
          {label}
        </button>
        <span className="chip">Google</span>
        <span className="chip">Meta</span>
        <span className="chip">Yandex</span>
        <span className="chip">Organic</span>
      </div>
      {calendarOpen ? (
        <div className="calendar-pop">
          <div className="calendar-row">
            <label>
              From
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label>
              To
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </div>
          <div className="calendar-actions">
            <button
              onClick={() => {
                applyCustomRange(from, to);
                setCalendarOpen(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

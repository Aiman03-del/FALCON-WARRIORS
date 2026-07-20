"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

type DatePickerProps = {
  label?: string;
  value: string; // "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  type?: "date" | "datetime-local";
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  required?: boolean;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function toDateTimeStr(y: number, m: number, d: number, h: number, minute: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}T${pad(h)}:${pad(minute)}`;
}

function parseValue(value: string, type: "date" | "datetime-local") {
  if (!value) return null;

  if (type === "date") {
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return null;
    return { y, m: m - 1, d, hours: 0, minutes: 0 };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return {
    y: parsed.getFullYear(),
    m: parsed.getMonth(),
    d: parsed.getDate(),
    hours: parsed.getHours(),
    minutes: parsed.getMinutes(),
  };
}

export default function DatePicker({
  label,
  value,
  onChange,
  type = "date",
  minDate,
  maxDate,
  placeholder = "Select date",
  description,
  className = "",
  required,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsed = parseValue(value, type);
  const today = new Date();

  const [viewYear, setViewYear] = useState(parsed?.y ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.m ?? today.getMonth());
  const [timeValue, setTimeValue] = useState(
    parsed ? `${pad(parsed.hours)}:${pad(parsed.minutes)}` : "12:00"
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setViewYear(parsed?.y ?? today.getFullYear());
      setViewMonth(parsed?.m ?? today.getMonth());
      if (parsed) {
        setTimeValue(`${pad(parsed.hours)}:${pad(parsed.minutes)}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const minParsed = minDate ? parseValue(minDate, type) : null;
  const maxParsed = maxDate ? parseValue(maxDate, type) : null;

  function isDisabled(y: number, m: number, d: number) {
    const t = new Date(y, m, d).getTime();
    if (minParsed && t < new Date(minParsed.y, minParsed.m, minParsed.d).getTime()) return true;
    if (maxParsed && t > new Date(maxParsed.y, maxParsed.m, maxParsed.d).getTime()) return true;
    return false;
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const yearOptions = Array.from({ length: 12 }, (_, i) => today.getFullYear() - 3 + i);

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleSelectDay(d: number) {
    if (isDisabled(viewYear, viewMonth, d)) return;
    if (type === "datetime-local") {
      const [hours, minutes] = timeValue.split(":").map(Number);
      onChange(toDateTimeStr(viewYear, viewMonth, d, hours, minutes));
    } else {
      onChange(toDateStr(viewYear, viewMonth, d));
    }
    setOpen(false);
  }

  function handleTimeChange(event: ChangeEvent<HTMLInputElement>) {
    const nextTime = event.target.value;
    setTimeValue(nextTime);
    if (!parsed) return;
    const [hours, minutes] = nextTime.split(":").map(Number);
    onChange(toDateTimeStr(parsed.y, parsed.m, parsed.d, hours, minutes));
  }

  function displayValue() {
    if (!parsed) return "";
    const date = new Date(parsed.y, parsed.m, parsed.d, parsed.hours, parsed.minutes);
    return type === "datetime-local"
      ? date.toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  }

  return (
    <div ref={containerRef} className={className}>
      {label && <label className="mb-1 block text-xs font-medium text-muted">{label}</label>}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-left text-sm outline-none focus:border-white/30"
      >
        <span className={value ? "text-white" : "text-muted"}>
          {displayValue() || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !required && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="rounded p-0.5 text-muted hover:text-white"
            >
              <X size={14} />
            </span>
          )}
          <Calendar size={15} className="text-muted" />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-lg border border-border bg-surface p-3 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold">{MONTH_NAMES[viewMonth]}</span>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-white/30"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <span key={i} />;

              const disabled = isDisabled(viewYear, viewMonth, d);
              const isSelected =
                parsed && parsed.y === viewYear && parsed.m === viewMonth && parsed.d === d;
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === d;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(d)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-colors ${
                    isSelected
                      ? "bg-gold font-bold text-bg"
                      : disabled
                      ? "cursor-not-allowed text-white/20"
                      : isToday
                      ? "border border-gold/50 text-gold hover:bg-surface-2"
                      : "text-white/80 hover:bg-surface-2"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
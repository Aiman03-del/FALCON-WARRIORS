"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

type Option = { label: string; value: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
};

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "— Select —",
  required,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropup, setDropup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const trigger = containerRef.current.querySelector("button");
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const needsDropup = spaceBelow < 220 && spaceAbove > 220;
    setDropup(needsDropup);

    const timer = window.setTimeout(() => {
      searchInputRef.current?.blur();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, value, query]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function handleOpen() {
    setOpen(true);
    setQuery("");
  }

  function handleSelect(opt: Option) {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-xs font-medium text-muted">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-sm outline-none transition-colors focus:outline-none focus-visible:outline-none hover:border-border/80 sm:px-4"
      >
        <span className={`truncate ${selected ? "text-white" : "text-muted"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          {value && (
            <span
              onClick={handleClear}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted hover:text-white"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={15}
            className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown — opens upward when there is not enough room below the trigger */}
      {open && (
        <div
          className={`absolute left-0 right-0 z-50 overflow-hidden rounded-xl border border-border bg-surface shadow-xl shadow-black/50 ${
            dropup ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search size={13} className="shrink-0 text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="w-full bg-transparent text-sm text-white placeholder:text-muted/60 focus:outline-none focus-visible:outline-none focus:ring-0"
            />
          </div>

          {/* Options */}
          <ul className="max-h-44 overflow-y-auto overscroll-contain sm:max-h-52">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-muted">No results found.</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-2 hover:text-gold ${
                      opt.value === value ? "bg-gold/10 font-semibold text-gold" : "text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

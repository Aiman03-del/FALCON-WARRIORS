"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

export type SelectOption = {
  value: string;
  label: ReactNode;
  searchLabel?: string;
};

type SelectFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  searchable = false,
  clearable = false,
  disabled = false,
  required = false,
  className = "",
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = searchable
    ? options.filter((o) =>
        (o.searchLabel ?? String(o.label))
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : options;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  }, [open, searchable]);

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      {label && <label className="mb-1 block text-xs font-medium text-muted">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        aria-required={required}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-left text-sm outline-none focus:border-white/30 disabled:opacity-50"
      >
        <span className={`block text-sm ${selected ? "text-white" : "text-muted"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {clearable && value && !required && (
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
          <ChevronDown
            size={15}
            className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 w-full min-w-0 overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
          {searchable && (
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search size={14} className="text-muted" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
          )}

          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-center text-xs text-muted">No results found.</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-surface-2 ${
                    opt.value === value ? "text-gold" : "text-white/90"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {opt.label}
                    {opt.value === value && <Check size={14} />}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
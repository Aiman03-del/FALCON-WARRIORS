"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

export type SelectOption = {
  value: string;
  label: ReactNode;
  searchLabel?: string;
};

type MultiSelectFieldProps = {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export function MultiSelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select options",
  searchable = false,
  disabled = false,
  required = false,
  className = "",
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => (typeof option.label === "string" ? option.label : String(option.label)));

  const filtered = searchable
    ? options.filter((option) =>
        (option.searchLabel ?? String(option.label)).toLowerCase().includes(search.toLowerCase())
      )
    : options;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  function toggleOption(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      {label && <label className="mb-1 block text-xs font-medium text-muted">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((openState) => !openState)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-left text-sm outline-none focus:border-white/30 disabled:opacity-50"
      >
        <span className={`block text-sm ${value.length ? "text-white" : "text-muted"}`}>
          {value.length > 0 ? selectedLabels.join(", ") : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {!required && value.length > 0 && (
            <span
              role="button"
              onClick={(event) => {
                event.stopPropagation();
                onChange([]);
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
          )}

          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-center text-xs text-muted">No results found.</p>
            ) : (
              filtered.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-surface-2 ${
                      isSelected ? "text-gold" : "text-white/90"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {option.label}
                      {isSelected && <Check size={14} />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

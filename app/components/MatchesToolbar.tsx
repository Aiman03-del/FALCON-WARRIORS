"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";

type MatchesToolbarProps = {
  totalMatches: number;
};

type StatusTab = "all" | "upcoming" | "live" | "completed";
type TypeTab = "official" | "unofficial";

const STATUS_TABS: { value: StatusTab; label: string; live?: boolean }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "Live", live: true },
  { value: "completed", label: "Completed" },
];

const TYPE_TABS: { value: TypeTab; label: string }[] = [
  { value: "official", label: "Official" },
  { value: "unofficial", label: "Unofficial" },
];

export default function MatchesToolbar({ totalMatches }: MatchesToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState("");

  const currentStatus = (searchParams.get("status") as StatusTab) || "all";
  const currentType = (searchParams.get("type") as TypeTab) || "official";
  const currentSearch = searchParams.get("search") || "";

  const handleStatusChange = (status: StatusTab) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (status === "all") {
        params.delete("status");
      } else {
        params.set("status", status);
      }
      router.push(`/matches?${params.toString()}`);
    });
  };

  const handleTypeChange = (type: TypeTab) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("type", type);
      router.push(`/matches?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      router.push(`/matches?${params.toString()}`);
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.delete("search");
      router.push(`/matches?${params.toString()}`);
    });
  };

  return (
    <div className="mb-12 border-b border-[var(--fw-border)] pb-8">
      {/* Header with count */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--fw-brand)] mb-2">
            Match Schedule
          </p>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-display text-[var(--fw-text-primary)]">
            All Fixtures
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--fw-text-muted)]">
            {totalMatches} {totalMatches === 1 ? "Match" : "Matches"}
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            disabled={isPending}
            className={`flex items-center gap-1.5 rounded-[var(--fw-radius-md)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] transition-all duration-200 ${
              currentStatus === tab.value
                ? "bg-[var(--fw-brand)] text-[var(--fw-bg-primary)] border border-[var(--fw-brand)]"
                : "border border-[var(--fw-border)] text-[var(--fw-text-secondary)] hover:border-[var(--fw-text-secondary)] hover:text-[var(--fw-text-primary)]"
            } ${isPending ? "opacity-50" : ""}`}
          >
            {tab.live && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--fw-success)] animate-pulse" />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Type filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTypeChange(tab.value)}
            disabled={isPending}
            className={`rounded-[var(--fw-radius-md)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] transition-all duration-200 border ${
              currentType === tab.value
                ? "bg-[var(--fw-brand)] text-[var(--fw-bg-primary)] border-[var(--fw-brand)]"
                : "border-[var(--fw-border)] text-[var(--fw-text-secondary)] hover:border-[var(--fw-text-secondary)] hover:text-[var(--fw-text-primary)]"
            } ${isPending ? "opacity-50" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex gap-2"
      >
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fw-text-muted)]"
            size={16}
          />
          <input
            type="text"
            value={searchInput || currentSearch}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search matches..."
            disabled={isPending}
            className="w-full rounded-[var(--fw-radius-md)] border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] py-2.5 pl-9 pr-9 text-sm text-[var(--fw-text-primary)] placeholder-[var(--fw-text-muted)] outline-none transition-all duration-200 focus:border-[var(--fw-brand)] focus:bg-[var(--fw-bg-surface-hover)]"
          />
          {(searchInput || currentSearch) && (
            <button
              type="button"
              onClick={handleClearSearch}
              disabled={isPending}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fw-text-muted)] hover:text-[var(--fw-text-primary)] transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-[var(--fw-radius-md)] bg-[var(--fw-brand)] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--fw-bg-primary)] transition-all duration-200 hover:bg-[var(--fw-brand-hover)] disabled:opacity-50"
        >
          Search
        </button>
      </form>
    </div>
  );
}

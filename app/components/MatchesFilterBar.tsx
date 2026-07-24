"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter } from "lucide-react";

type FilterType = "all" | "internal" | "external";
type FilterStatus = "all" | "upcoming" | "completed" | "live";

export default function MatchesFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentType = (searchParams.get("type") || "all") as FilterType;
  const currentStatus = (searchParams.get("status") || "all") as FilterStatus;

  const typeOptions: Array<{ value: FilterType; label: string }> = [
    { value: "all", label: "All Types" },
    { value: "internal", label: "Internal" },
    { value: "external", label: "External" },
  ];

  const statusOptions: Array<{ value: FilterStatus; label: string }> = [
    { value: "all", label: "All Matches" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Results" },
    { value: "live", label: "Live" },
  ];

  function updateFilters(type?: FilterType, status?: FilterStatus) {
    const params = new URLSearchParams(searchParams);
    if (type && type !== "all") {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    const queryString = params.toString();
    router.push(`/matches${queryString ? `?${queryString}` : ""}`);
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-muted" />
        <span className="text-xs font-semibold uppercase text-muted">Filter</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Type Filter */}
        <div className="flex gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilters(opt.value, currentStatus as FilterStatus)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                currentType === opt.value
                  ? "bg-indigo/30 text-indigo-light"
                  : "bg-white/8 text-muted hover:bg-white/12"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilters(currentType as FilterType, opt.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                currentStatus === opt.value
                  ? "bg-gold/30 text-gold"
                  : "bg-white/8 text-muted hover:bg-white/12"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

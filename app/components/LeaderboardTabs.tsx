"use client";

import { useState } from "react";
import { LeaderboardEntry } from "../lib/queries/leaderboards";
import LeaderboardList from "./LeaderboardList";

type TabKey = "goals" | "winrate" | "motm" | "rating";

type LeaderboardData = {
  goals: LeaderboardEntry[];
  winrate: LeaderboardEntry[];
  motm: LeaderboardEntry[];
  rating: LeaderboardEntry[];
};

const tabs: Array<{ key: TabKey; label: string; valueLabel: string }> = [
  { key: "goals", label: "Top Scorers", valueLabel: "Goals" },
  { key: "winrate", label: "Best Win Rate", valueLabel: "Win%" },
  { key: "motm", label: "MOTM", valueLabel: "MOTM" },
  { key: "rating", label: "Best Rating", valueLabel: "Rating" },
];

const PAGE_SIZE = 10;

export default function LeaderboardTabs({
  data,
}: {
  data: LeaderboardData;
}) {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("goals");
  const currentEntries = data[activeTab];
  const totalPages = Math.max(1, Math.ceil(currentEntries.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageEntries = currentEntries.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
              activeTab === tab.key
                ? "bg-gold text-black"
                : "border border-border bg-surface-2 text-muted hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface-2/60 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-gold">{tabs.find((tab) => tab.key === activeTab)?.label}</p>
        <p className="mt-1 text-sm text-muted">
          {tabs.find((tab) => tab.key === activeTab)?.valueLabel} values are shown directly in the player list.
        </p>
      </div>

      <LeaderboardList entries={pageEntries} />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          Showing {startIndex + 1}–{Math.min(currentEntries.length, endIndex)} of {currentEntries.length} players
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

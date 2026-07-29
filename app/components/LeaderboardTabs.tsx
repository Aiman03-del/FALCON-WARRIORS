"use client";

import { useState } from "react";
import { LeaderboardData, LeaderboardScope } from "../lib/queries/leaderboards";
import LeaderboardList from "./LeaderboardList";

type TabKey = "goals" | "winrate" | "motm" | "rating";

type ScopedLeaderboardData = Record<LeaderboardScope, LeaderboardData>;

const statTabs: Array<{ key: TabKey; label: string; valueLabel: string }> = [
  { key: "goals", label: "Top Scorers", valueLabel: "Goals" },
  { key: "winrate", label: "Best Win Rate", valueLabel: "Win%" },
  { key: "motm", label: "MOTM", valueLabel: "MOTM" },
  { key: "rating", label: "Best Rating", valueLabel: "Rating" },
];

const scopeTabs: Array<{ key: LeaderboardScope; label: string; description: string }> = [
  {
    key: "official",
    label: "Official",
    description: "Rankings from external club matches and official tournaments.",
  },
  {
    key: "unofficial",
    label: "Unofficial",
    description: "Rankings from internal player-vs-player matches and club tournaments.",
  },
];

const PAGE_SIZE = 10;

export default function LeaderboardTabs({
  data,
  isAdmin = false,
}: {
  data: ScopedLeaderboardData;
  isAdmin?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [activeScope, setActiveScope] = useState<LeaderboardScope>("official");
  const [activeTab, setActiveTab] = useState<TabKey>("goals");

  const currentEntries = data[activeScope][activeTab];
  const totalPages = Math.max(1, Math.ceil(currentEntries.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageEntries = currentEntries.slice(startIndex, endIndex);
  const activeStatTab = statTabs.find((tab) => tab.key === activeTab);
  const activeScopeTab = scopeTabs.find((tab) => tab.key === activeScope);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {scopeTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveScope(tab.key);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide transition ${
              activeScope === tab.key
                ? "bg-gold text-black"
                : "border border-border bg-surface-2 text-muted hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {statTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
              activeTab === tab.key
                ? "bg-white/10 text-white"
                : "border border-border bg-surface-2 text-muted hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface-2/60 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-gold">
          {activeScopeTab?.label} · {activeStatTab?.label}
        </p>
        <p className="mt-1 text-sm text-muted">{activeScopeTab?.description}</p>
      </div>

      <LeaderboardList
        entries={pageEntries}
        statType={activeTab}
        emptyMessage={`No ${activeScopeTab?.label.toLowerCase()} ${activeStatTab?.label.toLowerCase()} data yet.`}
        isAdmin={isAdmin}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          Showing {currentEntries.length === 0 ? 0 : startIndex + 1}–
          {Math.min(currentEntries.length, endIndex)} of {currentEntries.length} players
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
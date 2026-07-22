"use client";

import { useState } from "react";
import { LeaderboardEntry } from "../lib/queries/leaderboards";
import LeaderboardList from "./LeaderboardList";

type LeaderboardData = {
  goals: LeaderboardEntry[];
};

const PAGE_SIZE = 10;

export default function LeaderboardTabs({
  data,
}: {
  data: LeaderboardData;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.goals.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageEntries = data.goals.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface-2/60 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-gold">Top Scorers</p>
        <p className="mt-1 text-sm text-muted">
          Goals, points, win rate, and MOTM are shown directly in the player list.
        </p>
      </div>

      <LeaderboardList entries={pageEntries} />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          Showing {startIndex + 1}–{Math.min(data.goals.length, endIndex)} of {data.goals.length} players
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

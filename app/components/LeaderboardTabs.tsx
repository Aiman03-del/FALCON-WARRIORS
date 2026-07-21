"use client";

import { useState } from "react";
import { LeaderboardEntry } from "../lib/queries/leaderboards";
import LeaderboardList from "./LeaderboardList";

type LeaderboardData = {
  goals: LeaderboardEntry[];
  assists: LeaderboardEntry[];
  winrate: LeaderboardEntry[];
  motm: LeaderboardEntry[];
};

type TabKey = keyof LeaderboardData;

const tabs: { key: TabKey; label: string; valueLabel: string }[] = [
  { key: "goals", label: "Top Scorers", valueLabel: "Goals" },
  { key: "winrate", label: "Best Win Rate", valueLabel: "Win %" },
  { key: "motm", label: "Most MOTM", valueLabel: "MOTM" },
];

export default function LeaderboardTabs({
  data,
}: {
  data: LeaderboardData;
}) {
  const [active, setActive] = useState<TabKey>("goals");
  const activeTab = tabs.find((t) => t.key === active)!;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase transition-colors ${
              active === t.key ? "bg-gold text-bg" : "bg-surface-2 text-muted hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <LeaderboardList entries={data[active]} valueLabel={activeTab.valueLabel} />
      </div>
    </div>
  );
}
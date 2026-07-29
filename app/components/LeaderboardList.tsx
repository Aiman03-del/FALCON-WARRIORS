import Link from "next/link";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { LeaderboardEntry } from "../lib/queries/leaderboards";

type StatType = "goals" | "winrate" | "motm" | "rating" | "assists";

const PRIMARY_LABEL: Record<StatType, string> = {
  goals: "GF",
  winrate: "Win%",
  motm: "MOTM",
  rating: "Rating",
  assists: "AST",
};

function formatPrimaryValue(statType: StatType, value: number): string {
  if (statType === "winrate") return `${value}%`;
  if (statType === "rating") return value.toFixed(1);
  return String(value);
}

export default function LeaderboardList({
  entries,
  statType = "goals",
  emptyMessage = "No data available yet.",
}: {
  entries: LeaderboardEntry[];
  statType?: StatType;
  emptyMessage?: string;
}) {
  if (entries.length === 0) {
    return <div className="card p-6 text-center text-sm text-muted">{emptyMessage}</div>;
  }

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-muted">
          <tr>
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">Player</th>
            <th className="px-2 py-3 text-center">P</th>
            <th className="px-2 py-3 text-center">W</th>
            <th className="px-2 py-3 text-center">D</th>
            <th className="px-2 py-3 text-center">{PRIMARY_LABEL[statType]}</th>
            {statType !== "winrate" && <th className="px-2 py-3 text-center">Win%</th>}
            {statType !== "motm" && <th className="px-2 py-3 text-center">MOTM</th>}
            <th className="px-3 py-3 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={entry.playerId} className="border-b border-border last:border-0 hover:bg-surface-2">
              <td className="px-3 py-3">
                <div className="flex items-center gap-1.5">
                  {idx < 3 ? (
                    <Trophy
                      size={13}
                      className={idx === 0 ? "text-gold" : idx === 1 ? "text-white/60" : "text-gold-dark"}
                    />
                  ) : null}
                  <span className="font-display font-bold">{idx + 1}</span>
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-2">
                    {entry.avatarUrl ? (
                      <Image src={entry.avatarUrl} alt={entry.username} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-gold">
                        {entry.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <Link href={`/players/${entry.playerId}`} className="block truncate font-medium text-white">
                    {entry.username}
                  </Link>
                </div>
              </td>
              <td className="px-2 py-3 text-center text-muted">{entry.matches}</td>
              <td className="px-2 py-3 text-center text-muted">{entry.wins}</td>
              <td className="px-2 py-3 text-center text-muted">{entry.draws}</td>
              <td className="px-2 py-3 text-center text-muted">{formatPrimaryValue(statType, entry.value)}</td>
              {statType !== "winrate" && (
                <td className="px-2 py-3 text-center text-muted">
                  {entry.winRate !== undefined ? `${entry.winRate}%` : "—"}
                </td>
              )}
              {statType !== "motm" && (
                <td className="px-2 py-3 text-center text-muted">
                  {entry.motm !== undefined ? entry.motm : "—"}
                </td>
              )}
              <td className="px-3 py-3 text-right">
                <span className="font-display text-lg font-bold text-gold">{entry.points ?? 0}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-border px-4 py-2 text-[10px] text-muted">
        P = Played, W = Won, D = Drawn, {PRIMARY_LABEL[statType]} = {
          statType === "goals" ? "Goals For" :
          statType === "winrate" ? "Win Rate" :
          statType === "motm" ? "Man of the Match" :
          statType === "rating" ? "Average Rating" : "Assists"
        }, Pts = Points (Win 3 · Draw 1 · Loss 0)
      </p>
    </div>
  );
}
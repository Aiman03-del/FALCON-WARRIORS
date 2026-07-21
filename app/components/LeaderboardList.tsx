import Link from "next/link";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { LeaderboardEntry } from "../lib/queries/leaderboards";

export default function LeaderboardList({
  entries,
  valueLabel,
  emptyMessage = "No data available yet.",
}: {
  entries: LeaderboardEntry[];
  valueLabel: string;
  emptyMessage?: string;
}) {
  if (entries.length === 0) {
    return <div className="card p-6 text-center text-sm text-muted">{emptyMessage}</div>;
  }

  return (
    <div className="card overflow-hidden">
      {entries.map((entry, idx) => (
        <Link
          key={entry.playerId}
          href={`/players/${entry.playerId}`}
          className="flex items-center gap-3 border-b border-border p-4 last:border-0 hover:bg-surface-2"
        >
          <div className="flex w-7 shrink-0 items-center justify-center">
            {idx < 3 ? (
              <Trophy
                size={16}
                className={idx === 0 ? "text-gold" : idx === 1 ? "text-white/60" : "text-gold-dark"}
              />
            ) : (
              <span className="text-sm font-bold text-muted">{idx + 1}</span>
            )}
          </div>

          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-2">
            {entry.avatarUrl ? (
              <Image src={entry.avatarUrl} alt={entry.username} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-gold">
                {entry.username.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold">{entry.username}</p>
            {entry.secondary && <p className="text-xs text-muted">{entry.secondary}</p>}
          </div>

          <div className="text-right">
            <span className="font-display text-lg font-bold text-gold">{entry.value}</span>
            <p className="text-[10px] uppercase text-muted">{valueLabel}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
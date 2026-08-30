import Link from "next/link";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { LeaderboardEntry } from "../lib/queries/leaderboards";
import ClearPlayerStatsButton from "./dashboard/ClearPlayerStatsButton";

export default function LeaderboardList({
  entries,
  emptyMessage = "No data available yet.",
  isAdmin = false,
  hideManageColumn = false,
}: {
  entries: LeaderboardEntry[];
  emptyMessage?: string;
  isAdmin?: boolean;
  hideManageColumn?: boolean;
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
            <th className="px-2 py-3 text-center">L</th>
            <th className="px-2 py-3 text-center">GF</th>
            <th className="px-3 py-3 text-right">Pts</th>
            {!hideManageColumn && isAdmin && <th className="px-3 py-3 text-right">Manage</th>}
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
                      <Image src={entry.avatarUrl} alt={entry.realName || entry.username} fill sizes="32px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-gold">
                        {(entry.realName || entry.username).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <Link href={`/players/${entry.slug ?? entry.playerId}`} className="block truncate font-medium text-white">
                    {entry.realName || entry.username}
                  </Link>
                </div>
              </td>
              <td className="px-2 py-3 text-center text-muted">{entry.matches}</td>
              <td className="px-2 py-3 text-center text-muted">{entry.wins}</td>
              <td className="px-2 py-3 text-center text-muted">{entry.draws}</td>
              <td className="px-2 py-3 text-center text-muted">{entry.losses}</td>
              <td className="px-2 py-3 text-center text-muted">{entry.value}</td>
              <td className="px-3 py-3 text-right">
                <span className="font-display text-lg font-bold text-gold">{entry.points ?? 0}</span>
              </td>
              {!hideManageColumn && isAdmin && (
                <td className="px-3 py-3 text-right">
                  <ClearPlayerStatsButton playerId={entry.playerId} username={entry.realName || entry.username} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-border px-4 py-2 text-[10px] text-muted">
        P = Played, W = Won, D = Drawn, L = Lost, GF = Goals For, Pts = Points (Win 3 · Draw 1 · Loss 0)
      </p>
    </div>
  );
}
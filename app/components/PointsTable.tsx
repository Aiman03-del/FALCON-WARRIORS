import Image from "next/image";
import { Trophy } from "lucide-react";

type Participant = {
  id: string;
  points: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  player_details:
    | { id: string; efootball_username: string; avatar_url: string | null }
    | { id: string; efootball_username: string; avatar_url: string | null }[]
    | null;
};

function getPlayer(p: Participant) {
  if (Array.isArray(p.player_details)) return p.player_details[0] ?? null;
  return p.player_details;
}

export default function PointsTable({ participants }: { participants: Participant[] }) {
  const sorted = [...participants].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goals_for - a.goals_against;
    const gdB = b.goals_for - b.goals_against;
    if (gdB !== gdA) return gdB - gdA;
    return b.goals_for - a.goals_for;
  });

  if (sorted.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        No participants registered for this tournament yet.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-muted">
          <tr>
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">Player</th>
            <th className="px-2 py-3 text-center">P</th>
            <th className="px-2 py-3 text-center">W</th>
            <th className="px-2 py-3 text-center">D</th>
            <th className="px-2 py-3 text-center">L</th>
            <th className="px-2 py-3 text-center">GF</th>
            <th className="px-2 py-3 text-center">GA</th>
            <th className="px-2 py-3 text-center">GD</th>
            <th className="px-3 py-3 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, idx) => {
            const player = getPlayer(p);
            const isTop3 = idx < 3;
            const gd = p.goals_for - p.goals_against;

            return (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    {isTop3 && <Trophy className="text-gold" size={13} />}
                    <span className="font-display font-bold">{idx + 1}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-surface-2">
                      {player?.avatar_url ? (
                        <Image
                          src={player.avatar_url}
                          alt={player.efootball_username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-gold">
                          {player?.efootball_username.slice(0, 2).toUpperCase() ?? "?"}
                        </div>
                      )}
                    </div>
                    <span className="whitespace-nowrap font-medium">
                      {player?.efootball_username ?? "Unknown"}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-3 text-center text-muted">{p.matches_played}</td>
                <td className="px-2 py-3 text-center text-muted">{p.wins}</td>
                <td className="px-2 py-3 text-center text-muted">{p.draws}</td>
                <td className="px-2 py-3 text-center text-muted">{p.losses}</td>
                <td className="px-2 py-3 text-center text-muted">{p.goals_for}</td>
                <td className="px-2 py-3 text-center text-muted">{p.goals_against}</td>
                <td className="px-2 py-3 text-center text-muted">
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-display text-lg font-bold text-gold">{p.points}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-border px-4 py-2 text-[10px] text-muted">
        P = Played, W = Won, D = Drawn, L = Lost, GF = Goals For, GA = Goals Against, GD = Goal
        Difference, Pts = Points (Win 3 · Draw 1 · Loss 0)
      </p>
    </div>
  );
}
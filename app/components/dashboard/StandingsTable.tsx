import { computeStandingsFromMatches } from "@/app/lib/fixtures/computeStandings";
import { rankStandings } from "@/app/lib/fixtures/tiebreakers";

type ParticipantRow = {
  player_id: string;
  manual_rank?: number | null;
  player_details?:
    | { efootball_username?: string }
    | { efootball_username?: string }[]
    | null;
};

type MatchRow = {
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  status: string;
  stage?: string | null;
};

function usernameOf(p: ParticipantRow): string {
  const pd = Array.isArray(p.player_details) ? p.player_details[0] : p.player_details;
  return pd?.efootball_username ?? "Unknown";
}

export default function StandingsTable({
  participants,
  matches,
}: {
  participants: ParticipantRow[];
  matches: MatchRow[];
}) {
  const statsMap = computeStandingsFromMatches(
    participants.map((p) => p.player_id),
    matches
  );

  const withPlayerId = participants.map((p) => ({
    ...p,
    ...statsMap[p.player_id],
    username: usernameOf(p),
  }));

  const ranked = rankStandings(withPlayerId as any, matches);

  const rows = ranked.map((p: any) => ({
    id: p.player_id,
    username: p.username,
    points: p.points ?? 0,
    played: p.matches_played ?? 0,
    wins: p.wins ?? 0,
    draws: p.draws ?? 0,
    losses: p.losses ?? 0,
    gd: (p.goals_for ?? 0) - (p.goals_against ?? 0),
  }));

  if (rows.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        No standings yet — add participants and generate fixtures first.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Player</th>
            <th className="px-2 py-3 text-center">P</th>
            <th className="px-2 py-3 text-center">W</th>
            <th className="px-2 py-3 text-center">D</th>
            <th className="px-2 py-3 text-center">L</th>
            <th className="px-2 py-3 text-center">GD</th>
            <th className="px-4 py-3">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-display font-bold text-gold">#{idx + 1}</td>
              <td className="px-4 py-3 font-medium">{r.username}</td>
              <td className="px-2 py-3 text-center text-muted">{r.played}</td>
              <td className="px-2 py-3 text-center text-muted">{r.wins}</td>
              <td className="px-2 py-3 text-center text-muted">{r.draws}</td>
              <td className="px-2 py-3 text-center text-muted">{r.losses}</td>
              <td className="px-2 py-3 text-center text-muted">
                {r.gd > 0 ? "+" : ""}
                {r.gd}
              </td>
              <td className="px-4 py-3 font-display font-bold text-gold">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

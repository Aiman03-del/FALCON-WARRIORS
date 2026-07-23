import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/app/lib/supabase/server";

export default async function OfficialTournamentOverview({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const supabase = await createClient();

  const { data: squadRows } = await supabase
    .from("tournament_squad")
    .select("player_details(id, efootball_username, avatar_url)")
    .eq("tournament_id", tournamentId);

  const squad = (squadRows ?? [])
    .map((s: any) => (Array.isArray(s.player_details) ? s.player_details[0] : s.player_details))
    .filter(Boolean);

  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent_name, round_stage, match_date, status, score_home, score_away")
    .eq("tournament_id", tournamentId)
    .order("match_date", { ascending: false });

  const wins = (matches ?? []).filter(
    (m) => m.status === "completed" && (m.score_home ?? 0) > (m.score_away ?? 0)
  ).length;
  const draws = (matches ?? []).filter(
    (m) => m.status === "completed" && m.score_home === m.score_away
  ).length;
  const losses = (matches ?? []).filter(
    (m) => m.status === "completed" && (m.score_home ?? 0) < (m.score_away ?? 0)
  ).length;

  return (
    <div className="mt-6 flex flex-col gap-8">
      {/* Record summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-indigo-light">{wins}</p>
          <p className="text-xs uppercase text-muted">Wins</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-muted">{draws}</p>
          <p className="text-xs uppercase text-muted">Draws</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-red-400">{losses}</p>
          <p className="text-xs uppercase text-muted">Losses</p>
        </div>
      </div>

      {/* Squad */}
      <div>
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
          Squad ({squad.length})
        </h2>
        {squad.length === 0 ? (
          <p className="text-sm text-muted">
            No squad selected yet. Edit tournament details to select the squad.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {squad.map((p: any) => (
              <span
                key={p.id}
                className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium"
              >
                {p.efootball_username}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Matches */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-gold">
            Matches ({(matches ?? []).length})
          </h2>
          <Link
            href={`/dashboard/tournaments/${tournamentId}/matches/new`}
            className="btn-primary flex items-center gap-1.5 text-xs"
          >
            <Plus size={14} />
            Add Match
          </Link>
        </div>

        {(matches ?? []).length === 0 ? (
          <p className="text-sm text-muted">No matches added yet.</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Opponent</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(matches ?? []).map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">vs {m.opponent_name}</td>
                    <td className="px-4 py-3 text-muted">{m.round_stage ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(m.match_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {m.score_home !== null ? `${m.score_home} - ${m.score_away}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/matches/${m.id}`}
                        className="text-xs font-medium text-gold hover:text-gold-light"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
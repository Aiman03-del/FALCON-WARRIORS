import BackLink from "@/app/components/BackLink";
import BracketView from "@/app/components/BracketView";
import { rankStandings } from "@/app/lib/fixtures/tiebreakers";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function TournamentBracketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, name, format, status")
    .eq("id", id)
    .single();

  if (!tournament) notFound();

  const { data: participantsRaw } = await supabase
    .from("tournament_participants")
    .select(
      "player_id, group_name, points, matches_played, wins, draws, losses, goals_for, goals_against, manual_rank, player_details(id, efootball_username, avatar_url)"
    )
    .eq("tournament_id", id)
    .eq("status", "approved");

  const participants = (participantsRaw ?? [])
    .map((p: any) => {
      const pd = Array.isArray(p.player_details) ? p.player_details[0] : p.player_details;
      return pd ? { id: pd.id, username: pd.efootball_username, avatarUrl: pd.avatar_url ?? null } : null;
    })
    .filter((p): p is { id: string; username: string; avatarUrl: string | null } => !!p);

  const { data: matches } = await supabase
    .from("tournament_matches")
    .select(
      "id, round, match_order, player1_id, player2_id, player1_score, player2_score, winner_id, status, stage, group_name, is_third_place"
    )
    .eq("tournament_id", id)
    .order("round")
    .order("match_order");

  const infoOf = (playerId: string | null) => {
    if (!playerId) return null;
    const p = participants.find((x) => x.id === playerId);
    return p ? { username: p.username, avatarUrl: p.avatarUrl ?? null } : null;
  };

  const knockoutMatches = (matches ?? []).filter((m) => m.stage === "knockout" || m.stage == null);
  const bracketMatches = knockoutMatches.filter((m) => !m.is_third_place);
  const thirdPlaceMatch = knockoutMatches.find((m) => m.is_third_place) ?? null;
  const hasBracket = bracketMatches.length > 0;

  const groupNames =
    tournament.format === "group_knockout"
      ? Array.from(new Set((participantsRaw ?? []).map((p: any) => p.group_name).filter(Boolean))).sort()
      : [];

  return (
    <div>
      <BackLink href={`/dashboard/tournaments/${id}`} label="Back to Tournament" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            {tournament.name} — Bracket
          </h1>
          <p className="mt-1 text-sm text-muted capitalize">
            {tournament.format} format · {tournament.status}
          </p>
        </div>
        <Link href={`/dashboard/tournaments/${id}/fixtures`} className="btn-outline text-sm">
          Manage Fixtures / Results
        </Link>
      </div>

      {/* Group Stage standings — only for group_knockout */}
      {tournament.format === "group_knockout" &&
        groupNames.map((groupName) => (
          <div key={groupName} className="mt-8">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
              Group {groupName}
            </h2>
            <StandingsTable
              participants={(participantsRaw ?? []).filter((p: any) => p.group_name === groupName)}
              matches={(matches ?? []).filter(
                (m) => m.status === "completed" && m.stage === "group" && m.group_name === groupName
              )}
            />
          </div>
        ))}

      {/* League table — for both league and league_playoff */}
      {(tournament.format === "league" || tournament.format === "league_playoff") && (
        <div className="mt-8">
          <StandingsTable
            participants={participantsRaw ?? []}
            matches={(matches ?? []).filter((m) => m.status === "completed" && m.stage !== "knockout")}
          />
        </div>
      )}

      {/* Knockout bracket — always for pure knockout, generated for other formats when available */}
      {(tournament.format === "knockout" || hasBracket) && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
            Knockout Bracket
          </h2>
          <BracketView
            matches={bracketMatches.map((m: any) => ({
              ...m,
              player1: m.player1_id
                ? { efootball_username: infoOf(m.player1_id)!.username, avatar_url: infoOf(m.player1_id)!.avatarUrl }
                : null,
              player2: m.player2_id
                ? { efootball_username: infoOf(m.player2_id)!.username, avatar_url: infoOf(m.player2_id)!.avatarUrl }
                : null,
            }))}
            mode="knockout"
          />
        </div>
      )}

      {/* 3rd place match */}
      {thirdPlaceMatch && (
        <div className="mt-6">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
            3rd Place Match
          </h2>
          <div className="card flex items-center justify-between p-4 text-sm">
            <span className="font-medium">{infoOf(thirdPlaceMatch.player1_id)?.username ?? "Unknown"}</span>
            <span className="text-muted">
              {thirdPlaceMatch.status === "completed"
                ? `${thirdPlaceMatch.player1_score} - ${thirdPlaceMatch.player2_score}`
                : "vs"}
            </span>
            <span className="font-medium">{infoOf(thirdPlaceMatch.player2_id)?.username ?? "Unknown"}</span>
          </div>
        </div>
      )}

      {!hasBracket && tournament.format !== "knockout" && groupNames.length === 0 && tournament.format !== "league" && tournament.format !== "league_playoff" && (
        <div className="card mt-8 p-8 text-center text-sm text-muted">
          No standings yet — add participants and generate fixtures first.
        </div>
      )}
    </div>
  );
}

function StandingsTable({ participants, matches }: { participants: any[]; matches: any[] }) {
  const withPlayerId = participants.map((p) => {
    const pd = Array.isArray(p.player_details) ? p.player_details[0] : p.player_details;
    return { ...p, player_id: p.player_id, username: pd?.efootball_username ?? "Unknown" };
  });

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
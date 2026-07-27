
import BracketView from "@/app/components/BracketView";
import FixtureGenerator from "@/app/components/dashboard/FixtureGenerator";
import FixtureRow from "@/app/components/dashboard/FixtureRow";
import GroupKnockoutTransition from "@/app/components/dashboard/GroupKnockoutTransition";
import LeaguePlayoffTransition from "@/app/components/dashboard/LeaguePlayoffTransition";
import NextRoundGenerator from "@/app/components/dashboard/NextRoundGenerator";
import { getGroupStandings, getTournamentStandings } from "@/app/lib/queries/tournaments";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";


export default async function FixturesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, name, format, double_round, status, bye_method, group_count, qualifiers_per_group, playoff_size")
    .eq("id", id)
    .single();

  if (!tournament) notFound();

  const { data: participantsRaw } = await supabase
    .from("tournament_participants")
    .select("player_id, player_details(id, efootball_username)")
    .eq("tournament_id", id)
    .eq("status", "approved");

  const participants = (participantsRaw ?? [])
    .map((p: any) => {
      const pd = Array.isArray(p.player_details) ? p.player_details[0] : p.player_details;
      return pd ? { id: pd.id, username: pd.efootball_username } : null;
    })
    .filter((p): p is { id: string; username: string } => !!p);

  const { data: matches } = await supabase
    .from("tournament_matches")
    .select("id, round, match_order, player1_id, player2_id, player1_score, player2_score, winner_id, status, stage, group_name")
    .eq("tournament_id", id)
    .order("round")
    .order("match_order");

  const groupStandings =
    tournament.format === "group_knockout" ? await getGroupStandings(tournament.id) : [];

  const leagueStandings =
    tournament.format === "league_playoff" ? await getTournamentStandings(tournament.id) : [];

  const roundKeys = Array.from(
    new Set((matches ?? []).map((m) => `${m.stage ?? "main"}::${m.round}`))
  ).sort((a, b) => {
    const [stageA, roundA] = a.split("::");
    const [stageB, roundB] = b.split("::");
    if (stageA !== stageB) return stageA.localeCompare(stageB);
    return Number(roundA) - Number(roundB);
  });

  const formatLabels: Record<string, string> = {
    league: "League",
    knockout: "Knockout",
    group_knockout: "Group Stage + Knockout",
    league_playoff: "League + Knockout (Playoff)",
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            {tournament.name} — Fixtures
          </h1>
          <p className="mt-1 text-sm text-muted capitalize">
            {formatLabels[tournament.format] ?? tournament.format} · {participants.length} approved participants
          </p>
        </div>
        <Link
          href={`/dashboard/tournaments/${tournament.id}/bracket`}
          className="btn-outline text-sm"
        >
          {tournament.format === "knockout" ? "View Bracket" : "View Standings"}
        </Link>
      </div>

      <div className="mt-6">
        <FixtureGenerator
          tournamentId={tournament.id}
          format={tournament.format}
          doubleRound={tournament.double_round}
          participants={participants}
          alreadyGenerated={(matches ?? []).length > 0}
          byeMethod={tournament.bye_method ?? "seed"}
          groupCount={tournament.group_count}
          qualifiersPerGroup={tournament.qualifiers_per_group}
        />
      </div>

      {roundKeys.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
            Bracket Preview
          </h2>
          <BracketView
            matches={(matches ?? []).map((m: any) => ({
              ...m,
              player1: participants.find((p) => p.id === m.player1_id)
                ? { efootball_username: participants.find((p) => p.id === m.player1_id)!.username }
                : null,
              player2: participants.find((p) => p.id === m.player2_id)
                ? { efootball_username: participants.find((p) => p.id === m.player2_id)!.username }
                : null,
            }))}
            mode={tournament.format === "knockout" ? "knockout" : "league"}
          />
        </div>
      )}

      {roundKeys.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">
          No fixtures generated yet. Click the button above to randomly generate matchups.
        </p>
      ) : (
        roundKeys.map((key) => {
          const [stage, roundStr] = key.split("::");
          const round = Number(roundStr);
          const stageLabel =
            stage === "group"
              ? "Group Stage"
              : stage === "knockout"
              ? "Knockout"
              : stage === "league"
              ? "League"
              : null;

          return (
            <div key={key} className="mt-8">
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
                {stageLabel ? `${stageLabel} — Round ${round}` : `Round ${round}`}
              </h2>
              <div className="flex flex-col gap-3">
                {(matches ?? [])
                  .filter((m) => (m.stage ?? "main") === stage && m.round === round)
                  .map((m) => (
                    <FixtureRow
                      key={m.id}
                      match={m}
                      allParticipants={participants}
                      tournamentId={tournament.id}
                      format={tournament.format}
                    />
                  ))}
              </div>
            </div>
          );
        })
      )}

      {tournament.format === "group_knockout" && (
        <GroupKnockoutTransition
          tournamentId={tournament.id}
          matches={matches ?? []}
          groupStandings={groupStandings.map((g) => ({ groupName: g.groupName, standings: g.standings }))}
          qualifiersPerGroup={tournament.qualifiers_per_group ?? 2}
        />
      )}

      {tournament.format === "league_playoff" && (
        <LeaguePlayoffTransition
          tournamentId={tournament.id}
          matches={matches ?? []}
          standings={leagueStandings}
          playoffSize={tournament.playoff_size ?? 4}
        />
      )}

      {(tournament.format === "knockout" ||
        tournament.format === "group_knockout" ||
        tournament.format === "league_playoff") && (
        <NextRoundGenerator
          tournamentId={tournament.id}
          matches={matches ?? []}
          allParticipants={participants}
          tournamentStatus={tournament.status}
          byeMethod={tournament.bye_method ?? "seed"}
        />
      )}
    </div>
  );
}
import {
  buildFullKnockoutBracket,
  buildLeagueBracketMatches,
  buildProjectedKnockoutBracket,
} from "@/app/lib/fixtures/buildFullKnockoutBracket";
import BracketView from "@/app/components/BracketView";
import FixtureGenerator from "@/app/components/dashboard/FixtureGenerator";
import FixturesStepper from "@/app/components/dashboard/FixturesStepper";
import InternalTournamentTabs, {
  type InternalTournamentTab,
} from "@/app/components/dashboard/InternalTournamentTabs";
import ParticipantsManager from "@/app/components/dashboard/ParticipantsManager";
import StandingsTable from "@/app/components/dashboard/StandingsTable";
import TournamentForm from "@/app/components/dashboard/TournamentForm";
import { getGroupStandings, getTournamentStandings } from "@/app/lib/queries/tournaments";
import { createClient } from "@/app/lib/supabase/client";

export default async function InternalTournamentDashboard({
  tournamentId,
  activeTab,
}: {
  tournamentId: string;
  activeTab: InternalTournamentTab;
}) {
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select(
      "id, name, type, format, double_round, status, start_date, end_date, max_participants, registration_deadline, bye_method, group_count, qualifiers_per_group, playoff_size, third_place_match"
    )
    .eq("id", tournamentId)
    .single();

  if (!tournament) return null;

  const { data: participantsRaw } = await supabase
    .from("tournament_participants")
    .select(
      "id, player_id, group_name, points, status, matches_played, wins, draws, losses, goals_for, goals_against, player_details(efootball_username)"
    )
    .eq("tournament_id", tournamentId);

  const { data: approvedParticipantsRaw } = await supabase
    .from("tournament_participants")
    .select("player_id, group_name, player_details(id, efootball_username, avatar_url)")
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  const { data: allPlayers } = await supabase
    .from("player_details")
    .select("id, efootball_username")
    .order("efootball_username");

  const participants = (approvedParticipantsRaw ?? [])
    .map((p: any) => {
      const pd = Array.isArray(p.player_details) ? p.player_details[0] : p.player_details;
      return pd
        ? { id: pd.id, username: pd.efootball_username, avatar_url: pd.avatar_url ?? null }
        : null;
    })
    .filter((p): p is { id: string; username: string; avatar_url: string | null } => !!p);

  const { data: matches } = await supabase
    .from("tournament_matches")
    .select(
      "id, round, match_order, player1_id, player2_id, player1_score, player2_score, winner_id, status, stage, group_name, is_third_place"
    )
    .eq("tournament_id", tournamentId)
    .order("round")
    .order("match_order");

  const groupStandings =
    tournament.format === "group_knockout" ? await getGroupStandings(tournament.id) : [];

  const leagueStandings =
    tournament.format === "league_playoff" || tournament.format === "league"
      ? await getTournamentStandings(tournament.id)
      : [];

  const groupNames =
    tournament.format === "group_knockout"
      ? Array.from(
          new Set((approvedParticipantsRaw ?? []).map((p: any) => p.group_name).filter(Boolean))
        ).sort()
      : [];

  const showStandings =
    tournament.format === "league" ||
    tournament.format === "league_playoff" ||
    tournament.format === "group_knockout";

  const mapMatchForBracket = (m: any) => {
    const p1 = participants.find((p) => p.id === m.player1_id);
    const p2 = participants.find((p) => p.id === m.player2_id);
    return {
      ...m,
      player1: p1
        ? { efootball_username: p1.username, avatar_url: p1.avatar_url }
        : (m.player1 ?? null),
      player2: p2
        ? { efootball_username: p2.username, avatar_url: p2.avatar_url }
        : (m.player2 ?? null),
    };
  };

  const knockoutMatches = (matches ?? []).filter((m) => m.stage === "knockout" || m.stage == null);
  const bracketMatches = knockoutMatches.filter((m) => !m.is_third_place);
  const thirdPlaceMatch = knockoutMatches.find((m) => m.is_third_place) ?? null;
  const leagueStageMatches = (matches ?? []).filter(
    (m) => m.stage === "league" || m.stage === "group"
  );

  const projectedPlayoffTeams =
    tournament.format === "group_knockout"
      ? (tournament.group_count ?? 4) * (tournament.qualifiers_per_group ?? 2)
      : tournament.format === "league_playoff"
        ? (tournament.playoff_size ?? 4)
        : 0;

  const bracketViewMatches = (() => {
    if (bracketMatches.length > 0) {
      return buildFullKnockoutBracket(bracketMatches as any).map(mapMatchForBracket);
    }
    if (tournament.format === "knockout" && (matches ?? []).length > 0) {
      return buildFullKnockoutBracket((matches ?? []).filter((m) => !m.is_third_place) as any).map(
        mapMatchForBracket
      );
    }
    if (projectedPlayoffTeams >= 2 && leagueStageMatches.length > 0) {
      return buildProjectedKnockoutBracket(projectedPlayoffTeams).map(mapMatchForBracket);
    }
    return [];
  })();

  const leagueViewMatches =
    leagueStageMatches.length > 0
      ? buildLeagueBracketMatches(leagueStageMatches as any).map(mapMatchForBracket)
      : tournament.format === "league"
        ? buildLeagueBracketMatches((matches ?? []) as any).map(mapMatchForBracket)
        : [];

  const completedLeagueMatches = (matches ?? []).filter(
    (m) => m.status === "completed" && m.stage !== "knockout"
  );

  const hasFixtures = (matches ?? []).length > 0;

  const standingsContent = (
    <>
      {tournament.format === "group_knockout" && groupNames.length > 0
        ? groupNames.map((groupName) => (
            <div key={groupName} className="mb-8">
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
                Group {groupName}
              </h2>
              <StandingsTable
                participants={(approvedParticipantsRaw ?? []).filter(
                  (p: any) => p.group_name === groupName
                )}
                matches={(matches ?? []).filter(
                  (m) =>
                    m.status === "completed" && m.stage === "group" && m.group_name === groupName
                )}
              />
            </div>
          ))
        : tournament.format === "group_knockout" && (
            <StandingsTable
              participants={approvedParticipantsRaw ?? []}
              matches={completedLeagueMatches}
            />
          )}

      {(tournament.format === "league" || tournament.format === "league_playoff") && (
        <StandingsTable participants={approvedParticipantsRaw ?? []} matches={completedLeagueMatches} />
      )}

      {(approvedParticipantsRaw ?? []).length === 0 && !hasFixtures && (
        <p className="text-center text-sm text-muted">
          No standings yet — add participants, generate fixtures, and enter match results first.
        </p>
      )}

      {hasFixtures &&
        (approvedParticipantsRaw ?? []).length > 0 &&
        completedLeagueMatches.length === 0 &&
        showStandings && (
          <p className="mt-4 text-center text-sm text-muted">
            Standings will appear here once match results are entered.
          </p>
        )}
    </>
  );

  const fixturesContent = hasFixtures ? (
    <FixturesStepper
      tournamentId={tournament.id}
      tournamentStatus={tournament.status}
      format={tournament.format}
      matches={(matches ?? []) as any}
      participants={participants}
      byeMethod={(tournament.bye_method as "seed" | "random") ?? "seed"}
      thirdPlaceMatch={tournament.third_place_match ?? false}
      groupStandings={groupStandings.map((g) => ({ groupName: g.groupName, standings: g.standings }))}
      qualifiersPerGroup={tournament.qualifiers_per_group ?? 2}
      leagueStandings={leagueStandings as any}
      playoffSize={tournament.playoff_size ?? 4}
    />
  ) : (
    <p className="text-center text-sm text-muted">
      No fixtures generated yet. Use the button above to generate matchups.
    </p>
  );

  const bracketContent = (
    <>
      {!hasFixtures ? (
        <div className="card p-8 text-center text-sm text-muted">
          No bracket yet — generate fixtures first.
        </div>
      ) : (
        <>
          {leagueViewMatches.length > 0 &&
            (tournament.format === "group_knockout" ||
              tournament.format === "league_playoff" ||
              tournament.format === "league") && (
              <div className="mb-8">
                <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
                  {tournament.format === "group_knockout" ? "Group Stage" : "League Stage"}
                </h2>
                <BracketView matches={leagueViewMatches} mode="league" />
              </div>
            )}

          {bracketViewMatches.length > 0 && (
            <div>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
                {bracketViewMatches.some((m) => String(m.id).startsWith("projected-"))
                  ? "Knockout Bracket (Preview)"
                  : "Knockout Bracket"}
              </h2>
              <BracketView matches={bracketViewMatches} mode="knockout" />
            </div>
          )}

          {leagueViewMatches.length === 0 && bracketViewMatches.length === 0 && (
            <div className="card p-8 text-center text-sm text-muted">No bracket generated yet.</div>
          )}
        </>
      )}

      {thirdPlaceMatch && (
        <div className="mt-6">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
            3rd Place Match
          </h2>
          <div className="card flex items-center justify-between p-4 text-sm">
            <span className="font-medium">
              {participants.find((p) => p.id === thirdPlaceMatch.player1_id)?.username ?? "Unknown"}
            </span>
            <span className="text-muted">
              {thirdPlaceMatch.status === "completed"
                ? `${thirdPlaceMatch.player1_score} - ${thirdPlaceMatch.player2_score}`
                : "vs"}
            </span>
            <span className="font-medium">
              {participants.find((p) => p.id === thirdPlaceMatch.player2_id)?.username ?? "Unknown"}
            </span>
          </div>
        </div>
      )}
    </>
  );

  const resolvedTab =
    activeTab === "standings" && !showStandings
      ? "fixtures"
      : activeTab;

  return (
    <InternalTournamentTabs
      tournamentId={tournamentId}
      activeTab={resolvedTab}
      showStandings={showStandings}
      standingsContent={standingsContent}
      fixturesContent={fixturesContent}
      fixtureGenerator={
        <FixtureGenerator
          tournamentId={tournament.id}
          format={tournament.format}
          doubleRound={tournament.double_round}
          participants={participants}
          alreadyGenerated={hasFixtures}
          byeMethod={tournament.bye_method ?? "seed"}
          groupCount={tournament.group_count}
          qualifiersPerGroup={tournament.qualifiers_per_group}
        />
      }
      bracketContent={bracketContent}
      participantsContent={
        <ParticipantsManager
          tournamentId={tournamentId}
          participants={(participantsRaw ?? []) as any}
          allPlayers={allPlayers ?? []}
          maxParticipants={tournament.max_participants}
        />
      }
      editContent={
        <TournamentForm mode="edit" tournamentId={tournament.id} initial={tournament} embedded />
      }
    />
  );
}

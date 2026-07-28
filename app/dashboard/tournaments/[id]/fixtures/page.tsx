import BracketView from "@/app/components/BracketView";
import FixtureGenerator from "@/app/components/dashboard/FixtureGenerator";
import FixturesStepper from "@/app/components/dashboard/FixturesStepper";
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
    .select(
      "id, name, format, double_round, status, bye_method, group_count, qualifiers_per_group, playoff_size, third_place_match"
    )
    .eq("id", id)
    .single();

  if (!tournament) notFound();

  const { data: participantsRaw } = await supabase
    .from("tournament_participants")
    .select("player_id, player_details(id, efootball_username, avatar_url)")
    .eq("tournament_id", id)
    .eq("status", "approved");

  const participants = (participantsRaw ?? [])
    .map((p: any) => {
      const pd = Array.isArray(p.player_details) ? p.player_details[0] : p.player_details;
      // ⚠️ Keep the avatar_url key in snake_case — FixtureRow expects this exact name.
      return pd ? { id: pd.id, username: pd.efootball_username, avatar_url: pd.avatar_url ?? null } : null;
    })
    .filter((p): p is { id: string; username: string; avatar_url: string | null } => !!p);

  const { data: matches } = await supabase
    .from("tournament_matches")
    .select(
      "id, round, match_order, player1_id, player2_id, player1_score, player2_score, winner_id, status, stage, group_name, is_third_place"
    )
    .eq("tournament_id", id)
    .order("round")
    .order("match_order");

  const groupStandings =
    tournament.format === "group_knockout" ? await getGroupStandings(tournament.id) : [];

  // League and league_playoff formats need standings for knockout seeding, and plain
  // league also needs standings to determine the champion when the final round completes.
  const leagueStandings =
    tournament.format === "league_playoff" || tournament.format === "league"
      ? await getTournamentStandings(tournament.id)
      : [];

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

      {(matches ?? []).length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
            Bracket Preview
          </h2>
          <BracketView
            matches={(matches ?? []).map((m: any) => ({
              ...m,
              player1: participants.find((p) => p.id === m.player1_id)
                ? {
                    efootball_username: participants.find((p) => p.id === m.player1_id)!.username,
                    avatar_url: participants.find((p) => p.id === m.player1_id)!.avatar_url,
                  }
                : null,
              player2: participants.find((p) => p.id === m.player2_id)
                ? {
                    efootball_username: participants.find((p) => p.id === m.player2_id)!.username,
                    avatar_url: participants.find((p) => p.id === m.player2_id)!.avatar_url,
                  }
                : null,
            }))}
            mode={tournament.format === "knockout" ? "knockout" : "league"}
          />
        </div>
      )}

      {(matches ?? []).length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">
          No fixtures generated yet. Click the button above to randomly generate matchups.
        </p>
      ) : (
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
      )}
    </div>
  );
}

import BracketView from "@/app/components/BracketView";
import FixtureGenerator from "@/app/components/dashboard/FixtureGenerator";
import FixtureRow from "@/app/components/dashboard/FixtureRow";
import NextRoundGenerator from "@/app/components/dashboard/NextRoundGenerator";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
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
    .select("id, name, format, double_round")
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
    .select("id, round, match_order, player1_id, player2_id, player1_score, player2_score, winner_id, status")
    .eq("tournament_id", id)
    .order("round")
    .order("match_order");

  const rounds = Array.from(new Set((matches ?? []).map((m) => m.round))).sort((a, b) => a - b);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        {tournament.name} — Fixtures
      </h1>
      <p className="mt-1 text-sm text-muted capitalize">
        {tournament.format} format · {participants.length} approved participants
      </p>

      <div className="mt-6">
        <FixtureGenerator
          tournamentId={tournament.id}
          format={tournament.format}
          doubleRound={tournament.double_round}
          participants={participants}
          alreadyGenerated={(matches ?? []).length > 0}
        />
      </div>

      {rounds.length > 0 && (
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

      {rounds.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">
          No fixtures generated yet. Click the button above to randomly generate matchups.
        </p>
      ) : (
        rounds.map((round) => (
          <div key={round} className="mt-8">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
              Round {round}
            </h2>
            <div className="flex flex-col gap-3">
              {(matches ?? [])
                .filter((m) => m.round === round)
                .map((m) => (
                  <FixtureRow key={m.id} match={m} allParticipants={participants} tournamentId={tournament.id} />
                ))}
            </div>
          </div>
        ))
      )}

      {tournament.format === "knockout" && (
        <NextRoundGenerator
          tournamentId={tournament.id}
          matches={matches ?? []}
          allParticipants={participants}
        />
      )}
    </div>
  );
}
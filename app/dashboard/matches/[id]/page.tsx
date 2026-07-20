import { notFound } from "next/navigation";
import MatchResultForm from "@/app/components/dashboard/MatchResultForm";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";

export default async function ManageMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select("id, opponent_name, competition, match_date, status, score_home, score_away")
    .eq("id", id)
    .single();

  if (!match) notFound();

  const { data: players } = await supabase
    .from("player_details")
    .select("id, efootball_username")
    .order("efootball_username");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        {match.opponent_name}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {match.competition ?? "Friendly"} · {new Date(match.match_date).toLocaleString()}
      </p>

      <MatchResultForm
        matchId={match.id}
        currentStatus={match.status}
        currentScoreHome={match.score_home}
        currentScoreAway={match.score_away}
        players={players ?? []}
      />
    </div>
  );
}

import BackLink from "@/app/components/BackLink";
import AddBallonDorNomineeForm from "@/app/components/dashboard/AddBallonDorNomineeForm";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { getTopByPoints } from "@/app/lib/queries/leaderboards";
import { createClient } from "@/app/lib/supabase/server";

export default async function AddBallonDorNomineePage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("player_details")
    .select("id, slug, efootball_username, real_name")
    .eq("membership_status", "active")
    .order("efootball_username");

  const allPlayers = (players ?? []).map((p) => ({
    id: p.id,
    username: p.efootball_username,
    realName: p.real_name ?? null,
  }));

  const top10 = (await getTopByPoints("official", 10)).map((p) => ({
    playerId: p.playerId,
    username: p.username,
    realName: p.realName,
    points: p.points ?? 0,
  }));

  return (
    <div>
      <BackLink href="/dashboard/ballon-dor" label="Back to Ballon d'Or" />
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Add Nominee</h1>
      <p className="mt-1 text-sm text-muted">
        Nominate players for a given year's Ballon d'Or, automatically or manually.
      </p>

      <div className="mt-6 max-w-2xl">
        <AddBallonDorNomineeForm allPlayers={allPlayers} topByPoints={top10} />
      </div>
    </div>
  );
}
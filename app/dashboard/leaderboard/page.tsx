import { getTopScorers, getTopWinRate, getTopMotm, getTopRating } from "@/app/lib/queries/leaderboards";
import LeaderboardTabs from "@/app/components/LeaderboardTabs";
import { requireStaff } from "@/app/lib/queries/dashboard";

export default async function DashboardLeaderboardPage() {
  const { role } = await requireStaff();
  const [goals, winrate, motm, rating] = await Promise.all([
    getTopScorers(),
    getTopWinRate(),
    getTopMotm(),
    getTopRating(),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Leaderboard</h1>
          <p className="mt-1 text-sm text-muted">Admin view for top player rankings and stats.</p>
        </div>
      </div>

      <LeaderboardTabs data={{ goals, winrate, motm, rating }} />
    </div>
  );
}

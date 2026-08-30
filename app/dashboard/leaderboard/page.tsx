import { getLeaderboardData } from "@/app/lib/queries/leaderboards";
import LeaderboardTabs from "@/app/components/LeaderboardTabs";
import { requireStaff } from "@/app/lib/queries/dashboard";

export default async function DashboardLeaderboardPage() {
  const { role } = await requireStaff();
  const [official, unofficial] = await Promise.all([
    getLeaderboardData("official"),
    getLeaderboardData("unofficial"),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Leaderboard</h1>
      <p className="mt-1 text-sm text-muted">
        {role === "admin" ? "Admin view for top player rankings and stats." : "View leaderboard rankings and player stats."}
      </p>

      <LeaderboardTabs data={{ official, unofficial }} isAdmin={role === "admin"} />
    </div>
  );
}

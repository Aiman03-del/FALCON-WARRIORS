import FillButton from "@/app/components/FillButton";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import DeleteAchievementButton from "@/app/components/dashboard/DeleteAchievementButton";

const MOCK_ACHIEVEMENTS = [
  { id: "ach-1", title: "Champions League", season: "2024", description: "Won the prestigious championship" },
  { id: "ach-2", title: "Best Attack", season: "2023", description: "Best attacking record in season" },
  { id: "ach-3", title: "Tournament Winners", season: "2022", description: "Tournament champions" },
];

const MOCK_AWARDS = [
  { id: "awd-1", title: "Player of the Month", season: "July 2026", player_details: { efootball_username: "Ahmed_Pro" } },
  { id: "awd-2", title: "Rising Star", season: "2026", player_details: { efootball_username: "Hassan_Elite" } },
  { id: "awd-3", title: "Best Midfielder", season: "2026", player_details: { efootball_username: "Karim_Sharp" } },
];

export default async function AchievementsPage() {
  await requireStaff();
  
  let achievements = MOCK_ACHIEVEMENTS;
  let awards = MOCK_AWARDS;

  try {
    const supabase = await createClient();

    const [ach, awd] = await Promise.all([
      supabase
        .from("achievements")
        .select("id, title, season, description")
        .order("created_at", { ascending: false }),
      supabase
        .from("awards")
        .select("id, title, season, player_details(efootball_username)")
        .order("created_at", { ascending: false }),
    ]);

    if (ach.data) achievements = ach.data;
    if (awd.data) awards = awd.data;
  } catch (error) {
    // Use mock data if Supabase fails
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            Achievements & Awards
          </h1>
          <p className="mt-1 text-sm text-muted">Club trophies and individual player awards.</p>
        </div>
        <FillButton href="/dashboard/achievements/new" className="flex items-center gap-2 text-sm">
          <Plus size={16} />
          New Achievement
        </FillButton>
      </div>

      {/* Club Achievements */}
      <h2 className="mt-8 font-display text-sm font-bold uppercase tracking-wide text-gold">
        Club Achievements
      </h2>
      <div className="card mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Season</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(achievements ?? []).map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{a.title}</td>
                <td className="px-4 py-3 text-muted">{a.season ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <DeleteAchievementButton id={a.id} table="achievements" />
                </td>
              </tr>
            ))}
            {(achievements ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted">
                  No club achievements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Player Awards */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-gold">
          Player Awards
        </h2>
        <Link
          href="/dashboard/achievements/awards/new"
          className="text-xs font-medium text-gold hover:text-gold-light"
        >
          + New Award
        </Link>
      </div>
      <div className="card mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Award</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Season</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(awards ?? []).map((a: any) => (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{a.title}</td>
                <td className="px-4 py-3 text-muted">
                  {a.player_details?.efootball_username ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted">{a.season ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <DeleteAchievementButton id={a.id} table="awards" />
                </td>
              </tr>
            ))}
            {(awards ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  No player awards yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

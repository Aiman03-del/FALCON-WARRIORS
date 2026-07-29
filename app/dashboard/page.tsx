import { Users, Swords, Trophy, Newspaper } from "lucide-react";
import { requireStaff } from "../lib/queries/dashboard";
import { createClient } from "../lib/supabase/server";

export default async function DashboardOverview() {
  await requireStaff();
  const supabase = await createClient();

  const [playersRes, officialMatchesRes, internalMatchesRes, tournamentsRes, newsRes] =
    await Promise.all([
      supabase.from("player_details").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }),
      supabase.from("tournament_matches").select("*", { count: "exact", head: true }),
      supabase.from("tournaments").select("*", { count: "exact", head: true }),
      supabase.from("news").select("*", { count: "exact", head: true }),
    ]);

  const fetchError =
    playersRes.error ||
    officialMatchesRes.error ||
    internalMatchesRes.error ||
    tournamentsRes.error ||
    newsRes.error;

  const users = playersRes.count ?? 0;
  const matches = (officialMatchesRes.count ?? 0) + (internalMatchesRes.count ?? 0);
  const tournaments = tournamentsRes.count ?? 0;
  const news = newsRes.count ?? 0;

  const cards = [
    { label: "Total Players", value: users, icon: Users },
    { label: "Total Matches", value: matches, icon: Swords },
    { label: "Tournaments", value: tournaments, icon: Trophy },
    { label: "News Posts", value: news, icon: Newspaper },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Dashboard Overview
      </h1>
      <p className="mt-1 text-sm text-muted">Club-wide stats at a glance.</p>

      {fetchError && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to load some stats: {fetchError.message}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-3 sm:p-4 lg:p-5">
            <c.icon className="text-gold" size={18} />
            <p className="mt-2 font-display text-2xl sm:text-3xl font-bold">{c.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
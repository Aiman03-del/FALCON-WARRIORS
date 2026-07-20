
import { Users, Swords, Trophy, Newspaper } from "lucide-react";
import { requireStaff } from "../lib/queries/dashboard";
import { createClient } from "../lib/supabase/server";

export default async function DashboardOverview() {
  await requireStaff();
  const supabase = await createClient();

  const [{ count: users }, { count: matches }, { count: tournaments }, { count: news }] =
    await Promise.all([
      supabase.from("player_details").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }),
      supabase.from("tournaments").select("*", { count: "exact", head: true }),
      supabase.from("news").select("*", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "Total Players", value: users ?? 0, icon: Users },
    { label: "Total Matches", value: matches ?? 0, icon: Swords },
    { label: "Tournaments", value: tournaments ?? 0, icon: Trophy },
    { label: "News Posts", value: news ?? 0, icon: Newspaper },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Dashboard Overview
      </h1>
      <p className="mt-1 text-sm text-muted">Club-wide stats at a glance.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <c.icon className="text-gold" size={20} />
            <p className="mt-3 font-display text-3xl font-bold">{c.value}</p>
            <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
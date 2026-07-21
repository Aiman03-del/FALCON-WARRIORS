import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import BackLink from "@/app/components/BackLink";
import BallonDorActions from "@/app/components/dashboard/BallonDorActions";

export default async function BallonDorDashboardPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: nominees } = await supabase
    .from("ballon_dor_nominees")
    .select("id, year, is_winner, player_details(id, efootball_username, avatar_url)")
    .order("year", { ascending: false });

  const grouped = (nominees ?? []).reduce((acc: Record<number, any[]>, n: any) => {
    acc[n.year] = acc[n.year] ?? [];
    acc[n.year].push(n);
    return acc;
  }, {});

  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div>
      <BackLink href="/dashboard" label="Back to Dashboard" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Ballon d'Or</h1>
          <p className="mt-1 text-sm text-muted">Manage yearly nominees and winners.</p>
        </div>
        <Link href="/dashboard/ballon-dor/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          Add Nominee
        </Link>
      </div>

      {years.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">No nominees added yet.</p>
      ) : (
        years.map((year) => (
          <div key={year} className="mt-8">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
              {year}
            </h2>
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[year].map((n: any) => {
                    const player = Array.isArray(n.player_details) ? n.player_details[0] : n.player_details;
                    return (
                      <tr key={n.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium">{player?.efootball_username ?? "—"}</td>
                        <td className="px-4 py-3">
                          {n.is_winner ? (
                            <span className="flex items-center gap-1 text-xs font-bold uppercase text-gold">
                              <Star size={13} fill="currentColor" />
                              Winner
                            </span>
                          ) : (
                            <span className="text-xs text-muted">Nominee</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <BallonDorActions id={n.id} isWinner={n.is_winner} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
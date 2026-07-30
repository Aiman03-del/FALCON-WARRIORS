import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/client";
import BackLink from "@/app/components/BackLink";

export default async function OfficialTournamentMatchesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireStaff();
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tournamentBySlug } = await supabase
    .from("tournaments")
    .select("id, slug, name, type")
    .eq("slug", slug)
    .single();

  if (!tournamentBySlug) notFound();

  const id = tournamentBySlug.id;

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, slug, name, type")
    .eq("id", id)
    .single();

  if (!tournament || tournament.type !== "official") notFound();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, slug, opponent_name, round_stage, match_date, status, score_home, score_away")
    .eq("tournament_id", id)
    .order("match_date", { ascending: true });

  return (
    <div>
      <BackLink href={`/dashboard/tournaments/${tournament.slug ?? id}`} label="Back to Tournament" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            {tournament.name} — Matches
          </h1>
          <p className="mt-1 text-sm text-muted">Add and manage matches for this tournament.</p>
        </div>
        <Link
          href={`/dashboard/tournaments/${tournament.slug ?? id}/matches/new`}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Add Match
        </Link>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Opponent</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(matches ?? []).map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">vs {m.opponent_name}</td>
                <td className="px-4 py-3 text-muted">{m.round_stage ?? "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {new Date(m.match_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {m.score_home !== null ? `${m.score_home} - ${m.score_away}` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/matches/${m.slug ?? m.id}`}
                    className="text-xs font-medium text-gold hover:text-gold-light"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
            {(matches ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No matches added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
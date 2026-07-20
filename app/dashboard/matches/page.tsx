import FillButton from "@/app/components/FillButton";
import DeleteMatchButton from "@/app/components/dashboard/DeleteMatchButton";
import Link from "next/link";
import { Edit3, Plus } from "lucide-react";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";

const statusStyles: Record<string, string> = {
  upcoming: "bg-white/10 text-muted",
  live: "bg-red-500/15 text-red-400",
  completed: "bg-indigo/20 text-indigo-light",
};

export default async function MatchesPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent_name, competition, match_date, status, score_home, score_away")
    .order("match_date", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            Matches
          </h1>
          <p className="mt-1 text-sm text-muted">Schedule fixtures and enter results.</p>
        </div>
        <FillButton href="/dashboard/matches/new" className="flex items-center gap-2 text-sm">
          <Plus size={16} />
          New Match
        </FillButton>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Opponent</th>
              <th className="px-4 py-3">Competition</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(matches ?? []).map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/dashboard/matches/${m.id}`}
                    className="text-gold transition hover:text-gold-light"
                  >
                    {m.opponent_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{m.competition ?? "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {new Date(m.match_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {m.score_home !== null ? `${m.score_home} - ${m.score_away}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyles[m.status]}`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/dashboard/matches/${m.id}`}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-gold transition hover:bg-gold/10 hover:text-gold-light"
                      aria-label="Edit match"
                    >
                      <Edit3 size={16} />
                    </Link>
                    <DeleteMatchButton id={m.id} />
                  </div>
                </td>
              </tr>
            ))}
            {(matches ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No matches yet. Create your first fixture.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
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

const MOCK_DASHBOARD_MATCHES = [
  { id: "ext-3", opponent_name: "Tiger Squad", opponent_logo_url: "https://via.placeholder.com/40?text=TGR", competition: "International League", match_date: "2026-07-21", status: "completed", score_home: 3, score_away: 1, match_type: "external", tournament_id: null },
  { id: "ext-2", opponent_name: "Golden Hawks", opponent_logo_url: "https://via.placeholder.com/40?text=GHA", competition: "International League", match_date: "2026-07-18", status: "completed", score_home: 4, score_away: 2, match_type: "external", tournament_id: null },
  { id: "ext-1", opponent_name: "Silver Strikers", opponent_logo_url: "https://via.placeholder.com/40?text=SLS", competition: "Champions Cup", match_date: "2026-07-15", status: "completed", score_home: 2, score_away: 2, match_type: "external", tournament_id: null },
  { id: "fix-1", opponent_name: "Phoenix FC", opponent_logo_url: "https://via.placeholder.com/40?text=PHX", competition: "International League", match_date: "2026-07-28", status: "upcoming", score_home: null, score_away: null, match_type: "external", tournament_id: null },
  { id: "fix-2", opponent_name: "Dragon United", opponent_logo_url: "https://via.placeholder.com/40?text=DGN", competition: "Champions Cup", match_date: "2026-07-31", status: "upcoming", score_home: null, score_away: null, match_type: "external", tournament_id: null },
];

export default async function MatchesPage({
  searchParams,
}: {
  searchParams?: { type?: string };
}) {
  await requireStaff();
  
  const typeFilter = searchParams?.type ?? null;
  let matches = MOCK_DASHBOARD_MATCHES;

  try {
    const supabase = await createClient();

    let query = supabase
      .from("matches")
      .select(
        "id, opponent_name, opponent_logo_url, competition, match_date, status, score_home, score_away, match_type, tournament_id"
      )
      .order("match_date", { ascending: false });

    if (typeFilter === "internal") {
      query = query.eq("match_type", "internal");
    } else if (typeFilter === "external") {
      query = query.eq("match_type", "external");
    } else if (typeFilter === "official") {
      query = query.not("tournament_id", "is", null);
    } else if (typeFilter === "friendly") {
      query = query.is("tournament_id", null).neq("match_type", "internal");
    }

    const { data: supabaseMatches } = await query;
    if (supabaseMatches) {
      matches = supabaseMatches;
    }
  } catch (error) {
    // Use mock data if Supabase fails
  }

  // Filter mock data by type
  if (typeFilter === "internal") {
    matches = matches.filter(m => m.match_type === "internal");
  } else if (typeFilter === "external") {
    matches = matches.filter(m => m.match_type === "external");
  } else if (typeFilter === "official") {
    matches = matches.filter(m => m.tournament_id !== null);
  } else if (typeFilter === "friendly") {
    matches = matches.filter(m => m.tournament_id === null && m.match_type !== "internal");
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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


      <div className="card mt-6 overflow-x-auto min-w-0">
        <table className="min-w-full w-full text-left text-sm">
          <thead className="hidden border-b border-border text-xs uppercase text-muted md:table-header-group">
            <tr className="md:table-row">
              <th className="hidden px-4 py-3 md:table-cell">Opponent</th>
              <th className="hidden px-4 py-3 md:table-cell">Competition</th>
              <th className="hidden px-4 py-3 md:table-cell">Date</th>
              <th className="hidden px-4 py-3 md:table-cell">Score</th>
              <th className="hidden px-4 py-3 md:table-cell">Status</th>
              <th className="hidden px-4 py-3 md:table-cell"></th>
            </tr>
          </thead>
          <tbody className="md:table-row-group">
            {(matches ?? []).map((m) => (
              <tr key={m.id} className="block border-b border-border last:border-0 md:table-row">
                <td className="block px-4 py-3 md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Opponent
                  </span>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/dashboard/matches/${m.id}`}
                      className="text-gold transition hover:text-gold-light"
                    >
                      {m.opponent_name}
                    </Link>
                    <span
                      className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        m.match_type === "internal"
                          ? "bg-purple-500/15 text-purple-300"
                          : m.tournament_id
                          ? "bg-gold/15 text-gold"
                          : "bg-white/10 text-muted"
                      }`}
                    >
                      {m.match_type === "internal" ? "Internal" : m.tournament_id ? "Official" : "Friendly"}
                    </span>
                  </div>
                </td>
                <td className="block px-4 py-3 text-muted md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Competition
                  </span>
                  {m.competition ?? "—"}
                </td>
                <td className="block px-4 py-3 text-muted md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Date
                  </span>
                  {new Date(m.match_date).toLocaleDateString()}
                </td>
                <td className="block px-4 py-3 md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Score
                  </span>
                  {m.score_home !== null ? `${m.score_home} - ${m.score_away}` : "—"}
                </td>
                <td className="block px-4 py-3 md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Status
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyles[m.status]}`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="block px-4 py-3 text-right md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Actions
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-2 md:justify-end">
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
              <tr className="block md:table-row">
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

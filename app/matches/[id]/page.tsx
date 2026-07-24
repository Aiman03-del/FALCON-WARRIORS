import { notFound } from "next/navigation";
import Link from "next/link";
import { getMatchDetail } from "@/app/lib/queries/matchDetail";
import { getPlayerH2H, getClubH2H } from "@/app/lib/queries/h2h";
import Navbar from "@/app/components/Navbar";
import MatchScoreHeader from "@/app/components/MatchScoreHeader";
import H2HSummary from "@/app/components/H2HSummary";
import Footer from "@/app/components/Footer";
function unwrap<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getMatchDetail(id);

  if (!data) notFound();
  const {
    match,
    playedBy,
    goalEntries,
    motmName,
  } = data as {
    match: any;
    playedBy: any | null;
    goalEntries: { player_id: string; goals: number; efootball_username: string }[];
    motmName: string | null;
  };

  const isInternal = match.match_type === "internal";
  const p1 = unwrap(match.player1 as any);
  const p2 = unwrap(match.player2 as any);
  const tournament = unwrap(match.tournament as any);

  const home = isInternal
    ? { name: p1?.efootball_username ?? "Player 1", avatarUrl: p1?.avatar_url }
    : { name: "Falcon Warriors", isFalcon: true };

  const away = isInternal
    ? { name: p2?.efootball_username ?? "Player 2", avatarUrl: p2?.avatar_url }
    : { name: match.opponent_name ?? "Opponent", avatarUrl: match.opponent_logo_url };

  const h2h = isInternal && p1?.id && p2?.id
    ? await getPlayerH2H(p1.id, p2.id, match.id)
    : !isInternal && match.opponent_name
    ? await getClubH2H(match.opponent_name, match.id)
    : null;

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-2xl px-6 py-14">
        <Link
          href="/matches"
          className="mb-6 inline-block text-sm font-medium text-muted hover:text-white"
        >
          ← Back to Matches
        </Link>

        <MatchScoreHeader
          home={home}
          away={away}
          scoreHome={match.score_home}
          scoreAway={match.score_away}
          status={match.status}
          competition={match.competition}
          roundStage={match.round_stage}
          matchDate={match.match_date}
        />

        {tournament && (
          <Link
            href={`/tournaments/${tournament.id}`}
            className="mt-4 block text-center text-sm text-gold hover:text-gold-light"
          >
            Part of {tournament.name} →
          </Link>
        )}

        {!isInternal && match.status === "completed" && (
          <div className="mt-8">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
              Match Details
            </h2>
            <div className="card flex flex-col divide-y divide-border">
              {playedBy && (
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-muted">Played By</span>
                  <span className="font-medium">{playedBy.efootball_username}</span>
                </div>
              )}
              {goalEntries.length > 0 && (
                <div className="px-4 py-3">
                  <p className="mb-2 text-sm text-muted">Goal Scorers</p>
                  <div className="flex flex-col gap-1.5">
                    {goalEntries.map((g) => (
                      <div key={g.player_id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{g.efootball_username}</span>
                        <span className="text-gold">
                          {g.goals} {g.goals === 1 ? "goal" : "goals"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {motmName && (
          <div className="mt-6 card flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted">Man of the Match</span>
            <span className="text-sm font-bold text-gold">{motmName}</span>
          </div>
        )}

        {h2h && (
          <div className="mt-8">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
              Head-to-Head
            </h2>
            <H2HSummary h2h={h2h} homeLabel={home.name} awayLabel={away.name} />
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
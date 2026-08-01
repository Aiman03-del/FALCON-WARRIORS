import { notFound } from "next/navigation";
import Link from "next/link";
import { getMatchDetail } from "@/app/lib/queries/matchDetail";
import { getPublicMatchDetail } from "@/app/lib/queries/tournaments";
import { getPlayerH2H, getClubH2H } from "@/app/lib/queries/h2h";
import Navbar from "@/app/components/Navbar";
import PublicMatchBoard from "@/app/components/PublicMatchBoard";
import InternalMatchBoard from "@/app/components/InternalMatchBoard";
import H2HSummary from "@/app/components/H2HSummary";
import Footer from "@/app/components/Footer";

function unwrap<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getMatchDetail(slug);

  if (!data) notFound();
  const { match, playedBy, goalEntries, motmName } = data as {
    match: any;
    playedBy: any | null;
    goalEntries: { player_id: string; goals: number; efootball_username: string; real_name: string | null }[];
    motmName: string | null;
  };

  const isInternal = match.match_type === "internal";
  const p1 = unwrap(match.player1 as any);
  const p2 = unwrap(match.player2 as any);
  const tournament = unwrap(match.tournament as any);

  const home = isInternal
    ? { name: p1?.real_name?.trim() || p1?.efootball_username || "Player 1", avatarUrl: p1?.avatar_url }
    : { name: "Falcon Warriors", isFalcon: true };

  const away = isInternal
    ? { name: p2?.real_name?.trim() || p2?.efootball_username || "Player 2", avatarUrl: p2?.avatar_url }
    : { name: match.opponent_name ?? "Opponent", avatarUrl: match.opponent_logo_url };

  const h2h = isInternal && p1?.id && p2?.id
    ? await getPlayerH2H(p1.id, p2.id, match.id)
    : !isInternal && match.opponent_name
    ? await getClubH2H(match.opponent_name, match.id)
    : null;

  // অফিসিয়াল ম্যাচে টুর্নামেন্ট পেজের মতোই একদম একই বোর্ড দেখাতে, একই কোয়েরি
  // (getPublicMatchDetail) ও একই কম্পোনেন্ট (PublicMatchBoard) রিইউজ করা হচ্ছে
  const publicBoardData = !isInternal && match.slug ? await getPublicMatchDetail(match.slug) : null;

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-2xl px-6 py-14">
        <Link href="/matches" className="mb-6 inline-block text-sm font-medium text-muted hover:text-white">
          ← Back to Matches
        </Link>

        {publicBoardData ? (
          <PublicMatchBoard match={publicBoardData} />
        ) : isInternal ? (
          <InternalMatchBoard
            home={home}
            away={away}
            scoreHome={match.score_home}
            scoreAway={match.score_away}
            status={match.status}
            roundStage={match.round_stage}
            matchDate={match.match_date}
            goalEntries={goalEntries}
            motmName={motmName}
          />
        ) : null}

        {tournament && (
          <Link
            href={`/tournaments/${tournament.slug ?? tournament.id}`}
            className="mt-4 block text-center text-sm text-gold hover:text-gold-light"
          >
            Part of {tournament.name} →
          </Link>
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
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PublicMatchBoard from "@/app/components/PublicMatchBoard";
import InternalMatchBoard from "@/app/components/InternalMatchBoard";
import { getPublicMatchDetail, getInternalTournamentMatchDetail } from "@/app/lib/queries/tournaments";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function PublicMatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string; matchSlug: string }>;
}) {
  const { slug, matchSlug } = await params;

  // first lookup is in the "matches" table (official/club matches)
  const match = await getPublicMatchDetail(matchSlug);

  if (match) {
    return (
      <main>
        <Navbar />
        <section className="mx-auto max-w-3xl px-6 py-14">
          <Link
            href={`/tournaments/${slug}`}
            className="mb-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-white"
          >
            <ChevronLeft size={14} />
            Back to Tournament
          </Link>

          <PublicMatchBoard match={match} />
        </section>
        <Footer />
      </main>
    );
  }

  // if not found, lookup in the "tournament_matches" table (internal 1v1 bracket matches)
  const internalMatch = await getInternalTournamentMatchDetail(matchSlug);

  if (!internalMatch) notFound();

  const home = {
    name:
      internalMatch.player1?.real_name?.trim() ||
      internalMatch.player1?.efootball_username ||
      "Player 1",
    avatarUrl: internalMatch.player1?.avatar_url,
  };
  const away = {
    name:
      internalMatch.player2?.real_name?.trim() ||
      internalMatch.player2?.efootball_username ||
      "Player 2",
    avatarUrl: internalMatch.player2?.avatar_url,
  };

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-2xl px-6 py-14">
        <Link
          href={`/tournaments/${slug}`}
          className="mb-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-white"
        >
          <ChevronLeft size={14} />
          Back to Tournament
        </Link>

        <InternalMatchBoard
          home={home}
          away={away}
          scoreHome={internalMatch.player1_score}
          scoreAway={internalMatch.player2_score}
          status={internalMatch.status}
          roundStage={internalMatch.stage ?? internalMatch.group_name}
          matchDate={internalMatch.created_at}
          goalEntries={[]}
          motmName={null}
        />

        {internalMatch.tournament && (
          <Link
            href={`/tournaments/${internalMatch.tournament.slug}`}
            className="mt-4 block text-center text-sm text-gold hover:text-gold-light"
          >
            Part of {internalMatch.tournament.name} →
          </Link>
        )}
      </section>
      <Footer />
    </main>
  );
}
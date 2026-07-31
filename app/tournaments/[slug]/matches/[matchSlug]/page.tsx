import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PublicMatchBoard from "@/app/components/PublicMatchBoard";
import { getPublicMatchDetail } from "@/app/lib/queries/tournaments";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function PublicMatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string; matchSlug: string }>;
}) {
  const { slug, matchSlug } = await params;
  const match = await getPublicMatchDetail(matchSlug);

  if (!match) notFound();

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
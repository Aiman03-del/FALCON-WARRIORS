import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import Link from "next/link";
import RecentResultsGrid from "./RecentResultsGrid";

type Result = {
  id: string;
  slug?: string | null;
  competition: string;
  isOfficial?: boolean;
  opponent: string;
  opponentTag: string;
  opponentLogoUrl?: string | null;
  scoreHome: number;
  scoreAway: number;
  matchDate?: string;
  result: "WIN" | "DRAW" | "LOSS";
};

export default async function RecentResults({ results }: { results: Result[] }) {
  const { logoUrl } = await getSiteSettings();

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="section-divider" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wide sm:text-2xl">
              Recent Results
            </h2>
          </div>
          <Link
            href="/matches"
            className="text-sm font-medium text-gold hover:text-gold-light"
          >
            View All →
          </Link>
        </div>

        <RecentResultsGrid results={results} logoUrl={logoUrl} />
      </div>
    </section>
  );
}
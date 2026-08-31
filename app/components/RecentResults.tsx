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
    <section className="relative border-b bg-[var(--fw-bg-primary)]" style={{ borderColor: 'var(--fw-border)' }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_center,rgba(91,117,255,0.1),transparent_62%)]" />

      <div className="relative fw-container fw-section">
        <div className="mb-8 flex flex-col gap-4 sm:mb-9 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--fw-brand)] sm:text-[11px]">
              RECENT RESULTS
            </p>
            <h2 className="font-display text-3xl font-black uppercase tracking-[-0.04em] text-[var(--fw-text-primary)] sm:text-4xl lg:text-[2.8rem]">
              OUR LATEST BATTLES
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--fw-text-secondary)] sm:text-base">
              Latest competitive matches from the Warriors.
            </p>
          </div>

          <Link
            href="/matches"
            className="inline-flex items-center gap-2 self-start text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--fw-text-primary)] transition-colors duration-200 hover:text-[var(--fw-brand)] md:self-end"
          >
            View all matches <span aria-hidden="true">→</span>
          </Link>
        </div>

        <RecentResultsGrid results={results} logoUrl={logoUrl} />
      </div>
    </section>
  );
}
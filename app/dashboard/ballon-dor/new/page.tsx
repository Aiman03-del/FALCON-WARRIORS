import Footer from "@/app/components/Footer";
import LeaderboardTabs from "@/app/components/LeaderboardTabs";
import Navbar from "@/app/components/Navbar";
import PeriodPerformerCard from "@/app/components/PeriodPerformerCard";
import { getTopScorers } from "@/app/lib/queries/leaderboards";

export default async function LeaderboardsPage() {
  const goals = await getTopScorers();

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="section-divider" />
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
          Leaderboards
        </h1>
        <p className="mt-2 text-sm text-muted">
          Club-wide rankings across goals, win rate, and standout performances.
        </p>

        <div className="mt-8">
          <PeriodPerformerCard />
        </div>

        <div className="mt-8">
          <LeaderboardTabs data={{ goals }} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
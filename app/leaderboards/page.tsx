import type { Metadata } from "next";
import Footer from "../components/Footer";
import LeaderboardTabs from "../components/LeaderboardTabs";
import Navbar from "../components/Navbar";
import PeriodPerformerCard from "../components/PeriodPerformerCard";
import { getLeaderboardData } from "../lib/queries/leaderboards";

export const metadata: Metadata = {
  title: "Leaderboards | Falcon Warriors - Player Rankings",
  description: "Player leaderboards and rankings - top scorers, win rates, man of the match, and ratings.",
};

export default async function LeaderboardsPage() {
  const [official, unofficial] = await Promise.all([
    getLeaderboardData("official"),
    getLeaderboardData("unofficial"),
  ]);

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
          <LeaderboardTabs data={{ official, unofficial }} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
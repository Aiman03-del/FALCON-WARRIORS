import type { Metadata } from "next";
import AchievementsTicker from "./components/AchievementsTicker";
import AssociatedCommunities from "./components/AssociatedCommunities";
import ClubCTA from "./components/ClubCTA";
import FixturesAndPerformers from "./components/FixturesAndPerformers";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Hero from "./components/Hero";
import LatestNews from "./components/LatestNews";
import Navbar from "./components/Navbar";
import RecentResults from "./components/RecentResults";
import StatsBar from "./components/StatsBar";
import { getAssociatedCommunities } from "./lib/queries/communities";
import { getAchievements, getGallery, getLatestNews, getRecentResults, getRunningTournaments, getStats, getTopPerformers } from "./lib/queries/home";

export const metadata: Metadata = {
  title: "Falcon Warriors | Home - Elite eFootball Club",
  description: "Welcome to Falcon Warriors. View our latest tournaments, match results, fixtures, and player achievements.",
  openGraph: {
    title: "Falcon Warriors | Home - Elite eFootball Club",
    description: "Welcome to Falcon Warriors. View our latest tournaments, match results, fixtures, and player achievements.",
  },
};

export default async function Home() {
  const [stats, results, runningTournaments, performers, achievements, news, gallery, communities] =
    await Promise.all([
      getStats(),
      getRecentResults(),
      getRunningTournaments(),
      getTopPerformers(),
      getAchievements(),
      getLatestNews(),
      getGallery(),
      getAssociatedCommunities(),
    ]);

  return (
    <main>
      <Navbar />
      <Hero />
      <StatsBar stats={stats} />
      <AssociatedCommunities communities={communities} />
      <RecentResults results={results} />
      <FixturesAndPerformers tournaments={runningTournaments} performers={performers} />
      <AchievementsTicker achievements={achievements} />
      <LatestNews news={news} />
      <Gallery items={gallery} />
      <ClubCTA />
      <Footer />
    </main>
  );
}

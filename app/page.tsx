import AchievementsTicker from "./components/AchievementsTicker";
import FixturesAndPerformers from "./components/FixturesAndPerformers";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Hero from "./components/Hero";
import LatestNews from "./components/LatestNews";
import Navbar from "./components/Navbar";
import RecentResults from "./components/RecentResults";
import StatsBar from "./components/StatsBar";
import { getAchievements, getFixtures, getGallery, getLatestNews, getRecentResults, getStats, getTopPerformers } from "./lib/queries/home";


export default async function Home() {
  const [stats, results, fixtures, performers, achievements, news, gallery] =
    await Promise.all([
      getStats(),
      getRecentResults(),
      getFixtures(),
      getTopPerformers(),
      getAchievements(),
      getLatestNews(),
      getGallery(),
    ]);

  return (
    <main>
      <Navbar />
      <Hero />
      <StatsBar stats={stats} />
      <RecentResults results={results} />
      <FixturesAndPerformers fixtures={fixtures} performers={performers} />
      <AchievementsTicker achievements={achievements} />
      <LatestNews news={news} />
      <Gallery items={gallery} />
      <Footer />
    </main>
  );
}
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import { MatchResultCard, NewsResultCard, PlayerResultCard } from "../components/SearchResultCard";
import { globalSearch } from "../lib/queries/search";


export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";
  const results = query ? await globalSearch(query) : { players: [], matches: [], news: [] };

  const totalResults = results.players.length + results.matches.length + results.news.length;

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="section-divider" />
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Search</h1>

        <div className="mt-6 max-w-xl">
          <SearchBar />
        </div>

        {!query ? (
          <p className="mt-10 text-sm text-muted">
            Search for players, matches, or news articles.
          </p>
        ) : totalResults === 0 ? (
          <p className="mt-10 text-sm text-muted">
            No results found for <span className="text-white">"{query}"</span>.
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-10">
            {results.players.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
                  Players ({results.players.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {results.players.map((p) => (
                    <PlayerResultCard key={p.id} player={p} />
                  ))}
                </div>
              </div>
            )}

            {results.matches.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
                  Matches ({results.matches.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {results.matches.map((m) => (
                    <MatchResultCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            )}

            {results.news.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
                  News ({results.news.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {results.news.map((n) => (
                    <NewsResultCard key={n.id} news={n} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
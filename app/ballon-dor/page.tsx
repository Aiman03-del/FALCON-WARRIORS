import Image from "next/image";
import Link from "next/link";
import { Trophy, Star } from "lucide-react";
import { getBallonDorData } from "../lib/queries/ballonDor";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default async function BallonDorPage() {
  const { grouped, years } = await getBallonDorData();

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="section-divider" />
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
          Ballon d'Or
        </h1>
        <p className="mt-2 text-sm text-muted">
          Falcon Warriors' most prestigious individual honor — awarded each year to the club's
          standout player.
        </p>

        {years.length === 0 ? (
          <p className="mt-10 text-sm text-muted">No Ballon d'Or history yet.</p>
        ) : (
          years.map((year) => {
            const nominees = grouped[year];
            const winner = nominees.find((n: any) => n.is_winner);
            const others = nominees.filter((n: any) => !n.is_winner);

            return (
              <div key={year} className="mt-10">
                <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-gold">
                  {year}
                </h2>

                {winner && (
                  <Link
                    href={`/players/${winner.player_details.slug ?? winner.player_details.id}`}
                    className="card mb-4 flex items-center gap-4 border-gold/40 bg-gradient-to-r from-gold/10 to-surface p-6"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gold bg-surface-2">
                      {winner.player_details.avatar_url ? (
                        <Image
                          src={winner.player_details.avatar_url}
                          alt={winner.player_details.efootball_username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-gold">
                          {winner.player_details.efootball_username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gold">
                        <Trophy size={14} />
                        Winner
                      </p>
                      <p className="mt-1 text-xl font-semibold">
                        {winner.player_details.efootball_username}
                      </p>
                    </div>
                  </Link>
                )}

                {others.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                      Nominees
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {others.map((n: any) => (
                        <Link
                          key={n.id}
                          href={`/players/${n.player_details.slug ?? n.player_details.id}`}
                          className="card flex items-center gap-3 p-3"
                        >
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-2">
                            {n.player_details.avatar_url ? (
                              <Image
                                src={n.player_details.avatar_url}
                                alt={n.player_details.efootball_username}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-gold">
                                {n.player_details.efootball_username.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {n.player_details.efootball_username}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
      <Footer />
    </main>
  );
}
import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Trophy, Medal, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Achievements | Falcon Warriors - Hall of Fame",
  description: "Club trophies and individual player awards — the hall of fame of Falcon Warriors eFootball club.",
};

export default async function AchievementsPage() {
  const supabase = await createClient();

  const [{ data: achievements }, { data: awards }] = await Promise.all([
    supabase
      .from("achievements")
      .select("id, title, season, description")
      .order("created_at", { ascending: false }),
    supabase
      .from("awards")
      .select("id, title, season, player_details(efootball_username)")
      .order("created_at", { ascending: false }),
  ]);

  const clubTrophies = achievements ?? [];
  const playerAwards = awards ?? [];

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 via-surface to-surface p-6 text-center sm:p-10">
          <div className="absolute inset-0 bg-hero-grid bg-[size:30px_30px] opacity-20" />
          <div className="absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-gold/15 blur-[60px]" />
          <div className="relative">
            <Trophy className="mx-auto text-gold" size={40} />
            <h1 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
              Hall of Fame
            </h1>
            <p className="mt-2 text-sm text-muted">
              {clubTrophies.length} club trophies · {playerAwards.length} player awards
            </p>
          </div>
        </div>

        {/* Club Achievements */}
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="text-gold" size={18} />
            <h2 className="font-display text-lg font-bold uppercase tracking-widest text-gold">
              Club Trophies
            </h2>
          </div>

          {clubTrophies.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 py-10 text-center">
              <Trophy size={32} className="text-muted/30" />
              <p className="text-sm text-muted">No achievements recorded yet. The journey begins.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clubTrophies.map((a) => (
                <div
                  key={a.id}
                  className="card relative overflow-hidden p-5 transition-colors hover:border-gold/30"
                >
                  {/* Gold corner glow */}
                  <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-gold/10 blur-lg" />
                  <div className="relative">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15">
                      <Trophy className="text-gold" size={18} />
                    </div>
                    <h3 className="font-display text-base font-bold uppercase tracking-wide">
                      {a.title}
                    </h3>
                    {a.season && (
                      <p className="mt-1 text-xs font-medium text-gold/80">Season {a.season}</p>
                    )}
                    {a.description && (
                      <p className="mt-2 text-xs leading-relaxed text-muted">{a.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Player Awards */}
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Medal className="text-indigo-light" size={18} />
            <h2 className="font-display text-lg font-bold uppercase tracking-widest text-indigo-light">
              Player Awards
            </h2>
          </div>

          {playerAwards.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 py-10 text-center">
              <Star size={32} className="text-muted/30" />
              <p className="text-sm text-muted">No individual awards yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playerAwards.map((a: any) => (
                <div
                  key={a.id}
                  className="card relative overflow-hidden p-5 transition-colors hover:border-indigo/30"
                >
                  <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-indigo/10 blur-lg" />
                  <div className="relative">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo/15">
                      <Medal className="text-indigo-light" size={18} />
                    </div>
                    <h3 className="font-display text-base font-bold uppercase tracking-wide">
                      {a.title}
                    </h3>
                    {a.player_details?.efootball_username && (
                      <p className="mt-1 text-xs font-medium text-indigo-light">
                        {a.player_details.efootball_username}
                      </p>
                    )}
                    {a.season && (
                      <p className="mt-1 text-xs text-muted">Season {a.season}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

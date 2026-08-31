import Image from "next/image";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PlayersTabs from "../components/PlayersTabs";
import { getAllPlayers, getOfficialTournamentPlayers } from "../lib/queries/players";

export const metadata = {
  title: "Club Roster | Falcon Warriors",
  description: "Meet all active members of Falcon Warriors eFootball club.",
};

export default async function PlayersPage() {
  const [players, officialPlayers] = await Promise.all([
    getAllPlayers(),
    getOfficialTournamentPlayers(),
  ]);

  return (
    <main className="bg-[var(--fw-bg-primary)] text-[var(--fw-text-primary)]">
      <Navbar />

      <section className="relative overflow-hidden border-b border-[var(--fw-border)] bg-[var(--fw-bg-primary)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(91,117,255,0.12),transparent_32%)]" />

        <div className="absolute -right-12 top-1/2 h-40 w-40 -translate-y-1/2 opacity-[0.04] sm:h-56 sm:w-56 lg:h-72 lg:w-72">
          <Image src="/logo.jpg" alt="" fill className="object-contain" />
        </div>

        <div className="fw-container relative py-10 sm:py-12 lg:py-16">
          <div className="max-w-3xl">
            <div
              className="fw-hero-reveal mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--fw-brand)] sm:text-[11px]"
              style={{ animationDelay: "80ms" }}
            >
              THE ROSTER
            </div>

            <nav
              aria-label="Breadcrumb"
              className="fw-hero-reveal mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fw-text-muted)]"
              style={{ animationDelay: "120ms" }}
            >
              <span className="text-[var(--fw-text-muted)]">HOME</span>
              <span aria-hidden="true" className="text-[var(--fw-text-muted)]">/</span>
              <span className="text-[var(--fw-brand)]">PLAYERS</span>
            </nav>

            <h1
              className="fw-hero-reveal max-w-[720px] text-[clamp(2.5rem,5vw,5rem)] font-black uppercase leading-[0.95] tracking-[-0.06em] text-[var(--fw-text-primary)]"
              style={{ animationDelay: "200ms" }}
            >
              <span className="block">MEET THE</span>
              <span className="block text-[var(--fw-brand)]">WARRIORS</span>
            </h1>

            <p
              className="fw-hero-reveal mt-5 max-w-[560px] text-[15px] leading-[1.7] text-[var(--fw-text-secondary)] sm:text-[16px]"
              style={{ animationDelay: "280ms" }}
            >
              Explore the players representing FALCON WARRIORS and the identity behind every competitive run.
            </p>

            <div
              className="fw-hero-reveal mt-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--fw-text-muted)]"
              style={{ animationDelay: "360ms" }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] px-3 py-2 text-[var(--fw-text-primary)]">
                ROSTER
              </span>
              <span>
                {players.length} PLAYERS
              </span>
            </div>
          </div>
        </div>

        <div className="fw-container">
          <div className="h-px w-full bg-[var(--fw-border)]" />
        </div>
      </section>

      <PlayersTabs allPlayers={players} officialPlayers={officialPlayers} />
      <Footer />
    </main>
  );
}
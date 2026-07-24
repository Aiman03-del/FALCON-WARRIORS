import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PlayerCard from "../components/PlayerCard";
import { getAllPlayers } from "../lib/queries/players";
import { Users } from "lucide-react";

export const metadata = {
  title: "Club Roster | Falcon Warriors",
  description: "Meet all active members of Falcon Warriors eFootball club.",
};

export default async function PlayersPage() {
  const players = await getAllPlayers();
  const canViewDetails = true; // Public profiles: everyone can open player pages

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="section-divider" />
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
              Club Roster
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted">
              <Users size={14} />
              {players.length} active {players.length === 1 ? "member" : "members"} representing Falcon Warriors
            </p>
          </div>

          {/* Admin badge removed; profiles are public */}
        </div>

        {/* Player Grid */}
        {players.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <Users size={40} className="text-muted/40" />
            <p className="text-sm text-muted">No active players found.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} canViewDetails={canViewDetails} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
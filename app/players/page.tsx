import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PlayersTabs from "../components/PlayersTabs";
import { getAllPlayers, getOfficialTournamentPlayers } from "../lib/queries/players";
import { Users } from "lucide-react";

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
    <main>
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
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
        </div>

        <PlayersTabs allPlayers={players} officialPlayers={officialPlayers} />
      </section>
      <Footer />
    </main>
  );
}
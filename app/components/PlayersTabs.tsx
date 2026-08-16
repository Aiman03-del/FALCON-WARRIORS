"use client";

import { useState } from "react";
import PlayerCard from "./PlayerCard";
import { Users, Trophy } from "lucide-react";

type Player = {
  id: string;
  slug?: string | null;
  efootball_username: string;
  real_name?: string | null;
  avatar_url?: string | null;
  platform?: string | null;
  rank_division?: string | null;
};

export default function PlayersTabs({
  allPlayers,
  officialPlayers,
}: {
  allPlayers: Player[];
  officialPlayers: Player[];
}) {
  const [tab, setTab] = useState<"all" | "official">("all");
  const list = tab === "all" ? allPlayers : officialPlayers;

  return (
    <>
      <div className="mt-6 flex gap-2 border-b border-white/10">
        <button
          onClick={() => setTab("all")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition ${
            tab === "all" ? "border-b-2 border-gold text-gold" : "text-muted hover:text-white"
          }`}
        >
          <Users size={14} /> All Players
        </button>
        <button
          onClick={() => setTab("official")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition ${
            tab === "official" ? "border-b-2 border-gold text-gold" : "text-muted hover:text-white"
          }`}
        >
          <Trophy size={14} /> Academic Players
        </button>
      </div>

      {list.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Users size={40} className="text-muted/40" />
          <p className="text-sm text-muted">
            {tab === "all" ? "No active players found." : "No Official Tournament players yet."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.map((p) => (
            <PlayerCard key={p.id} player={p} canViewDetails={true} />
          ))}
        </div>
      )}
    </>
  );
}
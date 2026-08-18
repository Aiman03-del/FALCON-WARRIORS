"use client";

import { useMemo, useState } from "react";
import PlayerCard from "./PlayerCard";
import { Users, Trophy, Search, X } from "lucide-react";

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
  const [search, setSearch] = useState("");

  const list = tab === "all" ? allPlayers : officialPlayers;

  const filteredList = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return list;

    return list.filter((player) => {
      const searchableText = [
        player.efootball_username,
        player.real_name,
        player.platform,
        player.rank_division,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [list, search]);

  return (
    <>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 border-b border-white/10">
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

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search players..."
            className="w-full rounded-lg border border-border bg-surface-2 py-2.5 pl-9 pr-9 text-sm text-white outline-none placeholder:text-muted focus:border-gold"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-white"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Users size={40} className="text-muted/40" />
          <p className="text-sm text-muted">
            {search
              ? `No players match “${search}”.`
              : tab === "all"
                ? "No active players found."
                : "No Official Tournament players yet."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredList.map((p) => (
            <PlayerCard key={p.id} player={p} canViewDetails={true} />
          ))}
        </div>
      )}
    </>
  );
}
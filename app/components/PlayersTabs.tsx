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
    <section className="fw-container pb-24 pt-8 sm:pb-32 sm:pt-10 lg:pb-40 lg:pt-12">
      <div className="mb-8 flex flex-col gap-5 lg:gap-8">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--fw-brand)]">
            OUR ROSTER
          </p>
          <div className="flex items-end justify-between">
            <h2 className="text-[clamp(1.4rem,2vw,2.2rem)] font-black uppercase tracking-[-0.06em] text-[var(--fw-text-primary)]">
              Club players
            </h2>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fw-text-muted)]">
              {filteredList.length} PLAYERS
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-[380px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fw-text-muted)]" size={18} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search players..."
              aria-label="Search players"
              className="w-full rounded-[var(--fw-radius-md)] border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] py-3 pl-11 pr-11 text-sm text-[var(--fw-text-primary)] outline-none transition-all duration-200 placeholder:text-[var(--fw-text-muted)] focus:border-[var(--fw-brand)] focus:shadow-[0_0_0_3px_rgba(91,117,255,0.16)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-[var(--fw-text-muted)] transition-colors hover:text-[var(--fw-text-primary)] disabled:opacity-50"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 lg:gap-3">
            <button
              onClick={() => setTab("all")}
              aria-pressed={tab === "all"}
              className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--fw-radius-md)] border px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-200 lg:px-5 ${
                tab === "all"
                  ? "border-[var(--fw-brand)] bg-[var(--fw-brand)] text-[var(--fw-text-primary)] hover:border-[var(--fw-brand-hover)] hover:bg-[var(--fw-brand-hover)]"
                  : "border-[var(--fw-border)] bg-[var(--fw-bg-surface)] text-[var(--fw-text-secondary)] hover:border-[var(--fw-border-hover)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--fw-text-primary)]"
              }`}
            >
              <Users size={13} />
              <span>All</span>
            </button>
            <button
              onClick={() => setTab("official")}
              aria-pressed={tab === "official"}
              className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--fw-radius-md)] border px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-200 lg:px-5 ${
                tab === "official"
                  ? "border-[var(--fw-brand)] bg-[var(--fw-brand)] text-[var(--fw-text-primary)] hover:border-[var(--fw-brand-hover)] hover:bg-[var(--fw-brand-hover)]"
                  : "border-[var(--fw-border)] bg-[var(--fw-bg-surface)] text-[var(--fw-text-secondary)] hover:border-[var(--fw-border-hover)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--fw-text-primary)]"
              }`}
            >
              <Trophy size={13} />
              <span>Official</span>
            </button>
          </div>
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-5 rounded-[var(--fw-radius-lg)] border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] px-6 py-20 text-center sm:px-8 lg:py-24">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--fw-brand)]">
              NO PLAYERS FOUND
            </p>
            <p className="max-w-md text-sm text-[var(--fw-text-secondary)]">
              {search
                ? `No players match "${search}".`
                : tab === "all"
                  ? "No active players found."
                  : "No official tournament players yet."}
            </p>
            <p className="mt-3 text-xs text-[var(--fw-text-muted)]">
              {search ? "Try a different search query or filter." : "Check back soon!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredList.map((p) => (
            <PlayerCard key={p.id} player={p} canViewDetails={true} />
          ))}
        </div>
      )}
    </section>
  );
}
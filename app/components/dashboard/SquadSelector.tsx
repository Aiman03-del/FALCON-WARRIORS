"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

type PlayerOption = {
  id: string;
  efootball_username: string;
  real_name?: string | null;
};

type SquadSelectorProps = {
  players: PlayerOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  label?: string;
  /** Selection order beyond this count is treated as bench. Omit/0 = no limit. */
  maxParticipants?: number | null;
};

export default function SquadSelector({
  players,
  selected,
  onChange,
  label = "Official Squad",
  maxParticipants = null,
}: SquadSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  function nameOf(player: PlayerOption) {
    return player.real_name?.trim() || player.efootball_username;
  }

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return players;

    return players.filter(
      (player) =>
        player.efootball_username.toLowerCase().includes(query) ||
        (player.real_name ?? "").toLowerCase().includes(query)
    );
  }, [players, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  }, [open]);

  function togglePlayer(playerId: string) {
    if (selected.includes(playerId)) {
      onChange(selected.filter((id) => id !== playerId));
      return;
    }

    onChange([...selected, playerId]);
  }

  // Preserve selection order (not player-list order) so "first N picked = main
  // squad" matches what the admin actually clicked.
  const selectedPlayers = selected
    .map((id) => players.find((player) => player.id === id))
    .filter((player): player is PlayerOption => Boolean(player));

  const hasLimit = !!maxParticipants && maxParticipants > 0;
  const mainSquad = hasLimit ? selectedPlayers.slice(0, maxParticipants!) : selectedPlayers;
  const benchSquad = hasLimit ? selectedPlayers.slice(maxParticipants!) : [];

  const summary =
    selectedPlayers.length > 0
      ? `${selectedPlayers.length} selected${hasLimit ? ` (${mainSquad.length} main, ${benchSquad.length} bench)` : ""}`
      : "Select players";

  return (
    <div ref={containerRef} className="relative md:col-span-2">
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-left text-sm outline-none focus:border-white/30"
      >
        <span className={`block text-sm ${selectedPlayers.length > 0 ? "text-white" : "text-muted"}`}>
          {summary}
        </span>
        <div className="flex items-center gap-1">
          {selectedPlayers.length > 0 && (
            <span
              role="button"
              onClick={(event) => {
                event.stopPropagation();
                onChange([]);
              }}
              className="rounded p-0.5 text-muted hover:text-white"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={15} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search size={14} className="text-muted" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {filteredPlayers.length === 0 ? (
              <p className="px-4 py-3 text-center text-xs text-muted">No results found.</p>
            ) : (
              filteredPlayers.map((player) => {
                const checked = selected.includes(player.id);
                const isBenched = checked && benchSquad.some((p) => p.id === player.id);

                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => togglePlayer(player.id)}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-surface-2 ${
                      checked ? "text-gold" : "text-white/90"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {nameOf(player)}
                      {isBenched && (
                        <span className="rounded-full border border-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                          Bench
                        </span>
                      )}
                    </span>
                    {checked && <Check size={14} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {hasLimit && selectedPlayers.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">
              Main Squad ({mainSquad.length}/{maxParticipants})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {mainSquad.map((player) => (
                <span
                  key={player.id}
                  className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold"
                >
                  {nameOf(player)}
                </span>
              ))}
            </div>
          </div>

          {benchSquad.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">
                Bench ({benchSquad.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {benchSquad.map((player) => (
                  <span
                    key={player.id}
                    className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted"
                  >
                    {nameOf(player)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted">
          Selected: {selected.length} player{selected.length === 1 ? "" : "s"}.
        </p>
      )}
    </div>
  );
}
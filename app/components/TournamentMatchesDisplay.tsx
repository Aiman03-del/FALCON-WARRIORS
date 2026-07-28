"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Trophy } from "lucide-react";

type RawPlayer = { efootball_username: string; avatar_url?: string | null };

type Match = {
  id: string;
  round: number;
  matchOrder?: number;
  match_order?: number;
  player1Id?: string | null;
  player2Id?: string | null;
  player1_id?: string | null;
  player2_id?: string | null;
  player1Score?: number | null;
  player2Score?: number | null;
  player1_score?: number | null;
  player2_score?: number | null;
  status: "pending" | "completed" | "live" | "bye" | string;
  stage?: string | null;
  player1?: RawPlayer | RawPlayer[] | null;
  player2?: RawPlayer | RawPlayer[] | null;
};

type Props = {
  matches: Match[];
};

// ---------- helpers ----------

function normalizePlayer(p: Match["player1"]) {
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

function getMatchOrder(m: Match) {
  return m.matchOrder ?? m.match_order ?? 0;
}
function getPlayer1Id(m: Match) {
  return m.player1Id ?? m.player1_id ?? null;
}
function getPlayer2Id(m: Match) {
  return m.player2Id ?? m.player2_id ?? null;
}
function getPlayer1Score(m: Match) {
  return m.player1Score ?? m.player1_score ?? null;
}
function getPlayer2Score(m: Match) {
  return m.player2Score ?? m.player2_score ?? null;
}
function getPlayerName(m: Match, which: 1 | 2) {
  const p = normalizePlayer(which === 1 ? m.player1 : m.player2);
  if (p?.efootball_username) return p.efootball_username;
  const id = which === 1 ? getPlayer1Id(m) : getPlayer2Id(m);
  if (id) return `Player ${id.slice(0, 4)}`;
  return "TBD";
}
function getPlayerAvatar(m: Match, which: 1 | 2) {
  const p = normalizePlayer(which === 1 ? m.player1 : m.player2);
  return p?.avatar_url ?? null;
}
function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "P"
  );
}
function isMatchDone(m: Match) {
  return m.status === "completed" || m.status === "bye";
}
function winnerName(m: Match): string | null {
  if (m.status === "bye") return getPlayerName(m, 1);
  if (m.status !== "completed") return null;
  const s1 = getPlayer1Score(m);
  const s2 = getPlayer2Score(m);
  if (s1 === null || s2 === null || s1 === s2) return null;
  return s1 > s2 ? getPlayerName(m, 1) : getPlayerName(m, 2);
}

const STAGE_PRIORITY: Record<string, number> = { group: 0, league: 1, knockout: 2 };

function stageLabel(stage: string | null | undefined) {
  if (stage === "group") return "Group Stage";
  if (stage === "league") return "League Stage";
  if (stage === "knockout") return "Knockout";
  return "";
}

// Converts knockout rounds to display names (Final/Semi-final/Quarter-final), otherwise uses Round N.
function roundHeading(stage: string | null | undefined, round: number, totalKnockoutRounds: number) {
  if (stage === "knockout" && totalKnockoutRounds > 0) {
    const fromEnd = totalKnockoutRounds - round;
    if (fromEnd === 0) return "Final";
    if (fromEnd === 1) return "Semi-final";
    if (fromEnd === 2) return "Quarter-final";
  }
  const label = stageLabel(stage);
  return label ? `${label} — Round ${round}` : `Round ${round}`;
}

// ---------- small UI bits ----------

function PlayerAvatar({
  name,
  url,
  gradient,
}: {
  name: string;
  url: string | null;
  gradient: "gold-indigo" | "indigo-gold";
}) {
  const gradientClass =
    gradient === "gold-indigo"
      ? "from-gold to-indigo shadow-gold/20"
      : "from-indigo to-gold shadow-indigo/20";

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br ${gradientClass} text-sm font-bold text-white shadow-lg sm:h-14 sm:w-14 sm:text-lg`}
    >
      {url ? (
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </div>
  );
}

function FixtureCard({ m }: { m: Match }) {
  const p1Name = getPlayerName(m, 1);
  const p2Name = getPlayerName(m, 2);
  const s1 = getPlayer1Score(m);
  const s2 = getPlayer2Score(m);
  const done = isMatchDone(m);
  const p1Win = done && s1 !== null && s2 !== null && s1 > s2;
  const p2Win = done && s1 !== null && s2 !== null && s2 > s1;

  if (m.status === "bye") {
    return (
      <div className="card flex items-center justify-between gap-2 p-3 sm:p-4">
        <p className="text-sm font-medium">
          {p1Name} <span className="text-muted">— BYE (auto-advance to next round)</span>
        </p>
      </div>
    );
  }

  return (
    <div className="card flex items-center justify-between gap-2 p-3 sm:p-4">
      <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
        <PlayerAvatar name={p1Name} url={getPlayerAvatar(m, 1)} gradient="gold-indigo" />
        <p className={`truncate text-sm font-semibold ${p1Win ? "text-gold" : ""}`}>{p1Name}</p>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1 px-2">
        {done && s1 !== null && s2 !== null ? (
          <span className="font-display text-lg font-bold tabular-nums">
            {s1} - {s2}
          </span>
        ) : (
          <span className="text-xs font-bold uppercase text-muted">VS</span>
        )}
        <span className="text-[10px] text-muted">Match {getMatchOrder(m)}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
        <PlayerAvatar name={p2Name} url={getPlayerAvatar(m, 2)} gradient="indigo-gold" />
        <p className={`truncate text-sm font-semibold ${p2Win ? "text-gold" : ""}`}>{p2Name}</p>
      </div>
    </div>
  );
}

// Preview for the next knockout round before it is generated.
function PreviewCard({ left, right }: { left: string; right: string }) {
  return (
    <div className="card flex items-center justify-between gap-2 border-dashed p-3 opacity-80 sm:p-4">
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-medium text-muted">{left}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1 px-2 text-muted">
        <Lock size={12} />
        <span className="text-xs font-bold uppercase">VS</span>
      </div>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-medium text-muted">{right}</p>
      </div>
    </div>
  );
}

// ---------- main component ----------

export default function TournamentMatchesDisplay({ matches }: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, { stage: string | null; round: number; matches: Match[] }>();
    for (const m of matches) {
      const stage = m.stage ?? null;
      const key = `${stage ?? "main"}::${m.round}`;
      if (!map.has(key)) map.set(key, { stage, round: m.round, matches: [] });
      map.get(key)!.matches.push(m);
    }
    for (const g of map.values()) {
      g.matches.sort((a, b) => getMatchOrder(a) - getMatchOrder(b));
    }
    return Array.from(map.values()).sort((a, b) => {
      const pa = STAGE_PRIORITY[a.stage ?? ""] ?? 1;
      const pb = STAGE_PRIORITY[b.stage ?? ""] ?? 1;
      if (pa !== pb) return pa - pb;
      return a.round - b.round;
    });
  }, [matches]);

  const totalKnockoutRounds = useMemo(() => {
    const rounds = groups.filter((g) => g.stage === "knockout").map((g) => g.round);
    return rounds.length > 0 ? Math.max(...rounds) : 0;
  }, [groups]);

  // Default: first incomplete round, otherwise the last round.
  const defaultIndex = useMemo(() => {
    const idx = groups.findIndex((g) => !g.matches.every(isMatchDone));
    return idx === -1 ? Math.max(groups.length - 1, 0) : idx;
  }, [groups]);

  const [index, setIndex] = useState(defaultIndex);

  if (groups.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm text-muted">No matches scheduled for this tournament yet.</p>
      </div>
    );
  }

  const isPreviewStep = index === groups.length; // virtual preview step for the next round
  const current = isPreviewStep ? null : groups[index];
  const currentComplete = current ? current.matches.every(isMatchDone) : false;

  const lastGroup = groups[groups.length - 1];
  const lastIsKnockout = lastGroup.stage === "knockout";
  const lastComplete = lastGroup.matches.every(isMatchDone);
  const canPreviewNext =
    lastIsKnockout && lastComplete && lastGroup.matches.length > 1 &&
    // no next round after the final
    !(totalKnockoutRounds > 0 && lastGroup.round === totalKnockoutRounds);

  const atLastRealStep = index === groups.length - 1;
  const canGoNext = isPreviewStep
    ? false
    : atLastRealStep
    ? currentComplete && canPreviewNext
    : currentComplete; // the current round must finish before moving to the next real round
  const canGoPrev = index > 0;

  return (
    <div>
      {/* Step header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => canGoPrev && setIndex((i) => i - 1)}
          disabled={!canGoPrev}
          className="btn-outline flex items-center gap-1 px-3 py-2 text-xs disabled:opacity-30"
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        <div className="text-center">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-gold">
            {isPreviewStep
              ? roundHeading("knockout", lastGroup.round + 1, totalKnockoutRounds)
              : roundHeading(current!.stage, current!.round, totalKnockoutRounds)}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted">
            Step {index + 1} of {groups.length + (canPreviewNext ? 1 : 0)}
          </p>
        </div>

        <button
          onClick={() => canGoNext && setIndex((i) => i + 1)}
          disabled={!canGoNext}
          className="btn-outline flex items-center gap-1 px-3 py-2 text-xs disabled:opacity-30"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Fixtures for current step */}
      <div key={index} className="round-step-slide flex flex-col gap-3">
        {isPreviewStep
          ? Array.from({ length: Math.ceil(lastGroup.matches.length / 2) }).map((_, i) => {
              const a = lastGroup.matches[i * 2];
              const b = lastGroup.matches[i * 2 + 1];
              const left = a
                ? winnerName(a) ?? `${getPlayerName(a, 1)} vs ${getPlayerName(a, 2)} — winner not determined`
                : "TBD";
              const right = b
                ? winnerName(b) ?? `${getPlayerName(b, 1)} vs ${getPlayerName(b, 2)} — winner not determined`
                : "BYE";
              return <PreviewCard key={`preview-${i}`} left={left} right={right} />;
            })
          : current!.matches.map((m) => <FixtureCard key={m.id} m={m} />)}
      </div>

      {/* Helper / status text */}
      {!isPreviewStep && !currentComplete && (
        <p className="mt-4 text-center text-xs text-muted">
          Once every match in this round is complete, the next round will appear here.
        </p>
      )}
      {!isPreviewStep && atLastRealStep && currentComplete && !canPreviewNext && lastIsKnockout && (
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-semibold text-gold">
          <Trophy size={14} /> Champion has been determined!
        </p>
      )}
      {isPreviewStep && (
        <p className="mt-4 text-center text-xs text-muted">
          Matches for the next round have not been generated yet — the winners shown above will play here.
        </p>
      )}
      <style>{`
        @keyframes roundStepSlide {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .round-step-slide { animation: roundStepSlide 0.35s ease-out; }
      `}</style>
    </div>
  );
}
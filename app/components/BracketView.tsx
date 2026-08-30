"use client";

import { useState, useRef, useEffect, useTransition, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Trophy, X } from "lucide-react";
import { toPng } from "html-to-image";
import { knockoutRoundName, countTeamsInRound } from "@/app/lib/utils/roundNames";
import { createClient } from "@/app/lib/supabase/client";
import { saveMatchResult } from "@/app/lib/matches/saveMatchResult";
import ChampionModal from "@/app/components/ChampionModal";

type PlayerRef = {
  efootball_username: string;
  real_name?: string | null;
  avatar_url?: string | null;
} | {
  efootball_username: string;
  real_name?: string | null;
  avatar_url?: string | null;
}[] | null;

type BracketMatch = {
  id: string;
  round: number;
  match_order: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  player1_penalty?: number | null;
  player2_penalty?: number | null;
  status: string;
  player1?: PlayerRef;
  player2?: PlayerRef;
};

type PlayerInfo = { name: string; avatarUrl: string | null } | null;

function infoOf(p: PlayerRef | undefined): PlayerInfo {
  if (!p) return null;
  const player = Array.isArray(p) ? p[0] : p;
  if (!player) return null;
  return { name: player.real_name?.trim() || player.efootball_username, avatarUrl: player.avatar_url ?? null };
}

const BOX_W = 190;
const BOX_H = 72;
const COL_GAP = 70;
const ROUND1_SLOT = 118;
const LABEL_H = 28;
const AVATAR_SIZE = 22;

function sanitizeFilename(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9\-_ ]/g, "").replace(/\s+/g, "-") || "bracket";
}

async function waitForImages(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve());
              img.addEventListener("error", () => resolve());
            })
    )
  );
}

/** প্রক্সি/অপ্টিমাইজেশন লেয়ার এড়াতে সরাসরি <img> — এতে ব্র্যাকেট এক্সপোর্টে ভুল ছবি আসার সমস্যা হয় না */
function PlayerAvatar({ info, isBye }: { info: PlayerInfo; isBye?: boolean }) {
  if (isBye) {
    return <div style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} className="shrink-0 rounded-full bg-surface-2" />;
  }
  const name = info?.name ?? "?";
  return (
    <div style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} className="relative shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10">
      {info?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={info.avatarUrl}
          alt={name}
          crossOrigin="anonymous"
          loading="eager"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-gold">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function PlayerRow({
  info, score, penalty, isWinner, isBye, borderBottom,
}: { info: PlayerInfo; score: number | null; penalty?: number | null; isWinner: boolean; isBye?: boolean; borderBottom?: boolean }) {
  const label = isBye ? "BYE" : info?.name ?? "TBD";
  return (
    <div className={`group/player relative flex items-center gap-1.5 px-2 py-1.5 text-xs ${borderBottom ? "border-b border-border" : ""} ${isWinner ? "font-semibold text-white" : isBye ? "text-muted" : "text-white/70"}`}>
      <PlayerAvatar info={info} isBye={isBye} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {score !== null && (
        <span className={`shrink-0 tabular-nums ${isWinner ? "text-gold" : ""}`}>
          {score}
          {penalty !== null && penalty !== undefined && (
            <span className="ml-1 text-[10px] text-muted">({penalty})</span>
          )}
        </span>
      )}
      {!isBye && info?.name && (
        <span className="pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-bg px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/player:opacity-100">
          {info.name}
        </span>
      )}
    </div>
  );
}

function PenaltyScoreModal({
  player1Name,
  player2Name,
  initialPenalty1,
  initialPenalty2,
  isSaving,
  onConfirm,
  onCancel,
}: {
  player1Name: string;
  player2Name: string;
  initialPenalty1: string;
  initialPenalty2: string;
  isSaving: boolean;
  onConfirm: (penalty1: string, penalty2: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [penalty1, setPenalty1] = useState(initialPenalty1);
  const [penalty2, setPenalty2] = useState(initialPenalty2);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSaving, onCancel]);

  async function handleSubmit() {
    if (penalty1 === "" || penalty2 === "" || Number(penalty1) === Number(penalty2)) {
      setError("Enter different penalty scores to decide the winner.");
      return;
    }
    setError(null);
    await onConfirm(penalty1, penalty2);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-2xl shadow-black/50" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-gold" />
            <div>
              <h2 className="font-display text-lg font-bold text-white">Penalty Shootout</h2>
              <p className="mt-1 text-sm text-muted">The knockout match is tied. Enter the penalty score.</p>
            </div>
          </div>
          <button onClick={onCancel} disabled={isSaving} className="rounded p-1 text-muted transition-colors hover:bg-surface-2 hover:text-white disabled:opacity-50" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="min-w-0 flex-1">
            <span className="mb-1 block truncate text-xs font-medium text-white/80">{player1Name}</span>
            <input autoFocus type="number" min={0} value={penalty1} onChange={(event) => setPenalty1(event.target.value)} className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-center text-sm outline-none focus:border-gold" placeholder="0" />
          </label>
          <span className="mt-5 text-sm text-muted">-</span>
          <label className="min-w-0 flex-1">
            <span className="mb-1 block truncate text-xs font-medium text-white/80">{player2Name}</span>
            <input type="number" min={0} value={penalty2} onChange={(event) => setPenalty2(event.target.value)} className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-center text-sm outline-none focus:border-gold" placeholder="0" />
          </label>
        </div>

        {error && <p className="mt-3 text-xs text-gold">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} disabled={isSaving} className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-surface disabled:opacity-50">Cancel</button>
          <button onClick={handleSubmit} disabled={isSaving} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-gold/90 disabled:opacity-50">{isSaving ? "Saving..." : "Save Penalties"}</button>
        </div>
      </div>
    </div>
  );
}

function MatchBox({
  m, editable, tournamentId, format, mode, style, className,
}: {
  m: BracketMatch; editable: boolean; tournamentId?: string; format?: string; mode: "knockout" | "league";
  style?: React.CSSProperties; className: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [s1, setS1] = useState(m.player1_score?.toString() ?? "");
  const [s2, setS2] = useState(m.player2_score?.toString() ?? "");
  const [pen1, setPen1] = useState(m.player1_penalty?.toString() ?? "");
  const [pen2, setPen2] = useState(m.player2_penalty?.toString() ?? "");
  const [needsPenalty, setNeedsPenalty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  const p1 = infoOf(m.player1);
  const p2 = infoOf(m.player2);
  const isBye = m.status === "bye";
  const canEdit = editable && !isBye && m.player1_id && m.player2_id && tournamentId && format;
  const s1Val = m.player1_score;
  const s2Val = m.player2_score;
  const p1Winner = s1Val !== null && s2Val !== null && (s1Val > s2Val || (s1Val === s2Val && (m.player1_penalty ?? -1) > (m.player2_penalty ?? -1)));
  const p2Winner = s1Val !== null && s2Val !== null && (s2Val > s1Val || (s1Val === s2Val && (m.player2_penalty ?? -1) > (m.player1_penalty ?? -1)));

  function resetToStored() {
    setS1(m.player1_score?.toString() ?? "");
    setS2(m.player2_score?.toString() ?? "");
    setPen1(m.player1_penalty?.toString() ?? "");
    setPen2(m.player2_penalty?.toString() ?? "");
    setNeedsPenalty(false);
  }

  async function commitSave(score1: string, score2: string, penalty1?: string, penalty2?: string) {
    if (score1 === "" || score2 === "" || !tournamentId || !format) return;
    setSaving(true);
    try {
      await saveMatchResult(supabase, {
        matchId: m.id, tournamentId, player1Id: m.player1_id, player2Id: m.player2_id,
        score1: Number(score1), score2: Number(score2), format,
        isKnockoutStage: mode === "knockout",
        penalty1: penalty1 && penalty1 !== "" ? Number(penalty1) : null,
        penalty2: penalty2 && penalty2 !== "" ? Number(penalty2) : null,
        round: m.round,
        matchOrder: m.match_order,
      });
      setEditing(false);
      setNeedsPenalty(false);
      startTransition(() => {
        router.refresh();
      });
    } finally {
      setSaving(false);
    }
  }

  // বক্সের বাইরে ফোকাস গেলে (অন্য বক্সে ক্লিক করলে বা বাইরে ক্লিক করলে) — দুইটা স্কোরই থাকলে অটো-সেভ,
  // নকআউট ড্র হলে আগে পেনাল্টি চাওয়া হবে, ভ্যালিড পেনাল্টি না দিলে সেভ হবে না।
  function handleContainerBlur(e: React.FocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null;
    if (boxRef.current && next && boxRef.current.contains(next)) return; // s1 থেকে s2 তে ট্যাব — এখনো একই বক্সে

    if (s1 === "" || s2 === "") {
      resetToStored();
      setEditing(false);
      return;
    }

    const isDraw = Number(s1) === Number(s2);

    if (mode === "knockout" && isDraw) {
      if (!needsPenalty) {
        setNeedsPenalty(true); // বক্স খোলাই থাকবে, পেনাল্টি ইনপুট দেখানো হবে
        return;
      }
      if (pen1 === "" || pen2 === "" || Number(pen1) === Number(pen2)) {
        return; // ভ্যালিড পেনাল্টি স্কোর না দেওয়া পর্যন্ত সেভ হবে না, বক্সও বন্ধ হবে না
      }
      commitSave(s1, s2, pen1, pen2);
      return;
    }

    commitSave(s1, s2);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      resetToStored();
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <>
        <div ref={boxRef} onBlur={handleContainerBlur} className={`${className} z-30 border-gold/50 bg-surface p-2`} style={style}>
          <p className="mb-1 truncate text-[11px] font-medium text-white/80">{p1?.name ?? "TBD"}</p>
          <input
            autoFocus={!needsPenalty}
            type="number"
            value={s1}
            onChange={(e) => setS1(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={needsPenalty}
            className="mb-1 w-full rounded border border-border bg-surface-2 px-1.5 py-1 text-center text-xs outline-none focus:border-gold disabled:opacity-60"
            placeholder="0"
          />
          <p className="mb-1 truncate text-[11px] font-medium text-white/80">{p2?.name ?? "TBD"}</p>
          <input
            type="number"
            value={s2}
            onChange={(e) => setS2(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={needsPenalty}
            className="mb-1 w-full rounded border border-border bg-surface-2 px-1.5 py-1 text-center text-xs outline-none focus:border-gold disabled:opacity-60"
            placeholder="0"
          />
          {saving && <p className="mt-1 text-center text-[10px] font-medium text-gold animate-pulse">Saving…</p>}
        </div>
        {needsPenalty && (
          <PenaltyScoreModal
            player1Name={p1?.name ?? "Player 1"}
            player2Name={p2?.name ?? "Player 2"}
            initialPenalty1={pen1}
            initialPenalty2={pen2}
            isSaving={saving}
            onConfirm={async (penalty1, penalty2) => {
              await commitSave(s1, s2, penalty1, penalty2);
            }}
            onCancel={() => {
              resetToStored();
              setEditing(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div
      className={`${className} ${canEdit ? "cursor-pointer hover:border-gold/50" : ""}`}
      style={style}
      onClick={() => canEdit && setEditing(true)}
    >
      <PlayerRow info={p1} score={s1Val} penalty={m.player1_penalty ?? null} isWinner={p1Winner} borderBottom />
      <PlayerRow info={p2} score={s2Val} penalty={m.player2_penalty ?? null} isWinner={p2Winner} isBye={isBye} />
    </div>
  );
}

export type BracketViewHandle = {
  downloadImage: (tournamentName: string) => Promise<void>;
};

type Props = {
  matches: BracketMatch[];
  mode: "knockout" | "league";
  editable?: boolean;
  tournamentId?: string;
  format?: string;
  tournamentName?: string;
  onChampionChange?: (champion: { name: string; avatarUrl: string | null } | null, openModal: () => void) => void;
};

const BracketView = forwardRef<BracketViewHandle, Props>(function BracketView(
  { matches, mode, editable = false, tournamentId, format, tournamentName, onChampionChange },
  ref
) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [showChampionModal, setShowChampionModal] = useState(false);

  const knockoutChampion: PlayerInfo = (() => {
    if (mode === "league" || matches.length === 0) return null;
    const roundsAll = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
    const lastRound = roundsAll[roundsAll.length - 1];
    const finalMatch = matches
      .filter((m) => m.round === lastRound)
      .sort((a, b) => a.match_order - b.match_order)[0];
    if (!finalMatch) return null;
    if (finalMatch.status === "bye") return infoOf(finalMatch.player1);
    const s1 = finalMatch.player1_score;
    const s2 = finalMatch.player2_score;
    if (s1 !== null && s2 !== null && s1 !== s2) {
      return s1 > s2 ? infoOf(finalMatch.player1) : infoOf(finalMatch.player2);
    }
    if (s1 !== null && s2 !== null && s1 === s2) {
      const p1p = finalMatch.player1_penalty;
      const p2p = finalMatch.player2_penalty;
      if (p1p != null && p2p != null && p1p !== p2p) {
        return p1p > p2p ? infoOf(finalMatch.player1) : infoOf(finalMatch.player2);
      }
    }
    return null;
  })();

  useEffect(() => {
    onChampionChange?.(knockoutChampion, () => setShowChampionModal(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knockoutChampion?.name, knockoutChampion?.avatarUrl]);

  async function downloadImage(name: string) {
    const node = captureRef.current;
    if (!node) return;

    await waitForImages(node);

    const prevScrollX = window.scrollX;
    const prevScrollY = window.scrollY;
    window.scrollTo(0, 0);

    await new Promise((resolve) => requestAnimationFrame(resolve));

    const fullWidth = node.scrollWidth;
    const fullHeight = node.scrollHeight;

    try {
      const dataUrl = await toPng(node, {
        backgroundColor: "#0a0a0f",
        pixelRatio: 2,
        cacheBust: true,
        width: fullWidth,
        height: fullHeight,
        style: {
          padding: "5px",
          transform: "none",
          margin: "0",
        },
      });
      const link = document.createElement("a");
      link.download = `${sanitizeFilename(name)}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      window.scrollTo(prevScrollX, prevScrollY);
    }
  }

  useImperativeHandle(ref, () => ({
    downloadImage,
  }));

  if (matches.length === 0) {
    return <div className="card p-8 text-center text-sm text-muted">No bracket generated yet.</div>;
  }

  const TitleHeading = tournamentName ? (
    <h1 className="mb-4 text-center font-display text-base font-bold uppercase tracking-wide text-white">
      {tournamentName}
    </h1>
  ) : null;

  if (mode === "league") {
    const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
    const byRound = rounds.map((r) => matches.filter((m) => m.round === r).sort((a, b) => a.match_order - b.match_order));

    return (
      <div className="card overflow-x-auto p-4 sm:p-6">
        <div ref={captureRef} className="min-w-max">
          {TitleHeading}
          <div className="flex gap-6">
            {rounds.map((round, ri) => (
              <div key={round} className="shrink-0" style={{ width: BOX_W }}>
                <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-gold">Round {round}</p>
                <div className="flex flex-col gap-3">
                  {byRound[ri].map((m) => (
                    <MatchBox
                      key={m.id} m={m} editable={editable} tournamentId={tournamentId} format={format} mode="league"
                      className="relative overflow-visible rounded-lg border border-border bg-surface shadow-sm"
                      style={{ minHeight: BOX_H }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
  const totalRounds = rounds.length;
  const byRound: BracketMatch[][] = rounds.map((r) => matches.filter((m) => m.round === r).sort((a, b) => a.match_order - b.match_order));

  const centers: number[][] = [];
  centers[0] = byRound[0].map((_, i) => i * ROUND1_SLOT + ROUND1_SLOT / 2);
  for (let r = 1; r < byRound.length; r++) {
    const prev = centers[r - 1];
    centers[r] = byRound[r].map((_, i) => {
      const a = prev[2 * i];
      const b = prev[2 * i + 1];
      return b !== undefined ? (a + b) / 2 : a;
    });
  }

  const chartHeight = byRound[0].length * ROUND1_SLOT;
  const chartWidth = totalRounds * BOX_W + (totalRounds - 1) * COL_GAP + (BOX_W + COL_GAP);

  const finalRoundMatches = byRound[totalRounds - 1];
  const finalMatch = finalRoundMatches?.[0];
  const champion = knockoutChampion;
  const championY = finalMatch ? centers[totalRounds - 1][0] : 0;

  return (
    <div className="card overflow-x-auto p-4 sm:p-6">
      <div ref={captureRef} className="min-w-max" style={{ width: chartWidth }}>
        {TitleHeading}
        <div style={{ width: chartWidth, position: "relative" }}>
          <div className="flex" style={{ height: LABEL_H }}>
            {rounds.map((round, ri) => (
              <p key={round} className="text-center text-xs font-bold uppercase tracking-wide text-gold" style={{ width: BOX_W, marginRight: COL_GAP }}>
                {knockoutRoundName(countTeamsInRound(byRound[ri]))}
              </p>
            ))}
            <p className="text-center text-xs font-bold uppercase tracking-wide text-gold" style={{ width: BOX_W }}>
              {champion ? "Champion" : ""}
            </p>
          </div>

          <div style={{ position: "relative", height: chartHeight }}>
            <svg width={chartWidth} height={chartHeight} style={{ position: "absolute", top: 0, left: 0 }} className="text-white/20">
              {byRound.map((roundMatches, ri) => {
                if (ri === totalRounds - 1) return null;
                const rightX = ri * (BOX_W + COL_GAP) + BOX_W;
                const elbowX = rightX + COL_GAP / 2;
                const nextLeftX = rightX + COL_GAP;
                return roundMatches.map((m, i) => {
                  const y = centers[ri][i];
                  const isPairStart = i % 2 === 0;
                  const hasPartner = i + 1 < roundMatches.length;
                  if (!isPairStart) return null;
                  const nextY = centers[ri + 1][i / 2];
                  if (hasPartner) {
                    const yPartner = centers[ri][i + 1];
                    return (
                      <g key={m.id} stroke="currentColor" strokeWidth={1.5} fill="none">
                        <line x1={rightX} y1={y} x2={elbowX} y2={y} />
                        <line x1={rightX} y1={yPartner} x2={elbowX} y2={yPartner} />
                        <line x1={elbowX} y1={y} x2={elbowX} y2={yPartner} />
                        <line x1={elbowX} y1={nextY} x2={nextLeftX} y2={nextY} />
                      </g>
                    );
                  }
                  return (
                    <g key={m.id} stroke="currentColor" strokeWidth={1.5} fill="none">
                      <line x1={rightX} y1={y} x2={nextLeftX} y2={nextY} />
                    </g>
                  );
                });
              })}
              {champion && finalMatch && (
                <line
                  x1={(totalRounds - 1) * (BOX_W + COL_GAP) + BOX_W} y1={championY}
                  x2={(totalRounds - 1) * (BOX_W + COL_GAP) + BOX_W + COL_GAP} y2={championY}
                  stroke="currentColor" strokeWidth={1.5}
                />
              )}
            </svg>

            {byRound.map((roundMatches, ri) => {
              const colX = ri * (BOX_W + COL_GAP);
              return roundMatches.map((m, i) => {
                const y = centers[ri][i];
                return (
                  <MatchBox
                    key={m.id} m={m} editable={editable} tournamentId={tournamentId} format={format} mode="knockout"
                    className="absolute overflow-visible rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md hover:border-white/20"
                    style={{ left: colX, top: y - BOX_H / 2, width: BOX_W, height: BOX_H }}
                  />
                );
              });
            })}

            {champion && (
              <div className="absolute flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5" style={{ left: totalRounds * (BOX_W + COL_GAP), top: championY - BOX_H / 2 + BOX_H / 2 - 20, width: BOX_W }}>
                <Trophy className="text-gold shrink-0" size={18} />
                <div className="flex min-w-0 items-center gap-2">
                  <PlayerAvatar info={champion} />
                  <span className="truncate text-sm font-bold text-gold">{champion.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {champion && showChampionModal && (
        <ChampionModal champion={champion} tournamentName={tournamentName} onClose={() => setShowChampionModal(false)} />
      )}
    </div>
  );
});

export default BracketView;
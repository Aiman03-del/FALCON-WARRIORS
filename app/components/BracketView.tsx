import Image from "next/image";
import { Trophy } from "lucide-react";
import { knockoutRoundName, countTeamsInRound } from "@/app/lib/utils/roundNames";

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

// Layout constants
const BOX_W = 190;
const BOX_H = 72;
const COL_GAP = 70;
const ROUND1_SLOT = 118;
const LABEL_H = 28;
const AVATAR_SIZE = 22;

function PlayerAvatar({ info, isBye }: { info: PlayerInfo; isBye?: boolean }) {
  if (isBye) {
    return (
      <div
        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        className="shrink-0 rounded-full bg-surface-2"
      />
    );
  }

  const name = info?.name ?? "?";

  return (
    <div
      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
      className="relative shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10"
    >
      {info?.avatarUrl ? (
        <Image src={info.avatarUrl} alt={name} fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-gold">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function PlayerRow({
  info,
  score,
  isWinner,
  isBye,
  borderBottom,
}: {
  info: PlayerInfo;
  score: number | null;
  isWinner: boolean;
  isBye?: boolean;
  borderBottom?: boolean;
}) {
  const label = isBye ? "BYE" : info?.name ?? "TBD";

  return (
    <div
      className={`group/player relative flex items-center gap-1.5 px-2 py-1.5 text-xs ${
        borderBottom ? "border-b border-border" : ""
      } ${isWinner ? "font-semibold text-white" : isBye ? "text-muted" : "text-white/70"}`}
    >
      <PlayerAvatar info={info} isBye={isBye} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {score !== null && (
        <span className={`shrink-0 tabular-nums ${isWinner ? "text-gold" : ""}`}>{score}</span>
      )}

      {/* Hover tooltip */}
      {!isBye && info?.name && (
        <span className="pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-bg px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/player:opacity-100">
          {info.name}
        </span>
      )}
    </div>
  );
}

export default function BracketView({
  matches,
  mode,
}: {
  matches: BracketMatch[];
  mode: "knockout" | "league";
}) {
  if (matches.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        No bracket generated yet.
      </div>
    );
  }

  if (mode === "league") {
    const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
    const byRound = rounds.map((r) =>
      matches.filter((m) => m.round === r).sort((a, b) => a.match_order - b.match_order)
    );
    const maxRows = Math.max(...byRound.map((r) => r.length), 1);

    return (
      <div className="card overflow-x-auto p-4 sm:p-6">
        <div className="flex min-w-max gap-6">
          {rounds.map((round, ri) => (
            <div key={round} className="shrink-0" style={{ width: BOX_W }}>
              <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-gold">
                Round {round}
              </p>
              <div className="flex flex-col gap-3">
                {byRound[ri].map((m) => {
                  const p1 = infoOf(m.player1);
                  const p2 = infoOf(m.player2);
                  const isBye = m.status === "bye";
                  const s1 = m.player1_score;
                  const s2 = m.player2_score;
                  const p1Winner = s1 !== null && s2 !== null && s1 > s2;
                  const p2Winner = s1 !== null && s2 !== null && s2 > s1;

                  return (
                    <div
                      key={m.id}
                      className="overflow-visible rounded-lg border border-border bg-surface shadow-sm"
                      style={{ minHeight: BOX_H }}
                    >
                      <PlayerRow info={p1} score={s1} isWinner={p1Winner} borderBottom />
                      <PlayerRow info={p2} score={s2} isWinner={p2Winner} isBye={isBye} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {maxRows === 0 && (
          <p className="text-center text-sm text-muted">No matches in this stage yet.</p>
        )}
      </div>
    );
  }

  if (mode !== "knockout") return null;

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
  const totalRounds = rounds.length;

  const byRound: BracketMatch[][] = rounds.map((r) =>
    matches.filter((m) => m.round === r).sort((a, b) => a.match_order - b.match_order)
  );

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
  let champion: PlayerInfo = null;
  if (finalMatch) {
    if (finalMatch.status === "bye") {
      champion = infoOf(finalMatch.player1);
    } else if (finalMatch.status === "completed") {
      const s1 = finalMatch.player1_score;
      const s2 = finalMatch.player2_score;
      if (s1 !== null && s2 !== null) {
        champion = s1 > s2 ? infoOf(finalMatch.player1) : infoOf(finalMatch.player2);
      }
    }
  }
  const championY = finalMatch ? centers[totalRounds - 1][0] : 0;

  return (
    <div className="card overflow-x-auto p-4 sm:p-6">
      <div style={{ width: chartWidth, position: "relative" }} className="min-w-max">
        {/* Round labels */}
        <div className="flex" style={{ height: LABEL_H }}>
          {rounds.map((round, ri) => (
            <p
              key={round}
              className="text-center text-xs font-bold uppercase tracking-wide text-gold"
              style={{ width: BOX_W, marginRight: COL_GAP }}
            >
              {knockoutRoundName(countTeamsInRound(byRound[ri]))}
            </p>
          ))}
          <p className="text-center text-xs font-bold uppercase tracking-wide text-gold" style={{ width: BOX_W }}>
            {champion ? "Champion" : ""}
          </p>
        </div>

        <div style={{ position: "relative", height: chartHeight }}>
          <svg
            width={chartWidth}
            height={chartHeight}
            style={{ position: "absolute", top: 0, left: 0 }}
            className="text-white/20"
          >
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
                x1={(totalRounds - 1) * (BOX_W + COL_GAP) + BOX_W}
                y1={championY}
                x2={(totalRounds - 1) * (BOX_W + COL_GAP) + BOX_W + COL_GAP}
                y2={championY}
                stroke="currentColor"
                strokeWidth={1.5}
              />
            )}
          </svg>

          {byRound.map((roundMatches, ri) => {
            const colX = ri * (BOX_W + COL_GAP);
            return roundMatches.map((m, i) => {
              const y = centers[ri][i];
              const p1 = infoOf(m.player1);
              const p2 = infoOf(m.player2);
              const isBye = m.status === "bye";
              const s1 = m.player1_score;
              const s2 = m.player2_score;
              const p1Winner = s1 !== null && s2 !== null && s1 > s2;
              const p2Winner = s1 !== null && s2 !== null && s2 > s1;

              return (
                <div
                  key={m.id}
                  className="absolute overflow-visible rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md hover:border-white/20"
                  style={{ left: colX, top: y - BOX_H / 2, width: BOX_W, height: BOX_H }}
                >
                  <PlayerRow info={p1} score={s1} isWinner={p1Winner} borderBottom />
                  <PlayerRow info={p2} score={s2} isWinner={p2Winner} isBye={isBye} />
                </div>
              );
            });
          })}

          {champion && (
            <div
              className="absolute flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5"
              style={{
                left: totalRounds * (BOX_W + COL_GAP),
                top: championY - BOX_H / 2 + BOX_H / 2 - 20,
                width: BOX_W,
              }}
            >
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
  );
}
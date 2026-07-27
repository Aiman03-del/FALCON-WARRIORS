import { Trophy } from "lucide-react";

type BracketMatch = {
  id: string;
  round: number;
  match_order: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  status: string;
  player1?: { efootball_username: string } | { efootball_username: string }[] | null;
  player2?: { efootball_username: string } | { efootball_username: string }[] | null;
};

function nameOf(p: BracketMatch["player1"]) {
  if (!p) return null;
  const player = Array.isArray(p) ? p[0] : p;
  return player?.efootball_username ?? null;
}

const roundLabel = (round: number, totalRounds: number) => {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semi-final";
  if (fromEnd === 2) return "Quarter-final";
  return `Round ${round}`;
};

// Layout constants — চাইলে সাইজ বদলাতে এগুলো টিউন করুন
const BOX_W = 190;
const BOX_H = 64;
const COL_GAP = 70;
const ROUND1_SLOT = 110; // প্রতিটা রাউন্ড-১ ম্যাচের জন্য ভার্টিকাল স্পেস
const LABEL_H = 28;

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

  if (mode !== "knockout") {
    // লিগ ফরম্যাটে bracket শেপ নেই — এখানে কিছু আঁকার দরকার নেই
    return null;
  }

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
  const totalRounds = rounds.length;

  // প্রতি রাউন্ডের ম্যাচ, bracket অর্ডারে (match_order অনুযায়ী)। ধরে নেওয়া হচ্ছে
  // পরের রাউন্ড আগের রাউন্ডের ক্রমান্বয়ে বিজয়ীদের পেয়ার করে
  // (দেখুন generateKnockoutNextRound) — এটাই bracket-কে আঁকার-যোগ্য রাখে।
  const byRound: BracketMatch[][] = rounds.map((r) =>
    matches.filter((m) => m.round === r).sort((a, b) => a.match_order - b.match_order)
  );

  // প্রতিটা ম্যাচ বক্সের ভার্টিকাল সেন্টার (chart area-র সাপেক্ষে পিক্সেলে),
  // রিকার্সিভলি হিসাব করা: রাউন্ড-r-এর একটা ম্যাচের সেন্টার হলো তাকে ফিড করা
  // দুইটা রাউন্ড-(r-1) ম্যাচের মিডপয়েন্ট।
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
  let champion: string | null = null;
  if (finalMatch) {
    if (finalMatch.status === "bye") {
      champion = nameOf(finalMatch.player1);
    } else if (finalMatch.status === "completed") {
      const s1 = finalMatch.player1_score;
      const s2 = finalMatch.player2_score;
      if (s1 !== null && s2 !== null) {
        champion = s1 > s2 ? nameOf(finalMatch.player1) : nameOf(finalMatch.player2);
      }
    }
  }
  const championY = finalMatch ? centers[totalRounds - 1][0] : 0;

  return (
    <div className="overflow-x-auto pb-4">
      <div style={{ width: chartWidth, position: "relative" }}>
        {/* Round labels */}
        <div className="flex" style={{ height: LABEL_H }}>
          {rounds.map((round, ri) => (
            <p
              key={round}
              className="text-center text-xs font-bold uppercase tracking-wide text-gold"
              style={{ width: BOX_W, marginRight: COL_GAP }}
            >
              {roundLabel(round, totalRounds)}
            </p>
          ))}
          <p
            className="text-center text-xs font-bold uppercase tracking-wide text-gold"
            style={{ width: BOX_W }}
          >
            {champion ? "Champion" : ""}
          </p>
        </div>

        <div style={{ position: "relative", height: chartHeight }}>
          {/* কানেক্টর লাইনগুলো বক্সের নিচে আঁকা হয় */}
          <svg
            width={chartWidth}
            height={chartHeight}
            style={{ position: "absolute", top: 0, left: 0 }}
            className="text-white/25"
          >
            {byRound.map((roundMatches, ri) => {
              if (ri === totalRounds - 1) return null;
              const colX = ri * (BOX_W + COL_GAP);
              const rightX = colX + BOX_W;
              const elbowX = rightX + COL_GAP / 2;
              const nextLeftX = rightX + COL_GAP;

              return roundMatches.map((m, i) => {
                const y = centers[ri][i];
                const isPairStart = i % 2 === 0;
                const hasPartner = i + 1 < roundMatches.length;

                if (isPairStart) {
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
                }
                return null;
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

          {/* ম্যাচ বক্সগুলো লাইনের উপরে */}
          {byRound.map((roundMatches, ri) => {
            const colX = ri * (BOX_W + COL_GAP);
            return roundMatches.map((m, i) => {
              const y = centers[ri][i];
              const p1 = nameOf(m.player1);
              const p2 = nameOf(m.player2);
              const isBye = m.status === "bye";
              const s1 = m.player1_score;
              const s2 = m.player2_score;
              const p1Winner = s1 !== null && s2 !== null && s1 > s2;
              const p2Winner = s1 !== null && s2 !== null && s2 > s1;

              return (
                <div
                  key={m.id}
                  className="absolute rounded-lg border border-border bg-surface"
                  style={{ left: colX, top: y - BOX_H / 2, width: BOX_W, height: BOX_H }}
                >
                  <div
                    className={`flex items-center justify-between border-b border-border px-3 py-2 text-xs ${
                      p1Winner ? "font-semibold text-white" : "text-white/70"
                    }`}
                  >
                    <span className="truncate">{p1 ?? (isBye ? "—" : "TBD")}</span>
                    {s1 !== null && <span className={p1Winner ? "text-gold" : ""}>{s1}</span>}
                  </div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 text-xs ${
                      p2Winner ? "font-semibold text-white" : "text-white/70"
                    }`}
                  >
                    <span className="truncate">
                      {isBye ? <span className="text-muted">BYE</span> : p2 ?? "TBD"}
                    </span>
                    {s2 !== null && <span className={p2Winner ? "text-gold" : ""}>{s2}</span>}
                  </div>
                </div>
              );
            });
          })}

          {/* চ্যাম্পিয়ন কার্ড */}
          {champion && (
            <div
              className="absolute flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3"
              style={{
                left: totalRounds * (BOX_W + COL_GAP),
                top: championY - BOX_H / 2,
                width: BOX_W,
              }}
            >
              <Trophy className="text-gold shrink-0" size={18} />
              <span className="truncate text-sm font-bold text-gold">{champion}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
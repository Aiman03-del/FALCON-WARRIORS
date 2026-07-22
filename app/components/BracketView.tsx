import Link from "next/link";
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

const MATCH_HEIGHT = 76;

export default function BracketView({ matches }: { matches: BracketMatch[] }) {
  if (matches.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        No bracket generated yet.
      </div>
    );
  }

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
  const totalRounds = rounds[rounds.length - 1];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-10" style={{ minWidth: rounds.length * 240 }}>
        {rounds.map((round) => {
          const roundMatches = matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.match_order - b.match_order);

          return (
            <div key={round} className="flex flex-col" style={{ minWidth: 210 }}>
              <p className="mb-4 text-center text-xs font-bold uppercase tracking-wide text-gold">
                {roundLabel(round, totalRounds)}
              </p>

              <div className="flex flex-1 flex-col justify-around gap-4">
                {roundMatches.map((m) => {
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
                      className="relative rounded-lg border border-border bg-surface"
                      style={{ minHeight: MATCH_HEIGHT }}
                    >
                      <div
                        className={`flex items-center justify-between border-b border-border px-3 py-2 text-xs ${
                          p1Winner ? "font-semibold text-white" : "text-white/70"
                        }`}
                      >
                        <span className="truncate">{p1 ?? (isBye ? "—" : "TBD")}</span>
                        {s1 !== null && (
                          <span className={p1Winner ? "text-gold" : ""}>{s1}</span>
                        )}
                      </div>
                      <div
                        className={`flex items-center justify-between px-3 py-2 text-xs ${
                          p2Winner ? "font-semibold text-white" : "text-white/70"
                        }`}
                      >
                        <span className="truncate">
                          {isBye ? <span className="text-muted">BYE</span> : p2 ?? "TBD"}
                        </span>
                        {s2 !== null && (
                          <span className={p2Winner ? "text-gold" : ""}>{s2}</span>
                        )}
                      </div>

                      {round < totalRounds && (
                        <span className="absolute right-[-24px] top-1/2 h-px w-6 -translate-y-1/2 bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* চ্যাম্পিয়ন কার্ড */}
        {(() => {
          const finalMatch = matches.find((m) => m.round === totalRounds);
          if (!finalMatch || finalMatch.status !== "completed") return null;
          const s1 = finalMatch.player1_score;
          const s2 = finalMatch.player2_score;
          const champion =
            s1 !== null && s2 !== null
              ? s1 > s2
                ? nameOf(finalMatch.player1)
                : nameOf(finalMatch.player2)
              : null;
          if (!champion) return null;

          return (
            <div className="flex flex-col justify-center">
              <p className="mb-4 text-center text-xs font-bold uppercase tracking-wide text-gold">
                Champion
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3">
                <Trophy className="text-gold" size={18} />
                <span className="text-sm font-bold text-gold">{champion}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
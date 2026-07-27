import Link from "next/link";
import { Calendar, CheckCircle2 } from "lucide-react";

type Match = {
  id: string;
  round: number;
  matchOrder: number;
  player1Id?: string | null;
  player2Id?: string | null;
  player1Score: number | null;
  player2Score: number | null;
  status: "pending" | "completed" | "live";
  player1?: { efootball_username: string };
  player2?: { efootball_username: string };
};

type Props = {
  matches: Match[];
};

function getResult(score1: number, score2: number): "W" | "D" | "L" {
  if (score1 > score2) return "W";
  if (score1 === score2) return "D";
  return "L";
}

function getPlayerLabel(playerName: string | undefined, playerId?: string | null) {
  if (playerName) return playerName;
  if (playerId) return `Player ${playerId.slice(0, 4)}`;
  return "TBD";
}

export default function TournamentMatchesDisplay({ matches }: Props) {
  const upcoming = matches.filter((m) => m.status !== "completed").sort((a, b) => a.round - b.round || a.matchOrder - b.matchOrder);
  const completed = matches.filter((m) => m.status === "completed").sort((a, b) => b.round - a.round || b.matchOrder - a.matchOrder);

  const resultStyles = {
    W: "bg-indigo/20 text-indigo-light",
    D: "bg-white/10 text-muted",
    L: "bg-gold/15 text-gold",
  };

  return (
    <div>
      {/* Upcoming Matches */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase text-gold">
            <Calendar size={14} />
            Upcoming Matches
          </h3>
          <div className="flex flex-col gap-3">
            {upcoming.map((m) => (
              <div key={m.id} className="card flex items-center justify-between gap-4 p-3 sm:p-4">
                <div className="flex flex-1 items-center justify-between gap-2 sm:justify-center">
                  <div className="text-center">
                    <p className="text-sm font-semibold">{getPlayerLabel(m.player1?.efootball_username, m.player1Id)}</p>
                    <p className="text-xs text-muted">Round {m.round}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-muted">VS</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{getPlayerLabel(m.player2?.efootball_username, m.player2Id)}</p>
                    <p className="text-xs text-muted">Match {m.matchOrder}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Matches */}
      {completed.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase text-gold">
            <CheckCircle2 size={14} />
            Results
          </h3>
          <div className="flex flex-col gap-3">
            {completed.map((m) => {
              const result = getResult(m.player1Score ?? 0, m.player2Score ?? 0);
              const resultStyle = resultStyles[result];
              return (
                <div key={m.id} className="card flex items-center justify-between gap-4 p-3 sm:p-4">
                  <div className="flex flex-1 items-center justify-between gap-2 sm:justify-center">
                    <div className="min-w-0 text-center">
                      <p className="truncate text-sm font-semibold">{getPlayerLabel(m.player1?.efootball_username, m.player1Id)}</p>
                      <p className="text-xs text-muted">Round {m.round}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="font-display text-lg font-bold tabular-nums">
                        {m.player1Score} - {m.player2Score}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${resultStyle}`}>{result}</span>
                    </div>
                    <div className="min-w-0 text-center">
                      <p className="truncate text-sm font-semibold">{getPlayerLabel(m.player2?.efootball_username, m.player2Id)}</p>
                      <p className="text-xs text-muted">Match {m.matchOrder}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <div className="card flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-muted">No matches scheduled for this tournament yet.</p>
        </div>
      )}
    </div>
  );
}

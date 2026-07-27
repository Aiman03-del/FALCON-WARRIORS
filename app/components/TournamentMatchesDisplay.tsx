import Link from "next/link";
import { Calendar, CheckCircle2 } from "lucide-react";

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

function getMatchOrder(match: Match) {
  return match.matchOrder ?? match.match_order ?? 0;
}

function getPlayer1Id(match: Match) {
  return match.player1Id ?? match.player1_id ?? null;
}

function getPlayer2Id(match: Match) {
  return match.player2Id ?? match.player2_id ?? null;
}

function getPlayer1Score(match: Match) {
  return match.player1Score ?? match.player1_score ?? null;
}

function getPlayer2Score(match: Match) {
  return match.player2Score ?? match.player2_score ?? null;
}

export default function TournamentMatchesDisplay({ matches }: Props) {
  const upcoming = matches
    .filter((m) => m.status !== "completed")
    .sort((a, b) => a.round - b.round || (a.matchOrder ?? a.match_order ?? 0) - (b.matchOrder ?? b.match_order ?? 0));
  const completed = matches
    .filter((m) => m.status === "completed")
    .sort((a, b) => b.round - a.round || (b.matchOrder ?? b.match_order ?? 0) - (a.matchOrder ?? a.match_order ?? 0));

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
                    <p className="text-sm font-semibold">{getPlayerLabel(m.player1?.efootball_username, getPlayer1Id(m))}</p>
                    <p className="text-xs text-muted">Round {m.round}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-muted">VS</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{getPlayerLabel(m.player2?.efootball_username, getPlayer2Id(m))}</p>
                    <p className="text-xs text-muted">Match {getMatchOrder(m)}</p>
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
              const result = getResult(getPlayer1Score(m) ?? 0, getPlayer2Score(m) ?? 0);
              const resultStyle = resultStyles[result];
              return (
                <div key={m.id} className="card flex items-center justify-between gap-4 p-3 sm:p-4">
                  <div className="flex flex-1 items-center justify-between gap-2 sm:justify-center">
                    <div className="min-w-0 text-center">
                      <p className="truncate text-sm font-semibold">{getPlayerLabel(m.player1?.efootball_username, getPlayer1Id(m))}</p>
                      <p className="text-xs text-muted">Round {m.round}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="font-display text-lg font-bold tabular-nums">
                        {getPlayer1Score(m)} - {getPlayer2Score(m)}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${resultStyle}`}>{result}</span>
                    </div>
                    <div className="min-w-0 text-center">
                      <p className="truncate text-sm font-semibold">{getPlayerLabel(m.player2?.efootball_username, getPlayer2Id(m))}</p>
                      <p className="text-xs text-muted">Match {getMatchOrder(m)}</p>
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

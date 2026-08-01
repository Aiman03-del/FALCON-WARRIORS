import { Star, Swords } from "lucide-react";

type Player = {
  name: string;
  avatarUrl?: string | null;
};

type GoalEntry = {
  player_id: string;
  goals: number;
  efootball_username: string;
  real_name: string | null;
};

function Avatar({
  url,
  fallback,
  size = 40,
  win,
}: {
  url?: string | null;
  fallback: string;
  size?: number;
  win?: boolean;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 overflow-hidden rounded-full bg-surface-2 ${
        win ? "ring-2 ring-gold/40" : ""
      }`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={fallback} className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-display font-bold text-gold"
          style={{ fontSize: size * 0.32 }}
        >
          {fallback.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export default function InternalMatchBoard({
  home,
  away,
  scoreHome,
  scoreAway,
  status,
  roundStage,
  matchDate,
  goalEntries,
  motmName,
}: {
  home: Player;
  away: Player;
  scoreHome: number | null;
  scoreAway: number | null;
  status: string;
  roundStage?: string | null;
  matchDate?: string | null;
  goalEntries: GoalEntry[];
  motmName: string | null;
}) {
  const completed = status === "completed";
  const homeWin = completed && scoreHome !== null && scoreAway !== null && scoreHome > scoreAway;
  const awayWin = completed && scoreHome !== null && scoreAway !== null && scoreAway > scoreHome;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Header */}
      <div className="bg-linear-to-b from-indigo/10 via-surface to-surface px-4 pb-6 pt-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3">
          <div className="flex flex-1 flex-col items-center gap-2">
            <Avatar url={home.avatarUrl} fallback={home.name} size={52} win={homeWin} />
            <span className={`text-sm font-semibold ${homeWin ? "text-white" : "text-white/80"}`}>
              {home.name}
            </span>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1 px-2">
            {completed && scoreHome !== null && scoreAway !== null ? (
              <span className="font-display text-4xl font-bold tabular-nums">
                {scoreHome}
                <span className="mx-1.5 text-muted">-</span>
                {scoreAway}
              </span>
            ) : (
              <span className="text-xs font-bold uppercase text-muted">
                {status === "live" ? "LIVE" : "vs"}
              </span>
            )}
            {roundStage && (
              <span className="mt-1 rounded-full bg-surface-2 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                {roundStage}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            <Avatar url={away.avatarUrl} fallback={away.name} size={52} win={awayWin} />
            <span className={`text-sm font-semibold ${awayWin ? "text-white" : "text-white/80"}`}>
              {away.name}
            </span>
          </div>
        </div>

        {matchDate && (
          <p className="mt-4 text-center text-xs text-muted">
            {new Date(matchDate).toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Goal scorers */}
      {goalEntries.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border p-4 sm:p-6">
          <div className="mb-1 flex items-center gap-2 px-1">
            <Swords size={13} className="text-gold" />
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Goal Scorers</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {goalEntries.map((g) => (
              <div
                key={g.player_id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-2/60 px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-white/90">
                  {g.real_name?.trim() || g.efootball_username}
                </span>
                <span className="text-gold">
                  {g.goals} {g.goals === 1 ? "goal" : "goals"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOTM */}
      {motmName && (
        <div className="border-t border-border p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Star size={14} className="text-gold" />
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Man of the Match</p>
          </div>
          <p className="text-sm font-semibold text-white">{motmName}</p>
        </div>
      )}
    </div>
  );
}
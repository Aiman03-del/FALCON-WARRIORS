import Image from "next/image";
import Link from "next/link";
import MatchStatusBadge from "./MatchStatusBadge";

type Side = {
  name: string;
  avatarUrl?: string | null;
  isFalcon?: boolean;
};

export default function MatchScoreHeader({
  home,
  away,
  scoreHome,
  scoreAway,
  status,
  competition,
  roundStage,
  matchDate,
}: {
  home: Side;
  away: Side;
  scoreHome: number | null;
  scoreAway: number | null;
  status: string;
  competition?: string | null;
  roundStage?: string | null;
  matchDate: string;
}) {
  return (
    <div className="card p-8 text-center">
      {(competition || roundStage) && (
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gold">
          {[competition, roundStage].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="mb-6 text-xs text-muted">
        {new Date(matchDate).toLocaleString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <SideBlock side={home} />

        <div className="flex flex-col items-center gap-2">
          {scoreHome !== null && scoreAway !== null ? (
            <div className="font-display text-4xl font-bold sm:text-5xl">
              {scoreHome} <span className="text-muted">-</span> {scoreAway}
            </div>
          ) : (
            <div className="font-display text-2xl font-bold text-muted">VS</div>
          )}
          <MatchStatusBadge status={status} />
        </div>

        <SideBlock side={away} />
      </div>
    </div>
  );
}

function SideBlock({ side }: { side: Side }) {
  return (
    <div className="flex w-24 flex-col items-center gap-2 sm:w-32">
      <div
        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full sm:h-16 sm:w-16 ${
          side.isFalcon ? "border-2 border-gold/60 bg-gold/10" : "bg-surface-2"
        }`}
      >
        {side.avatarUrl ? (
          <Image src={side.avatarUrl} alt={side.name} fill className="object-cover" />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center font-display text-sm font-bold ${
              side.isFalcon ? "text-gold" : "text-white/70"
            }`}
          >
            {side.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-center text-sm font-semibold leading-tight">{side.name}</span>
    </div>
  );
}
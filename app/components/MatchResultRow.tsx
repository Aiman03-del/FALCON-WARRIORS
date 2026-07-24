import Image from "next/image";
import Link from "next/link";

type Props = {
  id: string;
  date: string;
  competition: string | null;
  scoreHome: number;
  scoreAway: number;
  opponentName: string;
  opponentTag?: string | null;
  opponentLogoUrl?: string | null;
  matchType?: string | null;
  tournamentId?: string | null;
  result: "WIN" | "DRAW" | "LOSS";
};

const resultStyles: Record<Props["result"], string> = {
  WIN: "bg-indigo/20 text-indigo-light",
  DRAW: "bg-white/10 text-muted",
  LOSS: "bg-gold/15 text-gold",
};

function TeamBlock({
  tag,
  name,
  align,
  logoUrl,
}: {
  tag: string;
  name: string;
  align: "left" | "right";
  logoUrl?: string | null;
}) {
  return (
    <div className="flex w-28 flex-col items-center gap-1.5 sm:w-32">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-bold text-white/70">
        {logoUrl ? (
          <Image src={logoUrl} alt={name} fill className="object-cover" sizes="40px" />
        ) : (
          <span>{tag.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <span className="line-clamp-1 text-center text-xs font-medium leading-tight sm:text-sm">
        {name}
      </span>
    </div>
  );
}

export default function MatchResultRow({
  id,
  date,
  competition,
  scoreHome,
  scoreAway,
  opponentName,
  opponentTag,
  opponentLogoUrl,
  matchType,
  tournamentId,
  result,
}: Props) {
  const typeBadge =
    matchType === "internal"
      ? { label: "Internal", className: "bg-indigo/15 text-indigo-light" }
      : tournamentId
      ? { label: "Official", className: "bg-gold/15 text-gold" }
      : { label: "Friendly", className: "bg-white/10 text-muted" };
  return (
    <Link
      href={`/matches/${id}`}
      className="card flex flex-col gap-3 p-4 hover:border-gold/30 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Date + Competition */}
      <div className="flex flex-col gap-1 sm:w-40 sm:shrink-0">
        <span className="text-xs text-muted">
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {competition && (
            <span className="w-fit truncate rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-white/70">
              {competition}
            </span>
          )}
          <span
            className={`w-fit truncate rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${typeBadge.className}`}
          >
            {typeBadge.label}
          </span>
        </div>
      </div>

      {/* Teams + Score — সব সময় centered, সমান স্পেসিং */}
      <div className="flex items-center justify-center gap-3 sm:flex-1 sm:gap-6">
        <TeamBlock tag="FW" name="Falcon Warriors" align="right" />

        <div className="flex w-16 flex-col items-center gap-1.5 shrink-0">
          <span className="font-display text-xl font-bold tabular-nums sm:text-2xl">
            {scoreHome} - {scoreAway}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${resultStyles[result]}`}
          >
            {result}
          </span>
        </div>

        <TeamBlock
          tag={opponentTag ?? opponentName}
          name={opponentName}
          align="left"
          logoUrl={opponentLogoUrl}
        />
      </div>
    </Link>
  );
}

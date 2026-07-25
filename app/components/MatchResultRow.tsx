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
  logoUrl,
  align = "left",
}: {
  tag: string;
  name: string;
  logoUrl?: string | null;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex min-w-[130px] items-center gap-3 ${align === "right" ? "justify-end text-right" : "justify-start text-left"}`}>
      {align === "left" ? (
        <>
          <span className="text-sm font-medium text-white/90">{name}</span>
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10 text-xs font-bold text-white/70">
            {logoUrl ? (
              <Image src={logoUrl} alt={name} fill className="object-cover" sizes="40px" />
            ) : (
              <span>{tag.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10 text-xs font-bold text-white/70">
            {logoUrl ? (
              <Image src={logoUrl} alt={name} fill className="object-cover" sizes="40px" />
            ) : (
              <span>{tag.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <span className="text-sm font-medium text-white/90">{name}</span>
        </>
      )}
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
      className="card grid items-center gap-4 p-4 text-center hover:border-gold/30 sm:grid-cols-[minmax(140px,1fr)_auto_minmax(140px,1fr)]"
    >
      {/* Teams + Score */}
      <TeamBlock tag="FW" name="Falcon Warriors" logoUrl={undefined} align="left" />

      <div className="grid items-center justify-items-center gap-2">
        <span className="text-xs uppercase tracking-[0.15em] text-muted">
          {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
        </span>
        <span className="font-display text-3xl font-bold tabular-nums">
          {scoreHome} - {scoreAway}
        </span>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${resultStyles[result]}`}>
          {result}
        </span>
      </div>

      <TeamBlock
        tag={opponentTag ?? opponentName}
        name={opponentName}
        logoUrl={opponentLogoUrl}
        align="right"
      />
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";

type Props = {
  href: string;
  date: string;
  competition: string | null;
  scoreHome: number;
  scoreAway: number;
  homeName: string;
  homeAvatarUrl?: string | null;
  opponentName: string;
  opponentTag?: string | null;
  opponentLogoUrl?: string | null;
  matchType?: string | null;
  tournamentId?: string | null;
  result: "WIN" | "DRAW" | "LOSS";
};

const WIN_CHIP = "bg-[var(--fw-success-soft)] text-[var(--fw-success)]";
const LOSS_CHIP = "bg-[var(--fw-danger-soft)] text-[var(--fw-danger)]";
const DRAW_CHIP = "bg-[var(--fw-warning-soft)] text-[var(--fw-warning)]";

function accentBarColor(matchType: string | null | undefined, tournamentId: string | null | undefined) {
  if (matchType === "internal") return "bg-indigo";
  if (tournamentId) return "bg-gold";
  return "bg-white/15";
}

function Crest({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/10 bg-surface-2 text-[10px] font-bold uppercase text-muted">
      {logoUrl ? (
        <Image src={logoUrl} alt={name} fill className="object-cover" sizes="44px" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function SideResult({ show, chip, label }: { show: boolean; chip: string; label: string }) {
  if (!show) return null;
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${chip}`}>
      {label}
    </span>
  );
}

export default async function MatchResultRow({
  href,
  date,
  competition,
  scoreHome,
  scoreAway,
  homeName,
  homeAvatarUrl,
  opponentName,
  opponentTag,
  opponentLogoUrl,
  matchType,
  tournamentId,
  result,
}: Props) {
  const { logoUrl } = await getSiteSettings();
  const isInternal = matchType === "internal";
  const displayHomeName = isInternal ? homeName : "Falcon Warriors";
  const displayHomeLogo = isInternal ? homeAvatarUrl : logoUrl;

  return (
    <Link
      href={href}
      className="group relative flex overflow-hidden rounded-lg border border-white/10 bg-surface transition hover:border-white/25"
    >
      <span className={`w-1 shrink-0 ${accentBarColor(matchType, tournamentId)}`} aria-hidden="true" />

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted">
            {competition ?? "Friendly Match"}
          </p>
          <p className="shrink-0 text-[11px] text-muted">
            {new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Crest name={displayHomeName} logoUrl={displayHomeLogo} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayHomeName}</p>
              <SideResult show={result !== "DRAW"} chip={result === "WIN" ? WIN_CHIP : LOSS_CHIP} label={result === "WIN" ? "Win" : "Loss"} />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 px-2">
            <span className="font-display text-2xl font-bold tabular-nums text-white sm:text-3xl">
              {scoreHome}<span className="text-muted">–</span>{scoreAway}
            </span>
            {result === "DRAW" && (
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${DRAW_CHIP}`}>
                Draw
              </span>
            )}
          </div>

          <div className="flex min-w-0 items-center justify-end gap-3 text-right">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{opponentName}</p>
              <SideResult show={result !== "DRAW"} chip={result === "WIN" ? LOSS_CHIP : WIN_CHIP} label={result === "WIN" ? "Loss" : "Win"} />
            </div>
            <Crest name={opponentTag ?? opponentName} logoUrl={opponentLogoUrl} />
          </div>
        </div>
      </div>
    </Link>
  );
}

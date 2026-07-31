import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import type { OfficialTournamentMatch } from "@/app/lib/queries/tournaments";

function TeamBlock({
  name,
  logoUrl,
  isFalcon,
}: {
  name: string;
  logoUrl?: string | null;
  isFalcon?: boolean;
}) {
  return (
    <div className="flex w-20 flex-col items-center gap-1.5 sm:w-28">
      <div
        className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-full sm:h-10 sm:w-10 ${
          isFalcon ? "ring-2 ring-gold/40" : "bg-surface-2"
        }`}
      >
        {logoUrl ? (
          <Image src={logoUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-2 text-[10px] font-bold text-gold">
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <span className="line-clamp-2 text-center text-xs font-medium leading-tight text-white/90">
        {name}
      </span>
    </div>
  );
}

export default async function OfficialMatchList({
  matches,
  tournamentSlug,
}: {
  matches: OfficialTournamentMatch[];
  tournamentSlug: string;
}) {
  const { logoUrl } = await getSiteSettings();

  if (matches.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        No matches yet for this tournament.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {matches.map((m) => {
        const completed = m.status === "completed";
        const won = completed && m.score_home !== null && m.score_away !== null && m.score_home > m.score_away;
        const lost = completed && m.score_home !== null && m.score_away !== null && m.score_home < m.score_away;
        const draw = completed && m.score_home !== null && m.score_away !== null && m.score_home === m.score_away;

        const href = `/tournaments/${tournamentSlug}/matches/${m.slug ?? m.id}`;

        return (
          <Link
            key={m.id}
            href={href}
            className="card group flex items-center gap-3 p-4 transition-colors hover:border-gold/30 sm:gap-4"
          >
            <div className="flex flex-1 items-center justify-center gap-3 sm:gap-6">
              <TeamBlock name="Falcon Warriors" logoUrl={logoUrl} isFalcon />

              <div className="flex w-20 shrink-0 flex-col items-center gap-1">
                {m.match_date && (
                  <span className="text-[10px] text-muted">
                    {new Date(m.match_date).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}

                {completed && m.score_home !== null && m.score_away !== null ? (
                  <span className="font-display text-xl font-bold tabular-nums sm:text-2xl">
                    {m.score_home}
                    <span className="mx-1 text-muted">-</span>
                    {m.score_away}
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase text-muted">
                    {m.status === "live" ? "LIVE" : "vs"}
                  </span>
                )}

                {completed && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      won
                        ? "bg-indigo/20 text-indigo-light"
                        : lost
                        ? "bg-red-500/15 text-red-400"
                        : "bg-white/10 text-muted"
                    }`}
                  >
                    {won ? "Win" : lost ? "Loss" : "Draw"}
                  </span>
                )}

                {m.round_stage && (
                  <span className="mt-0.5 rounded-full bg-surface-2 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/60 whitespace-nowrap">
                    {m.round_stage}
                  </span>
                )}
              </div>

              <TeamBlock name={m.opponent_name} logoUrl={m.opponent_logo_url} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
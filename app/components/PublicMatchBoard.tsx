import Image from "next/image";
import { Shield, Star } from "lucide-react";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import type { PublicMatchDetail } from "@/app/lib/queries/tournaments";

function Avatar({
  url,
  fallback,
  size = 40,
  ring,
}: {
  url?: string | null;
  fallback: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 overflow-hidden rounded-full bg-surface-2 ${
        ring ? "ring-2 ring-gold/40" : ""
      }`}
    >
      {url ? (
        <Image src={url} alt={fallback} fill className="object-cover" />
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

export default async function PublicMatchBoard({ match }: { match: PublicMatchDetail }) {
  const { logoUrl } = await getSiteSettings();

  const totalFalcon = match.battles.reduce((s, b) => {
    const fs = b.falcon_score;
    const os = b.opponent_score;
    return s + (fs !== null && os !== null && fs > os ? 1 : 0);
  }, 0);
  const totalOpponent = match.battles.reduce((s, b) => {
    const fs = b.falcon_score;
    const os = b.opponent_score;
    return s + (fs !== null && os !== null && os > fs ? 1 : 0);
  }, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Header */}
      <div className="bg-linear-to-b from-gold/10 via-surface to-surface px-4 pb-6 pt-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3">
          {/* Falcon Warriors */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-full ring-2 ring-gold/40">
              <Image
                src={logoUrl}
                alt="Falcon Warriors"
                fill
                sizes="52px"
                className="object-cover"
              />
            </div>
            <span className="text-sm font-semibold text-white">Falcon Warriors</span>
          </div>

          {/* Score */}
          <div className="flex shrink-0 flex-col items-center gap-1 px-2">
            <span className="font-display text-4xl font-bold tabular-nums">
              {match.score_home ?? totalFalcon}
              <span className="mx-1.5 text-muted">-</span>
              {match.score_away ?? totalOpponent}
            </span>
            {match.round_stage && (
              <span className="mt-1 rounded-full bg-surface-2 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                {match.round_stage}
              </span>
            )}
          </div>

          {/* Opponent */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <Avatar
              url={match.opponent_logo_url}
              fallback={match.opponent_name}
              size={52}
            />
            <span className="text-sm font-semibold text-white">{match.opponent_name}</span>
          </div>
        </div>

        {match.match_date && (
          <p className="mt-4 text-center text-xs text-muted">
            {new Date(match.match_date).toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Squad battles */}
      {match.battles.length > 0 && (
        <div className="flex flex-col gap-2 p-4 sm:p-6">
          <div className="mb-1 flex items-center gap-2 px-1">
            <Shield size={13} className="text-gold" />
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Squad Battles
            </p>
          </div>

          {match.battles.map((b) => {
            const fs = b.falcon_score;
            const os = b.opponent_score;
            const falconWin = fs !== null && os !== null && fs > os;
            const oppWin = fs !== null && os !== null && os > fs;

            return (
              <div
                key={b.id}
                className="rounded-xl border border-border bg-surface-2/60 p-3"
              >
                <div className="flex items-center gap-3">
                  {/* Falcon player */}
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <Avatar fallback={b.falcon_username} size={32} />
                    <span
                      className={`truncate text-sm font-medium ${
                        falconWin ? "text-white" : "text-white/70"
                      }`}
                    >
                      {b.falcon_username}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex shrink-0 items-center gap-2 font-display text-sm font-bold tabular-nums">
                    <span className={falconWin ? "text-gold" : "text-white/60"}>
                      {fs ?? "-"}
                    </span>
                    <span className="text-muted">:</span>
                    <span className={oppWin ? "text-gold" : "text-white/60"}>
                      {os ?? "-"}
                    </span>
                  </div>

                  {/* Opponent slot */}
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5">
                    <span
                      className={`truncate text-right text-sm font-medium ${
                        oppWin ? "text-white" : "text-white/70"
                      }`}
                    >
                      {b.opponent_label}
                    </span>
                    <Avatar
                      url={b.opponent_logo_url}
                      fallback={b.opponent_label}
                      size={32}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MOTM */}
      {match.motmList.length > 0 && (
        <div className="border-t border-border p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Star size={14} className="text-gold" />
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Man of the Match
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {match.motmList.map((m, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Avatar
                  url={m.avatar_url}
                  fallback={m.display}
                  size={36}
                  ring
                />
                <div>
                  <p className="text-sm font-semibold text-white">{m.display}</p>
                  {m.opponent_label && (
                    <p className="text-[10px] text-muted">Opponent</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
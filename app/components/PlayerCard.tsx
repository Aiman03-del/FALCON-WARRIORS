import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type Player = {
  id: string;
  slug?: string | null;
  efootball_username: string;
  real_name?: string | null;
  avatar_url?: string | null;
  platform?: string | null;
  rank_division?: string | null;
};

function displayNameOf(player: Player) {
  return player.real_name?.trim() || player.efootball_username;
}

function CardContent({ player }: { player: Player }) {
  const displayName = displayNameOf(player);
  const initials = displayName.slice(0, 2).toUpperCase();
  const detailPairs = [
    player.platform ? { label: "Platform", value: player.platform } : null,
    player.rank_division ? { label: "Rank", value: player.rank_division } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <>
      <div className="relative aspect-[4/5] overflow-hidden border-b border-[var(--fw-border)] bg-[var(--fw-bg-secondary)]">
        {player.avatar_url ? (
          <Image
            src={player.avatar_url}
            alt={displayName}
            fill
            sizes="(max-width: 1280px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(91,117,255,0.2),transparent_55%)] text-[clamp(2rem,4vw,3rem)] font-black uppercase tracking-[-0.08em] text-[var(--fw-brand)]">
            {initials}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,7,11,0.94)] via-[rgba(5,7,11,0.22)] to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          {player.rank_division && (
            <span className="mb-2 inline-flex rounded-full border border-[var(--fw-border)] bg-[rgba(5,7,11,0.45)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--fw-text-secondary)] backdrop-blur-sm">
              {player.rank_division}
            </span>
          )}

          <h3 className="text-[clamp(1.35rem,2vw,2rem)] font-black uppercase leading-[0.96] tracking-[-0.06em] text-[var(--fw-text-primary)]">
            {displayName}
          </h3>

          {player.efootball_username && (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--fw-text-muted)]">
              @{player.efootball_username}
            </p>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {detailPairs.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5">
            {detailPairs.map((detail) => (
              <div key={detail.label} className="rounded-[var(--fw-radius-sm)] border border-[var(--fw-border)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-left">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--fw-text-muted)]">
                  {detail.label}
                </p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[-0.04em] text-[var(--fw-text-primary)]">
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[var(--fw-border)] pt-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fw-text-muted)] group-hover:text-[var(--fw-text-secondary)] transition-colors">Profile</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fw-brand)] group-hover:gap-2 transition-all duration-300">
            View <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </>
  );
}

export default function PlayerCard({
  player,
  canViewDetails = false,
}: {
  player: Player;
  canViewDetails?: boolean;
}) {
  const baseClass =
    "group block overflow-hidden rounded-[var(--fw-radius-lg)] border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--fw-brand)] hover:bg-[var(--fw-bg-surface-hover)]";

  if (canViewDetails) {
    return (
      <Link href={`/players/${player.slug ?? player.id}`} className={baseClass}>
        <CardContent player={player} />
      </Link>
    );
  }

  return (
    <div className={baseClass}>
      <CardContent player={player} />
    </div>
  );
}
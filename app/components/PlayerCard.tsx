import Link from "next/link";
import Image from "next/image";
import { MapPin, Shield } from "lucide-react";

type Player = {
  id: string;
  efootball_username: string;
  real_name?: string | null;
  avatar_url?: string | null;
  preferred_position?: string | null;
  platform?: string | null;
  rank_division?: string | null;
};

const POSITION_COLORS: Record<string, string> = {
  ST: "bg-gold/20 text-gold",
  CF: "bg-gold/20 text-gold",
  SS: "bg-gold-light/20 text-gold-light",
  LW: "bg-gold-light/20 text-gold-light",
  RW: "bg-gold-light/20 text-gold-light",
  AMF: "bg-indigo/20 text-indigo-light",
  CMF: "bg-indigo/20 text-indigo-light",
  DMF: "bg-indigo-light/20 text-indigo",
  LMF: "bg-indigo-light/20 text-indigo",
  RMF: "bg-indigo-light/20 text-indigo",
  CB: "bg-indigo/25 text-indigo-light",
  LB: "bg-indigo/25 text-indigo-light",
  RB: "bg-indigo/25 text-indigo-light",
  GK: "bg-gold/20 text-gold",
};

function getPositionColor(pos?: string | null) {
  if (!pos) return "bg-white/10 text-muted";
  const key = pos.toUpperCase().replace(/\s/g, "");
  return POSITION_COLORS[key] ?? "bg-gold/15 text-gold";
}

function CardContent({ player }: { player: Player }) {
  const initials = player.efootball_username.slice(0, 2).toUpperCase();
  const posColor = getPositionColor(player.preferred_position);

  return (
    <div className="flex w-full items-center gap-3">
      {/* Avatar */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gold/20 bg-surface-2">
        {player.avatar_url ? (
          <Image src={player.avatar_url} alt={player.efootball_username} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-gold">
            {initials}
          </div>
        )}
      </div>

      {/* Info (horizontal) */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white truncate">
              {player.efootball_username}
            </h3>
            {player.real_name && (
              <p className="text-xs text-muted truncate">{player.real_name}</p>
            )}
          </div>

          {player.rank_division && (
            <div className="ml-2 flex items-center gap-1 text-[10px] text-muted">
              <Shield size={12} className="text-indigo" />
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          {player.preferred_position && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${posColor}`}>
              {player.preferred_position}
            </span>
          )}
          {player.platform && (
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-medium uppercase text-muted">
              {player.platform}
            </span>
          )}
        </div>
      </div>
    </div>
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
    "card group flex flex-row items-center p-3 transition-all duration-200 hover:border-gold/30 hover:shadow-md";

  if (canViewDetails) {
    return (
      <Link href={`/players/${player.id}`} className={baseClass}>
        <CardContent player={player} />
        <span className="mt-4 rounded-lg border border-gold/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold opacity-0 transition-opacity group-hover:opacity-100">
          View Details →
        </span>
      </Link>
    );
  }

  return (
    <div className={baseClass}>
      <CardContent player={player} />
    </div>
  );
}

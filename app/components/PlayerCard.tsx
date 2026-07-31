import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield } from "lucide-react";

type Player = {
  id: string;
  slug?: string | null;
  efootball_username: string;
  real_name?: string | null;
  avatar_url?: string | null;
  platform?: string | null;
  rank_division?: string | null;
};

// ইউজারনেম শুধু URL স্লাগের জন্য ব্যবহৃত হয় — কার্ডে সবসময় Real Name দেখানো হয়
// (Real Name না থাকলে তবেই ফলব্যাক হিসেবে ইউজারনেম দেখাবে)
function displayNameOf(player: Player) {
  return player.real_name?.trim() || player.efootball_username;
}

function CardContent({ player }: { player: Player }) {
  const displayName = displayNameOf(player);
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gold/25 bg-surface-2 shadow-lg transition group-hover:border-gold/50 sm:h-24 sm:w-24">
        {player.avatar_url ? (
          <Image
            src={player.avatar_url}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 80px, 96px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-gold">
            {initials}
          </div>
        )}
      </div>

      <h3 className="mt-3 w-full truncate font-display text-sm font-bold uppercase tracking-wide text-white transition group-hover:text-gold sm:text-base">
        {displayName}
      </h3>

      {player.rank_division && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
          <Shield size={11} className="text-indigo" />
          {player.rank_division}
        </p>
      )}

      {player.platform && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-medium uppercase text-muted">
            {player.platform}
          </span>
        </div>
      )}
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
    "card group relative flex flex-col items-center p-4 transition-all duration-200 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10 sm:p-6";

  if (canViewDetails) {
    return (
      <Link href={`/players/${player.slug ?? player.id}`} className={baseClass}>
        <CardContent player={player} />
        <span className="mt-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gold opacity-0 transition-opacity group-hover:opacity-100">
          View Profile <ArrowRight size={11} />
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
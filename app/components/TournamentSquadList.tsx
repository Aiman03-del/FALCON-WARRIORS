import Link from "next/link";
import Image from "next/image";

type SquadPlayer = {
  id: string;
  slug?: string | null;
  efootball_username: string;
  real_name?: string | null;
  avatar_url: string | null;
};

export default function TournamentSquadList({ squad }: { squad: SquadPlayer[] }) {
  const displayNameOf = (p: SquadPlayer) => p.real_name?.trim() || p.efootball_username;

  if (squad.length === 0) {
    return <p className="text-sm text-muted">Squad not announced yet.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {squad.map((p) => (
        <Link
          key={p.id}
          href={`/players/${p.slug ?? p.id}`}
          className="card flex flex-col items-center gap-2 p-3 hover:border-gold/40"
          title={displayNameOf(p)}
        >
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-surface-2">
            {p.avatar_url ? (
              <Image src={p.avatar_url} alt={displayNameOf(p)} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gold">
                {displayNameOf(p).slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <span className="sr-only">{displayNameOf(p)}</span>
        </Link>
      ))}
    </div>
  );
}
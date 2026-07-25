import Link from "next/link";
import Image from "next/image";

type SquadPlayer = { id: string; efootball_username: string; avatar_url: string | null };

export default function TournamentSquadList({ squad }: { squad: SquadPlayer[] }) {
  if (squad.length === 0) {
    return <p className="text-sm text-muted">Squad not announced yet.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {squad.map((p) => (
        <Link
          key={p.id}
          href={`/players/${p.id}`}
          className="card flex flex-col items-center gap-2 p-3 hover:border-gold/40"
          title={p.efootball_username}
        >
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-surface-2">
            {p.avatar_url ? (
              <Image src={p.avatar_url} alt={p.efootball_username} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gold">
                {p.efootball_username.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <span className="sr-only">{p.efootball_username}</span>
        </Link>
      ))}
    </div>
  );
}
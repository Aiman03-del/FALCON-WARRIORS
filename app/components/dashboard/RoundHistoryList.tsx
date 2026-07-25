import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

type HistoryItem = {
  id: string;
  opponent_name: string;
  opponent_logo_url: string | null;
  round_stage: string | null;
  match_date: string;
  score_home: number;
  score_away: number;
};

function TeamBlock({
  name,
  logoUrl,
  isFalcon,
}: {
  name: string | null | undefined;
  logoUrl?: string | null;
  isFalcon?: boolean;
}) {
  const safeName = name?.trim() ? name : "Opponent";

  return (
    <div className="flex w-24 flex-col items-center gap-1.5 sm:w-32">
      <div
        className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-full sm:h-10 sm:w-10 ${
          isFalcon ? "ring-2 ring-gold/40" : "bg-surface-2"
        }`}
      >
        {logoUrl ? (
          <Image src={logoUrl} alt={safeName} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-2 text-[10px] font-bold text-gold">
            {safeName.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <span className="line-clamp-1 text-center text-xs font-medium leading-tight text-white/90 sm:text-sm">
        {safeName}
      </span>
    </div>
  );
}

export function RoundHistoryList({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        No completed rounds yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((m) => {
        const won = m.score_home > m.score_away;
        const lost = m.score_home < m.score_away;

        return (
          <Link
            key={m.id}
            href={`/dashboard/matches/${m.id}`}
            className="flex items-center gap-3 p-4 sm:gap-4"
          >
            <div className="flex flex-1 items-center justify-center gap-3 sm:gap-6">
              <TeamBlock name="Falcon Warriors" logoUrl="/logo.jpg" isFalcon />

              <div className="flex w-16 shrink-0 flex-col items-center gap-1">
                <span className="text-[10px] text-muted">
                  {new Date(m.match_date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="font-display text-xl font-bold tabular-nums sm:text-2xl">
                  {m.score_home}
                  <span className="mx-1 text-muted">-</span>
                  {m.score_away}
                </span>
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
                {m.round_stage && (
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.02em] text-white/70 whitespace-nowrap sm:text-[10px]">
                    {m.round_stage}
                  </span>
                )}
              </div>

              <TeamBlock name={m.opponent_name} logoUrl={m.opponent_logo_url} />
            </div>

            <ChevronRight
              size={16}
              className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
            />
          </Link>
        );
      })}
    </div>
  );
}
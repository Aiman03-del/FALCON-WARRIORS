import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";

type HistoryItem = {
  id: string;
  slug?: string | null;
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
  name?: string | null;
  logoUrl?: string | null;
  isFalcon?: boolean;
}) {
  const safeName = name?.trim() || "Opponent";

  return (
    <div className="flex w-28 flex-col items-center">
      <div className={`relative h-14 w-14 overflow-hidden rounded-full border ${isFalcon ? "border-gold" : "border-white/10"}`}>
        {logoUrl ? (
          <Image src={logoUrl} alt={safeName} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-2 text-gold font-bold">
            {safeName.slice(0,2).toUpperCase()}
          </div>
        )}
      </div>
      <span className="mt-2 text-center text-sm font-semibold text-white">{safeName}</span>
    </div>
  );
}

export async function RoundHistoryList({items}:{items:HistoryItem[]}) {
  const { logoUrl } = await getSiteSettings();

  return (
    <div className="space-y-4">
      {items.map((m)=>{
        const won=m.score_home>m.score_away;
        const lost=m.score_home<m.score_away;

        return(
          <Link
            key={m.id}
            href={`/dashboard/matches/${m.slug ?? m.id}`}
            className="group flex items-center justify-between rounded-3xl border border-white/10 px-3 py-3 transition-all duration-300 hover:border-gold/30 "
          >
            <TeamBlock name="Falcon Warriors" logoUrl={logoUrl} isFalcon />

            <div className="flex flex-col items-center">
              <div className="rounded-2xl border border-white/10 px-8 py-4">
                <span className="text-4xl font-black">{m.score_home}</span>
                <span className="mx-3 text-gold">:</span>
                <span className="text-4xl font-black">{m.score_away}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <span className={`rounded-full border px-4 py-1 text-xs uppercase ${won ? "border-emerald-500/30 text-gold" : lost ? "border-red-500/30 text-red-400" : "border-white/10 text-white/60"}`}>
                  {won ? "Victory" : lost ? "Defeat" : "Draw"}
                </span>

                {m.round_stage && (
                  <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase text-white/60">
                    {m.round_stage}
                  </span>
                )}
              </div>

              <div className="mt-3 text-xs uppercase tracking-widest text-white/40">
                {new Date(m.match_date).toLocaleDateString("en-US",{day:"2-digit",month:"short",year:"numeric"})}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <TeamBlock name={m.opponent_name} logoUrl={m.opponent_logo_url}/>
              <ChevronRight className="text-white/30 transition group-hover:translate-x-1 group-hover:text-gold"/>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
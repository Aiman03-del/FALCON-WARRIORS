import Link from "next/link";
import Image from "next/image";

type HistoryItem = {
  id: string;
  opponent_name: string;
  opponent_logo_url: string | null;
  round_stage: string | null;
  match_date: string;
  score_home: number;
  score_away: number;
};

export default function RoundHistoryList({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">No completed rounds yet.</p>;
  }

  return (
    <div className="card overflow-hidden">
      {items.map((m) => (
        <Link
          key={m.id}
          href={`/dashboard/matches/${m.id}`}
          className="flex items-center justify-between border-b border-border px-4 py-3 text-sm last:border-0 hover:bg-surface-2"
        >
          <div className="flex items-center gap-2">
            {m.opponent_logo_url && (
              <div className="relative h-6 w-6 overflow-hidden rounded-full bg-surface-2">
                <Image src={m.opponent_logo_url} alt={m.opponent_name} fill className="object-cover" />
              </div>
            )}
            <span className="font-medium">vs {m.opponent_name}</span>
            {m.round_stage && <span className="text-xs text-muted">· {m.round_stage}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">
              {new Date(m.match_date).toLocaleDateString()}
            </span>
            <span className="font-display font-bold text-gold">
              {m.score_home} - {m.score_away}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
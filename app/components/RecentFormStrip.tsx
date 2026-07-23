import Link from "next/link";
import { FormEntry } from "../lib/queries/playerForm";

const styles: Record<"W" | "D" | "L", string> = {
  W: "bg-indigo/25 text-indigo-light border-indigo/40",
  D: "bg-white/10 text-muted border-white/20",
  L: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function RecentFormStrip({ form }: { form: FormEntry[] }) {
  if (form.length === 0) {
    return <p className="text-sm text-muted">No completed matches yet.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex gap-1.5">
        {form.map((f, i) => (
          <span
            key={i}
            title={`vs ${f.opponentLabel} (${f.scoreLabel})`}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold ${styles[f.result]}`}
          >
            {f.result}
          </span>
        ))}
      </div>

      <div className="card overflow-hidden">
        {form.slice(0, 5).map((f, i) => {
          const content = (
            <div className="flex items-center justify-between px-4 py-2.5 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${styles[f.result]}`}
                >
                  {f.result}
                </span>
                <span className="text-white/80">vs {f.opponentLabel}</span>
              </div>
              <span className="font-display font-semibold text-gold">{f.scoreLabel}</span>
            </div>
          );

          return (
            <div key={i} className="border-b border-border last:border-0">
              {f.matchId ? (
                <Link href={`/matches/${f.matchId}`} className="block hover:bg-surface-2">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
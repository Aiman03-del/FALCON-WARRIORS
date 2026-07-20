import { Trophy } from "lucide-react";

type Achievement = { id: string; label: string };

export default function AchievementsTicker({
  achievements,
}: {
  achievements: Achievement[];
}) {
  if (achievements.length === 0) return null;

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 py-6">
        {achievements.map((a) => (
          <div key={a.id} className="flex items-center gap-2">
            <Trophy className="text-gold" size={18} />
            <span className="font-display text-sm font-bold uppercase tracking-wide text-white/90">
              {a.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
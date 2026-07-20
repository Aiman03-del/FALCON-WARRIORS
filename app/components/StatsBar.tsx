import { Users, Gamepad2, Trophy, TrendingUp } from "lucide-react";

type StatsBarProps = {
  stats: {
    members: number;
    matches: number;
    trophies: number;
    winRate: number;
  };
};

export default function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: "Members", value: `${stats.members}+`, icon: Users },
    { label: "Matches", value: `${stats.matches}+`, icon: Gamepad2 },
    { label: "Trophies", value: `${stats.trophies}`, icon: Trophy },
    { label: "Win Rate", value: `${stats.winRate}%`, icon: TrendingUp },
  ];

  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-8 sm:gap-4 sm:px-6 sm:py-10 sm:grid-cols-4">
        {items.map((stat) => (
          <div
            key={stat.label}
            className="card flex flex-col items-center justify-center gap-1.5 py-5 text-center sm:gap-2 sm:py-6"
          >
            <stat.icon className="text-gold" size={20} />
            <span className="font-display text-2xl font-bold text-gold sm:text-3xl">
              {stat.value}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted sm:text-xs">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
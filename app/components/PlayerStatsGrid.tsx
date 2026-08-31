type Stats = {
  goals: number;
  assists: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  motm_count: number;
};

export default function PlayerStatsGrid({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return <p className="text-sm text-[var(--fw-text-secondary)]">No stats recorded yet.</p>;
  }

  const winRate = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;

  const items = [
    { label: "Matches", value: stats.matches },
    { label: "Goals", value: stats.goals },
    { label: "Assists", value: stats.assists },
    { label: "Wins", value: stats.wins },
    { label: "Draws", value: stats.draws },
    { label: "Losses", value: stats.losses },
    { label: "MOTM", value: stats.motm_count },
    { label: "Win Rate", value: `${winRate}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="card rounded-[var(--fw-radius-lg)] border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-4 text-center">
          <p className="font-display text-2xl font-bold text-[var(--fw-brand)]">{item.value}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--fw-text-muted)]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
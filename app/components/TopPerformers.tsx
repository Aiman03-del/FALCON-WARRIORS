type Performer = {
  name: string;
  role: string;
  statLabel: string;
  statValue: string;
};

const performers: Performer[] = [
  { name: "StrikerPro", role: "GK", statLabel: "GOALS", statValue: "35" },
  { name: "FalconEye", role: "CB", statLabel: "ASSISTS", statValue: "6" },
  { name: "MidfieldGenie", role: "MF", statLabel: "PASSES", statValue: "342" },
  { name: "TheWall", role: "DF", statLabel: "TACKLES", statValue: "89" },
];

export default function TopPerformers() {
  return (
    <div>
      <div className="section-divider" />
      <h2 className="mb-5 font-display text-2xl font-bold uppercase tracking-wide">
        Top Performers
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {performers.map((p, i) => (
          <div key={i} className="card flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface2 text-xs font-bold text-gold">
              {p.role}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {p.name}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-gold">
                {p.statLabel}: {p.statValue}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default function ClubRecordCard({
  record,
}: {
  record: {
    totalMatches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    winRate: number;
  };
}) {
  const items = [
    { label: "Matches", value: record.totalMatches },
    { label: "Wins", value: record.wins },
    { label: "Draws", value: record.draws },
    { label: "Losses", value: record.losses },
    { label: "Goals For", value: record.goalsFor },
    { label: "Goals Against", value: record.goalsAgainst },
    { label: "Win Rate", value: `${record.winRate}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="card p-5 text-center">
          <p className="font-display text-2xl font-bold text-gold">{item.value}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

type Fixture = {
  day: string;
  month: string;
  opponent: string;
  competition: string;
  status: string;
  isLive?: boolean;
};

const fixtures: Fixture[] = [
  {
    day: "24",
    month: "NOV",
    opponent: "vs Apex Legends",
    competition: "Premier Pro Series",
    status: "LIVE IN 2D",
    isLive: true,
  },
  {
    day: "28",
    month: "NOV",
    opponent: "vs Alpha Squad",
    competition: "Elite Invitational",
    status: "6D 14H",
  },
  {
    day: "02",
    month: "DEC",
    opponent: "vs Cyber Kings",
    competition: "Global eChallenge",
    status: "11D",
  },
];

export default function Fixtures() {
  return (
    <div>
      <div className="section-divider" />
      <h2 className="mb-5 font-display text-2xl font-bold uppercase tracking-wide">
        Fixtures
      </h2>

      <div className="flex flex-col gap-3">
        {fixtures.map((fx, i) => (
          <div
            key={i}
            className="card flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex w-12 flex-col items-center leading-none">
                <span className="font-display text-xl font-bold text-gold">
                  {fx.day}
                </span>
                <span className="text-[10px] uppercase text-muted">
                  {fx.month}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {fx.opponent}
                </p>
                <p className="text-xs text-muted">{fx.competition}</p>
              </div>
            </div>

            <span
              className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                fx.isLive
                  ? "bg-indigo/20 text-indigo-light"
                  : "bg-white/10 text-white/60"
              }`}
            >
              {fx.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
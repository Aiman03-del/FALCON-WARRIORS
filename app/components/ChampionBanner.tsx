import { Trophy } from "lucide-react";

type Props = {
  name: string;
  avatarUrl?: string | null;
  subtitle?: string;
};

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "P"
  );
}

export default function ChampionBanner({ name, avatarUrl, subtitle }: Props) {
  return (
    <div className="relative mt-8 overflow-hidden rounded-2xl border border-gold/40 bg-linear-to-br from-gold/15 via-surface-2 to-indigo/10 p-6 text-center shadow-lg shadow-gold/10 sm:p-10">
      <Trophy
        className="pointer-events-none absolute -right-4 -top-4 rotate-12 text-gold/10"
        size={120}
      />
      <Trophy className="mx-auto mb-2 text-gold" size={36} />
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Champion</p>

      <div className="mx-auto mt-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-gold bg-linear-to-br from-gold to-indigo text-2xl font-bold text-white shadow-xl shadow-gold/30 sm:h-24 sm:w-24 sm:text-3xl">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          initialsOf(name)
        )}
      </div>

      <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
        {name}
      </h3>
      {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
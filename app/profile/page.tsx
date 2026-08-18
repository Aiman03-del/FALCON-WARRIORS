import FillButton from "@/app/components/FillButton";
import Link from "next/link";
import Image from "next/image";
import { Pencil, MapPin, Briefcase, GraduationCap, Star } from "lucide-react";
import { getMyProfile } from "../lib/queries/profile";
import { getPlayerForm } from "@/app/lib/queries/playerForm";
import Navbar from "../components/Navbar";
import PlayerStatsGrid from "../components/PlayerStatsGrid";
import RecentFormStrip from "@/app/components/RecentFormStrip";
import Footer from "../components/Footer";


function normalizeStats(stats: any) {
  if (Array.isArray(stats)) return stats[0] ?? null;
  return stats ?? null;
}

export default async function MyProfilePage() {
  const player = await getMyProfile();
  const form = await getPlayerForm(player.id);
  const stats = normalizeStats(player.player_stats);

  const infoRows = [
    { icon: MapPin, label: "Location", value: [player.city, player.country].filter(Boolean).join(", ") || "—" },
    { icon: Star, label: "Favorite Player", value: player.favorite_player || "—" },
    { icon: GraduationCap, label: "Education", value: player.education || "—" },
    { icon: Briefcase, label: "Profession", value: player.profession || "—" },
  ];

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-gold/40 bg-surface-2 sm:h-32 sm:w-32">
              {player.avatar_url ? (
                <Image
                  src={player.avatar_url}
                  alt={player.efootball_username}
                  fill
                  sizes="(max-width: 640px) 96px, 128px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-gold sm:text-3xl">
                  {player.efootball_username.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name & Badges */}
            <div className="text-center sm:text-left">
              <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
                {player.efootball_username}
              </h1>
              {player.real_name && (
                <p className="mt-1 text-sm text-muted">{player.real_name}</p>
              )}

              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {player.platform && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-muted">
                    {player.platform}
                  </span>
                )}
              </div>
            </div>
          </div>

          <FillButton href="/profile/edit" className="flex items-center gap-2 text-sm">
            <Pencil size={15} />
            Edit Profile
          </FillButton>
        </div>

        {/* Performance */}
        <div className="mt-8 sm:mt-10">
          <div className="section-divider" />
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide sm:text-xl">
            Performance
          </h2>
          <PlayerStatsGrid stats={stats} />
        </div>

        <div className="mt-10">
          <div className="section-divider" />
          <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wide">
            Recent Form
          </h2>
          <RecentFormStrip form={form} />
        </div>

        {/* About */}
        <div className="mt-8 sm:mt-10">
          <div className="section-divider" />
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide sm:text-xl">
            About
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {infoRows.map((row) => (
              <div key={row.label} className="card flex items-center gap-3 p-3 sm:p-4">
                <row.icon className="shrink-0 text-gold" size={16} />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted">{row.label}</p>
                  <p className="truncate text-sm font-medium">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
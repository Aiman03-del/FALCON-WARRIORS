import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Briefcase, GraduationCap, Shirt, Flag, Star, ArrowLeft, Pencil } from "lucide-react";
import { getPlayerBySlug } from "@/app/lib/queries/players";
import { getPlayerForm } from "@/app/lib/queries/playerForm";
import Navbar from "@/app/components/Navbar";
import PlayerStatsGrid from "@/app/components/PlayerStatsGrid";
import RecentFormStrip from "@/app/components/RecentFormStrip";
import Footer from "@/app/components/Footer";
import BackLink from "@/app/components/BackLink";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";


function normalizeStats(stats: any) {
  if (Array.isArray(stats)) return stats[0] ?? null;
  return stats ?? null;
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const player = await getPlayerBySlug(slug);
  if (!player) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = !!user && player.profile_id === user.id;

  const form = await getPlayerForm(player.id);

  const stats = normalizeStats(player.player_stats);

  const displayName = player.real_name?.trim() || player.efootball_username;
  const secondaryName = player.real_name?.trim() ? player.efootball_username : null;

  const infoRows = [
    { icon: MapPin, label: "Location", value: [player.city, player.country].filter(Boolean).join(", ") || "—" },
    { icon: Shirt, label: "Supported Club", value: player.supported_club || "—" },
    { icon: Flag, label: "National Team", value: player.national_team || "—" },
    { icon: Star, label: "Favorite Player", value: player.favorite_player || "—" },
    { icon: GraduationCap, label: "Education", value: player.education || "—" },
    { icon: Briefcase, label: "Profession", value: player.profession || "—" },
  ];

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Back link */}
<BackLink href="/players" label="Back to Roster" />

        {/* Profile Header */}
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-gold/40 bg-surface-2 sm:h-32 sm:w-32">
            {player.avatar_url ? (
              <Image
                src={player.avatar_url}
                alt={displayName}
                fill
                sizes="(max-width: 640px) 96px, 128px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-gold sm:text-3xl">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left">
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
              {displayName}
            </h1>
            {secondaryName && (
              <p className="mt-1 text-sm text-muted">{secondaryName}</p>
            )}

            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {player.platform && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-muted">
                  {player.platform}
                </span>
              )}
              {player.rank_division && (
                <span className="rounded-full bg-indigo/20 px-3 py-1 text-xs font-bold uppercase text-indigo-light">
                  {player.rank_division}
                </span>
              )}
            </div>

            {isOwner && (
              <Link
                href="/profile/edit"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-gold transition hover:border-gold/70 hover:bg-gold/20"
              >
                <Pencil size={12} />
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
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

        {player.join_date && (
          <p className="mt-6 text-center text-xs text-muted sm:mt-8">
            Member since {new Date(player.join_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        )}
      </section>
      <Footer />
    </main>
  );
}
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Briefcase, GraduationCap, Star, Trophy, Pencil } from "lucide-react";
import { getPlayerBySlug } from "@/app/lib/queries/players";
import { getPlayerForm } from "@/app/lib/queries/playerForm";
import { getPlayerBallonDorHistory } from "@/app/lib/queries/ballonDor";
import Navbar from "@/app/components/Navbar";
import PlayerStatsGrid from "@/app/components/PlayerStatsGrid";
import RecentFormStrip from "@/app/components/RecentFormStrip";
import Footer from "@/app/components/Footer";
import BackLink from "@/app/components/BackLink";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";


type Stats = {
  goals: number;
  assists: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  motm_count: number;
};

function normalizeStats(stats: unknown): Stats | null {
  const raw = Array.isArray(stats) ? stats[0] : stats;
  if (!raw || typeof raw !== "object") return null;

  const r = raw as Record<string, unknown>;

  return {
    goals: Number(r.goals) || 0,
    assists: Number(r.assists) || 0,
    matches: Number(r.matches) || 0,
    wins: Number(r.wins) || 0,
    draws: Number(r.draws) || 0,
    losses: Number(r.losses) || 0,
    motm_count: Number(r.motm_count) || 0,
  };
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
  const { wins: ballonDorWins, nominations: ballonDorNominations } = await getPlayerBallonDorHistory(player.id);

  const stats = normalizeStats(player.player_stats);

  const displayName = player.real_name?.trim() || player.efootball_username;
  const secondaryName = player.real_name?.trim() ? player.efootball_username : null;

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
        {/* Back link */}
        <BackLink href="/players" label="Back to Roster" />

        {/* Profile Header */}
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-[var(--fw-brand)]/40 bg-[var(--fw-bg-surface)] sm:h-32 sm:w-32">
            {player.avatar_url ? (
              <Image
                src={player.avatar_url}
                alt={displayName}
                fill
                sizes="(max-width: 640px) 96px, 128px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-[var(--fw-brand)] sm:text-3xl">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
                {displayName}
              </h1>
              {ballonDorWins.length > 0 && (
                <span
                  title={`Ballon d&apos;Or winner: ${ballonDorWins.join(", ")}`}
                  className="flex items-center gap-1 rounded-full border border-[var(--fw-brand)]/50 bg-[var(--fw-brand)]/15 px-2.5 py-1 text-xs font-bold text-[var(--fw-brand)]"
                >
                  <Trophy size={13} fill="currentColor" />
                  {ballonDorWins.length > 1 ? `×${ballonDorWins.length}` : ballonDorWins[0]}
                </span>
              )}
            </div>
            {secondaryName && (
              <p className="mt-1 text-sm text-[var(--fw-text-muted)]">{secondaryName}</p>
            )}

            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {player.platform && (
                <span className="rounded-full bg-[var(--fw-border)] px-3 py-1 text-xs font-bold uppercase text-[var(--fw-text-secondary)]">
                  {player.platform}
                </span>
              )}
              {player.rank_division && (
                <span className="rounded-full bg-[var(--fw-brand)]/20 px-3 py-1 text-xs font-bold uppercase text-[var(--fw-brand)]">
                  {player.rank_division}
                </span>
              )}
            </div>

            {isOwner && (
              <Link
                href="/profile/edit"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--fw-brand)]/40 bg-[var(--fw-brand)]/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--fw-brand)] transition hover:border-[var(--fw-brand)]/70 hover:bg-[var(--fw-brand)]/20"
              >
                <Pencil size={12} />
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Ballon d'Or history */}
        {(ballonDorWins.length > 0 || ballonDorNominations.length > 0) && (
          <div className="mt-8 sm:mt-10">
            <div className="section-divider" />
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-[var(--fw-text-primary)] sm:text-xl">
              <Trophy size={18} className="text-[var(--fw-brand)]" />
              Ballon d&apos;Or
            </h2>
            <div className="card flex flex-col gap-4 rounded-[var(--fw-radius-lg)] border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-4 sm:p-5">
              {ballonDorWins.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--fw-brand)]">Winner</p>
                  <div className="flex flex-wrap gap-2">
                    {ballonDorWins.map((year) => (
                      <span
                        key={year}
                        className="flex items-center gap-1.5 rounded-full border border-[var(--fw-brand)]/50 bg-[var(--fw-brand)]/15 px-3 py-1.5 text-sm font-bold text-[var(--fw-brand)]"
                      >
                        <Trophy size={13} fill="currentColor" />
                        {year}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {ballonDorNominations.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--fw-text-muted)]">Nominated</p>
                  <div className="flex flex-wrap gap-2">
                    {ballonDorNominations.map((year) => (
                      <span
                        key={year}
                        className="rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] px-3 py-1.5 text-sm font-medium text-[var(--fw-text-secondary)]"
                      >
                        {year}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 sm:mt-10">
          <div className="section-divider" />
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-[var(--fw-text-primary)] sm:text-xl">
            Performance
          </h2>
          <PlayerStatsGrid stats={stats} />
        </div>

        <div className="mt-10">
          <div className="section-divider" />
          <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-[var(--fw-text-primary)]">
            Recent Form
          </h2>
          <RecentFormStrip form={form} />
        </div>

        {/* About */}
        <div className="mt-8 sm:mt-10">
          <div className="section-divider" />
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-[var(--fw-text-primary)] sm:text-xl">
            About
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {infoRows.map((row) => (
              <div key={row.label} className="card flex items-center gap-3 rounded-[var(--fw-radius-lg)] border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-3 sm:p-4">
                <row.icon className="shrink-0 text-[var(--fw-brand)]" size={16} />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-[var(--fw-text-muted)]">{row.label}</p>
                  <p className="truncate text-sm font-medium text-[var(--fw-text-primary)]">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {player.join_date && (
          <p className="mt-6 text-center text-xs text-[var(--fw-text-muted)] sm:mt-8">
            Member since {new Date(player.join_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        )}
      </section>
      <Footer />
    </main>
  );
}
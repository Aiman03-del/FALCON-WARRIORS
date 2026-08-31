"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, MapPin, Briefcase, GraduationCap, Star, ArrowLeft, Check, X } from "lucide-react";
import FillButton from "@/app/components/FillButton";
import ProfileEditForm from "@/app/components/ProfileEditForm";
import PlayerStatsGrid from "@/app/components/PlayerStatsGrid";
import RecentFormStrip from "@/app/components/RecentFormStrip";
import { createClient } from "@/app/lib/supabase/client";
import type { FormEntry } from "@/app/lib/queries/playerForm";

type PlayerStats = {
  goals: number;
  assists: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  motm_count: number;
} | null;

type PlayerStatsSource = PlayerStats | PlayerStats[] | null | undefined;

type Player = {
  id: string;
  profile_id: string;
  slug: string;
  efootball_username: string;
  real_name: string | null;
  age: number | null;
  country: string | null;
  city: string | null;
  supported_club: string | null;
  national_team: string | null;
  favorite_player: string | null;
  education: string | null;
  profession: string | null;
  platform: string | null;
  avatar_url: string | null;
  membership_status: string | null;
  join_date: string | null;
  is_academic_player: boolean;
  role: string;
};

function normalizeStats(stats: PlayerStatsSource): PlayerStats {
  if (Array.isArray(stats)) return stats[0] ?? null;
  return stats ?? null;
}

export default function UserProfileView({
  player,
  form,
  isAdmin,
}: {
  player: Player;
  form: FormEntry[];
  isAdmin: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const stats = normalizeStats(
    (player as Player & { player_stats?: PlayerStatsSource }).player_stats ?? null
  );

  async function setStatus(status: "active" | "rejected") {
    setStatusBusy(true);
    await supabase.from("player_details").update({ membership_status: status }).eq("id", player.id);
    setStatusBusy(false);
    router.refresh();
  }

  const infoRows = [
    { icon: MapPin, label: "Location", value: [player.city, player.country].filter(Boolean).join(", ") || "—" },
    { icon: Star, label: "Favorite Player", value: player.favorite_player || "—" },
    { icon: GraduationCap, label: "Education", value: player.education || "—" },
    { icon: Briefcase, label: "Profession", value: player.profession || "—" },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/dashboard/users"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to Users
      </Link>

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
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase text-gold">
                {player.role}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  player.membership_status === "active"
                    ? "bg-indigo/20 text-indigo-light"
                    : player.membership_status === "pending"
                    ? "bg-gold/15 text-gold"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {player.membership_status ?? "unknown"}
              </span>
              {player.is_academic_player && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-muted">
                  Academic
                </span>
              )}
            </div>
          </div>
        </div>

        {isAdmin && player.membership_status === "pending" && (
          <div className="flex gap-2">
            <button
              disabled={statusBusy}
              onClick={() => setStatus("active")}
              className="flex items-center gap-1.5 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-sm font-medium text-gold hover:bg-gold/20 disabled:opacity-50"
            >
              <Check size={15} /> Approve
            </button>
            <button
              disabled={statusBusy}
              onClick={() => setStatus("rejected")}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <X size={15} /> Reject
            </button>
          </div>
        )}

        {isAdmin && (
          <FillButton
            onClick={() => setIsEditing((v) => !v)}
            className="flex items-center gap-2 text-sm"
          >
            <Pencil size={15} />
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </FillButton>
        )}
      </div>

      {isEditing ? (
        <div className="mt-8 sm:mt-10">
          <div className="section-divider" />
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide sm:text-xl">
            Edit Profile
          </h2>
          <ProfileEditForm
            player={player}
            redirectTo={`/dashboard/users/${player.slug}`}
          />
        </div>
      ) : (
        <>
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
        </>
      )}
    </section>
  );
}
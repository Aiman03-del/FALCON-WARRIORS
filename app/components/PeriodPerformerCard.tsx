"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { createClient } from "../lib/supabase/client";

type Period = "weekly" | "monthly" | "yearly";

type PlayerDetail = {
  id: string;
  slug: string | null;
  efootball_username: string;
  real_name: string | null;
  avatar_url: string | null;
  membership_status?: string | null;
};

type Performer = {
  playerId: string;
  slug?: string | null;
  username: string;
  realName: string | null;
  avatarUrl: string | null;
  wins: number;
  motm: number;
  goals: number;
};

type PeriodAccumulator = {
  wins: number;
  motm: number;
  goals: number;
};

const periodLabels: Record<Period, string> = {
  weekly: "This Week",
  monthly: "This Month",
  yearly: "This Year",
};

function getPeriodStart(period: Period): Date {
  const now = new Date();

  if (period === "weekly") {
    const diffToMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const start = new Date(now);
    start.setDate(now.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "monthly") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return new Date(now.getFullYear(), 0, 1);
}

export default function PeriodPerformerCard() {
  const supabase = createClient();
  const [period, setPeriod] = useState<Period>("monthly");
  const [performer, setPerformer] = useState<Performer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const start = getPeriodStart(period).toISOString();
      const accumulator: Record<string, PeriodAccumulator> = {};
      const playerInfo: Record<string, PlayerDetail> = {};

      const { data: activePlayers } = await supabase
        .from("player_details")
        .select("id, slug, efootball_username, real_name, avatar_url, membership_status")
        .eq("membership_status", "active");

      for (const row of activePlayers ?? []) {
        accumulator[row.id] = { wins: 0, motm: 0, goals: 0 };
        playerInfo[row.id] = row;
      }

      const { data: internalMatches } = await supabase
        .from("matches")
        .select("player1_id, player2_id, score_home, score_away, match_date")
        .eq("match_type", "internal")
        .eq("status", "completed")
        .gte("match_date", start);

      for (const match of internalMatches ?? []) {
        if (match.score_home === null || match.score_away === null) continue;
        if (!match.player1_id || !match.player2_id) continue;

        accumulator[match.player1_id] ??= { wins: 0, motm: 0, goals: 0 };
        accumulator[match.player2_id] ??= { wins: 0, motm: 0, goals: 0 };

        accumulator[match.player1_id].goals += Number(match.score_home ?? 0);
        accumulator[match.player2_id].goals += Number(match.score_away ?? 0);

        if (match.score_home > match.score_away) {
          accumulator[match.player1_id].wins += 1;
        } else if (match.score_away > match.score_home) {
          accumulator[match.player2_id].wins += 1;
        }
      }

      const { data: tournamentMatches } = await supabase
        .from("tournament_matches")
        .select("player1_id, player2_id, player1_score, player2_score, created_at")
        .eq("status", "completed")
        .gte("created_at", start);

      for (const match of tournamentMatches ?? []) {
        if (match.player1_score === null || match.player2_score === null) continue;
        if (!match.player1_id || !match.player2_id) continue;

        accumulator[match.player1_id] ??= { wins: 0, motm: 0, goals: 0 };
        accumulator[match.player2_id] ??= { wins: 0, motm: 0, goals: 0 };

        accumulator[match.player1_id].goals += Number(match.player1_score ?? 0);
        accumulator[match.player2_id].goals += Number(match.player2_score ?? 0);

        if (match.player1_score > match.player2_score) {
          accumulator[match.player1_id].wins += 1;
        } else if (match.player2_score > match.player1_score) {
          accumulator[match.player2_id].wins += 1;
        }
      }

      const { data: externalMatches } = await supabase
        .from("matches")
        .select("id, score_home, score_away, match_date")
        .eq("match_type", "external")
        .eq("status", "completed")
        .gte("match_date", start);

      if (externalMatches && externalMatches.length > 0) {
        const externalIds = externalMatches.map((match) => match.id);

        const { data: squadRows } = await supabase
          .from("match_squad")
          .select("match_id, player_id")
          .in("match_id", externalIds);

        const { data: goalEntries } = await supabase
          .from("match_goal_entries")
          .select("match_id, player_id, goals")
          .in("match_id", externalIds);

        const goalMap: Record<string, Record<string, number>> = {};
        for (const entry of goalEntries ?? []) {
          if (!entry.match_id || !entry.player_id) continue;
          goalMap[entry.match_id] ??= {};
          goalMap[entry.match_id][entry.player_id] = Number(entry.goals ?? 0);
        }

        for (const match of externalMatches) {
          for (const row of squadRows ?? []) {
            if (row.match_id !== match.id || !row.player_id) continue;

            accumulator[row.player_id] ??= { wins: 0, motm: 0, goals: 0 };
            accumulator[row.player_id].goals += Number(goalMap[match.id]?.[row.player_id] ?? 0);

            if (match.score_home !== null && match.score_away !== null && match.score_home > match.score_away) {
              accumulator[row.player_id].wins += 1;
            }
          }
        }
      }

      const { data: motmEvents } = await supabase
        .from("match_events")
        .select("scorer_id, created_at")
        .eq("event_type", "motm")
        .gte("created_at", start);

      for (const event of motmEvents ?? []) {
        if (!event.scorer_id) continue;
        accumulator[event.scorer_id] ??= { wins: 0, motm: 0, goals: 0 };
        accumulator[event.scorer_id].motm += 1;
      }

      const playerIds = Object.keys(accumulator).filter((id) => playerInfo[id]);
      const ranked = playerIds
        .map((playerId) => {
          const info = playerInfo[playerId];
          const stats = accumulator[playerId];

          if (!info || stats.wins + stats.motm + stats.goals <= 0) return null;

          return {
            playerId,
            username: info.efootball_username,
            realName: info.real_name ?? null,
            avatarUrl: info.avatar_url,
            slug: info.slug ?? null,
            wins: stats.wins,
            motm: stats.motm,
            goals: stats.goals,
          } satisfies Performer;
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        .sort((a, b) => {
          const scoreA = a.wins + a.motm;
          const scoreB = b.wins + b.motm;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return b.goals - a.goals;
        });

      if (!active) return;
      setPerformer(ranked[0] ?? null);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [period, supabase]);

  return (
    <div>
      <div className="flex gap-2">
        {(["weekly", "monthly", "yearly"] as Period[]).map((item) => (
          <button
            key={item}
            onClick={() => setPeriod(item)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
              period === item ? "bg-gold text-bg" : "bg-surface-2 text-muted hover:text-white"
            }`}
          >
            {periodLabels[item]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="card h-24 animate-pulse" />
        ) : performer ? (
          <Link
            href={`/players/${performer.slug ?? performer.playerId}`}
            className="card flex flex-col gap-4 border-gold/30 bg-linear-to-r from-gold/10 via-surface to-surface p-4 sm:flex-row sm:items-center sm:p-5"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gold/50 bg-surface-2 sm:h-14 sm:w-14">
              {performer.avatarUrl ? (
                <Image
                  src={performer.avatarUrl}
                  alt={performer.realName || performer.username || "Player"}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-gold">
                  {(performer.realName || performer.username || "??").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                <Sparkles size={12} />
                Top Performer — {periodLabels[period]}
              </p>
              <p className="mt-1 text-lg font-semibold text-white sm:text-xl">
                {performer.realName || performer.username}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: "Wins", value: performer.wins },
                  { label: "MOTM", value: performer.motm },
                  { label: "Goals", value: performer.goals },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-center"
                  >
                    <div className="text-[10px] uppercase tracking-wide text-muted">{stat.label}</div>
                    <div className="text-sm font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ) : (
          <div className="card p-6 text-center text-sm text-muted">
            No results recorded {periodLabels[period].toLowerCase()} yet.
          </div>
        )}
      </div>
    </div>
  );
}

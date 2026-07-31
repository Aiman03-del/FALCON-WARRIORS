"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { createClient } from "../lib/supabase/client";

type Period = "weekly" | "monthly" | "yearly";

const periodLabels: Record<Period, string> = {
  weekly: "This Week",
  monthly: "This Month",
  yearly: "This Year",
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
} | null;

function getPeriodStart(period: Period): Date {
  const now = new Date();
  if (period === "weekly") {
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(now);
    start.setDate(now.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (period === "monthly") return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(now.getFullYear(), 0, 1);
}

export default function PeriodPerformerCard() {
  const supabase = createClient();
  const [period, setPeriod] = useState<Period>("monthly");
  const [performer, setPerformer] = useState<Performer>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const start = getPeriodStart(period).toISOString();

      const goalMap: Record<string, number> = {};
      const winMap: Record<string, number> = {};
      const motmMap: Record<string, number> = {};
      const playerInfo: Record<string, { username: string; realName: string | null; avatarUrl: string | null; slug: string | null }> = {};

      // 1. Internal matches (player vs player)
      const { data: internalMatches } = await supabase
        .from("matches")
        .select(
          "player1_id, player2_id, score_home, score_away, match_date, player1:player1_id(id, slug, efootball_username, real_name, avatar_url), player2:player2_id(id, slug, efootball_username, real_name, avatar_url)"
        )
        .eq("match_type", "internal")
        .eq("status", "completed")
        .gte("match_date", start);

      for (const m of (internalMatches ?? []) as any[]) {
        if (m.score_home === null || m.score_away === null) continue;
        const p1 = Array.isArray(m.player1) ? m.player1[0] : m.player1;
        const p2 = Array.isArray(m.player2) ? m.player2[0] : m.player2;
        if (p1) {
          goalMap[p1.id] = (goalMap[p1.id] ?? 0) + m.score_home;
          playerInfo[p1.id] = {
            username: p1.efootball_username,
            realName: p1.real_name ?? null,
            avatarUrl: p1.avatar_url,
            slug: p1.slug ?? null,
          };
        }
        if (p2) {
          goalMap[p2.id] = (goalMap[p2.id] ?? 0) + m.score_away;
          playerInfo[p2.id] = {
            username: p2.efootball_username,
            realName: p2.real_name ?? null,
            avatarUrl: p2.avatar_url,
            slug: p2.slug ?? null,
          };
        }
        if (m.score_home > m.score_away && p1) winMap[p1.id] = (winMap[p1.id] ?? 0) + 1;
        else if (m.score_away > m.score_home && p2) winMap[p2.id] = (winMap[p2.id] ?? 0) + 1;
      }

      // 2. External matches (single "played by" player)
      const { data: externalMatches } = await supabase
        .from("matches")
        .select("id, score_home, score_away, match_date")
        .eq("match_type", "external")
        .eq("status", "completed")
        .gte("match_date", start);

      if (externalMatches && externalMatches.length > 0) {
        const ids = externalMatches.map((m) => m.id);
        const { data: squadRows } = await supabase
          .from("match_squad")
          .select("match_id, player_id, player_details(id, slug, efootball_username, real_name, avatar_url)")
          .in("match_id", ids);

        const byMatch: Record<string, any> = {};
        for (const row of (squadRows ?? []) as any[]) {
          byMatch[row.match_id] = Array.isArray(row.player_details)
            ? row.player_details[0]
            : row.player_details;
        }

        for (const m of externalMatches) {
          const p = byMatch[m.id];
          if (!p || m.score_home === null) continue;
          goalMap[p.id] = (goalMap[p.id] ?? 0) + m.score_home;
          playerInfo[p.id] = {
            username: p.efootball_username,
            realName: p.real_name ?? null,
            avatarUrl: p.avatar_url,
            slug: p.slug ?? null,
          };
          if (m.score_away !== null && m.score_home > m.score_away) {
            winMap[p.id] = (winMap[p.id] ?? 0) + 1;
          }
        }
      }

      // 3. Internal tournament matches
      const { data: tournamentMatches } = await supabase
        .from("tournament_matches")
        .select(
          "player1_id, player2_id, player1_score, player2_score, status, created_at, tournaments!inner(status)"
        )
        .eq("status", "completed")
        .gte("created_at", start);

      if (tournamentMatches && tournamentMatches.length > 0) {
        const playerIds = Array.from(
          new Set(
            tournamentMatches.flatMap((m: any) => [m.player1_id, m.player2_id]).filter(Boolean)
          )
        );
        const { data: playerRows } = await supabase
          .from("player_details")
          .select("id, slug, efootball_username, real_name, avatar_url")
          .in("id", playerIds);

        const playerLookup: Record<string, any> = {};
        for (const p of playerRows ?? []) playerLookup[p.id] = p;

        for (const m of tournamentMatches as any[]) {
          if (!m.player1_id || !m.player2_id) continue;
          if (m.player1_score === null || m.player2_score === null) continue;

          const p1 = playerLookup[m.player1_id];
          const p2 = playerLookup[m.player2_id];
          if (p1) {
            goalMap[p1.id] = (goalMap[p1.id] ?? 0) + m.player1_score;
            playerInfo[p1.id] = {
              username: p1.efootball_username,
              realName: p1.real_name ?? null,
              avatarUrl: p1.avatar_url,
              slug: p1.slug ?? null,
            };
          }
          if (p2) {
            goalMap[p2.id] = (goalMap[p2.id] ?? 0) + m.player2_score;
            playerInfo[p2.id] = {
              username: p2.efootball_username,
              realName: p2.real_name ?? null,
              avatarUrl: p2.avatar_url,
              slug: p2.slug ?? null,
            };
          }
          if (m.player1_score > m.player2_score && p1) winMap[p1.id] = (winMap[p1.id] ?? 0) + 1;
          else if (m.player2_score > m.player1_score && p2) winMap[p2.id] = (winMap[p2.id] ?? 0) + 1;
        }
      }

      // 4. MOTM awards (internal + external matches only — tournament fixtures
      // don't have a MOTM picker yet)
      const { data: motmEvents } = await supabase
        .from("match_events")
        .select("scorer_id, matches!inner(status, match_date)")
        .eq("event_type", "motm")
        .eq("matches.status", "completed")
        .gte("matches.match_date", start);

      for (const e of (motmEvents ?? []) as any[]) {
        if (!e.scorer_id) continue;
        motmMap[e.scorer_id] = (motmMap[e.scorer_id] ?? 0) + 1;
      }

      // MOTM লুপে playerInfo সেট হয় না (শুধু scorer_id থাকে) — যাদের গোল/জয়
      // কোনোটাই এই পিরিয়ডে নেই কিন্তু MOTM আছে, তাদের নাম/এভাটার এখানে আলাদাভাবে আনা হচ্ছে
      const missingIds = Object.keys(motmMap).filter((id) => !playerInfo[id]);
      if (missingIds.length > 0) {
        const { data: missingRows } = await supabase
          .from("player_details")
          .select("id, slug, efootball_username, real_name, avatar_url")
          .in("id", missingIds);

        for (const p of missingRows ?? []) {
          playerInfo[p.id] = {
            username: p.efootball_username,
            realName: p.real_name ?? null,
            avatarUrl: p.avatar_url,
            slug: p.slug ?? null,
          };
        }
      }

      if (!active) return;

      // Rank by (wins + motm) first, tiebreak by goals
      const allIds = new Set([
        ...Object.keys(winMap),
        ...Object.keys(motmMap),
        ...Object.keys(goalMap),
      ]);

      const ranked = Array.from(allIds)
        .map((id) => ({
          playerId: id,
          wins: winMap[id] ?? 0,
          motm: motmMap[id] ?? 0,
          goals: goalMap[id] ?? 0,
        }))
        .filter((p) => p.wins + p.motm + p.goals > 0)
        .sort((a, b) => {
          const scoreA = a.wins + a.motm;
          const scoreB = b.wins + b.motm;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return b.goals - a.goals;
        });

      if (ranked.length === 0) {
        setPerformer(null);
      } else {
        const top = ranked[0];
        setPerformer({ ...top, ...playerInfo[top.playerId] } as Performer);
      }

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
        {(["weekly", "monthly", "yearly"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
              period === p ? "bg-gold text-bg" : "bg-surface-2 text-muted hover:text-white"
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="card h-24 animate-pulse" />
        ) : performer ? (
          <Link
            href={`/players/${performer.slug ?? performer.playerId}`}
            className="card flex items-center gap-4 border-gold/30 bg-linear-to-r from-gold/10 to-surface p-5"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-gold/50 bg-surface-2">
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
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                <Sparkles size={12} />
                Top Performer — {periodLabels[period]}
              </p>
              <p className="mt-1 text-lg font-semibold">{performer.realName || performer.username}</p>
              <p className="text-xs text-muted">
                {performer.wins} wins · {performer.motm} MOTM · {performer.goals} goals
              </p>
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
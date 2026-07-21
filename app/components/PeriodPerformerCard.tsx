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

type Performer = { playerId: string; username: string; avatarUrl: string | null; count: number } | null;

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
      const start = getPeriodStart(period);

      const { data: events } = await supabase
        .from("match_events")
        .select("scorer_id, event_type, created_at, player_details(id, efootball_username, avatar_url)")
        .eq("event_type", "goal")
        .gte("created_at", start.toISOString());

      if (!active) return;

      if (!events || events.length === 0) {
        setPerformer(null);
        setLoading(false);
        return;
      }

      const countMap: Record<string, { username: string; avatarUrl: string | null; count: number }> = {};
      for (const e of events as any[]) {
        const pd = Array.isArray(e.player_details) ? e.player_details[0] : e.player_details;
        if (!pd) continue;
        if (!countMap[pd.id]) countMap[pd.id] = { username: pd.efootball_username, avatarUrl: pd.avatar_url, count: 0 };
        countMap[pd.id].count++;
      }

      const sorted = Object.entries(countMap).sort((a, b) => b[1].count - a[1].count);
      if (sorted.length === 0) {
        setPerformer(null);
      } else {
        const [playerId, info] = sorted[0];
        setPerformer({ playerId, ...info });
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
            href={`/players/${performer.playerId}`}
            className="card flex items-center gap-4 border-gold/30 bg-gradient-to-r from-gold/10 to-surface p-5"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-gold/50 bg-surface-2">
              {performer.avatarUrl ? (
                <Image src={performer.avatarUrl} alt={performer.username} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-gold">
                  {performer.username.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                <Sparkles size={12} />
                Top Performer — {periodLabels[period]}
              </p>
              <p className="mt-1 text-lg font-semibold">{performer.username}</p>
              <p className="text-xs text-muted">{performer.count} goals</p>
            </div>
          </Link>
        ) : (
          <div className="card p-6 text-center text-sm text-muted">
            No goals recorded {periodLabels[period].toLowerCase()} yet.
          </div>
        )}
      </div>
    </div>
  );
}
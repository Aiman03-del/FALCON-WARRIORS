"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import FixtureRow from "./FixtureRow";
import {
  generateKnockoutFromGroups,
  generateKnockoutNextRound,
  generateSeededKnockoutRound1,
} from "@/app/lib/fixtures/generateFixtures";

type Match = {
  id: string;
  round: number;
  match_order: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  winner_id: string | null;
  status: string;
  stage: string | null;
  group_name?: string | null;
  is_third_place?: boolean | null;
};

type ParticipantOption = { id: string; username: string; avatar_url?: string | null };

type PlayerDetails = { id: string; efootball_username: string } | { id: string; efootball_username: string }[] | null;
type StandingRow = { player_id: string; points?: number; player_details: PlayerDetails };

type Props = {
  tournamentId: string;
  tournamentStatus: string;
  format: string;
  matches: Match[];
  participants: ParticipantOption[];
  byeMethod: "seed" | "random";
  thirdPlaceMatch: boolean;
  groupStandings: { groupName: string; standings: StandingRow[] }[];
  qualifiersPerGroup: number;
  leagueStandings: StandingRow[];
  playoffSize: number;
};

function getUsername(pd: PlayerDetails): string {
  const p = Array.isArray(pd) ? pd[0] : pd;
  return p?.efootball_username ?? "Unknown";
}

function isDone(m: Match) {
  return m.status === "completed" || m.status === "bye";
}

const STAGE_PRIORITY: Record<string, number> = { group: 0, league: 1, knockout: 2 };

export default function FixturesStepper({
  tournamentId,
  tournamentStatus,
  format,
  matches,
  participants,
  byeMethod,
  thirdPlaceMatch,
  groupStandings,
  qualifiersPerGroup,
  leagueStandings,
  playoffSize,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [index, setIndex] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, { stage: string | null; round: number; matches: Match[] }>();
    for (const m of matches) {
      const stage = m.stage ?? null;
      const key = `${stage ?? "main"}::${m.round}`;
      if (!map.has(key)) map.set(key, { stage, round: m.round, matches: [] });
      map.get(key)!.matches.push(m);
    }
    for (const g of map.values()) g.matches.sort((a, b) => a.match_order - b.match_order);
    return Array.from(map.values()).sort((a, b) => {
      const pa = STAGE_PRIORITY[a.stage ?? ""] ?? 1;
      const pb = STAGE_PRIORITY[b.stage ?? ""] ?? 1;
      if (pa !== pb) return pa - pb;
      return a.round - b.round;
    });
  }, [matches]);

  // Default: first incomplete round, otherwise the very last round — only set once,
  // then respect the user's navigation/generated index.
  useEffect(() => {
    if (index !== null) return;
    if (groups.length === 0) return;
    const idx = groups.findIndex((g) => !g.matches.every(isDone));
    setIndex(idx === -1 ? groups.length - 1 : idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups.length]);

  const currentIndex = Math.min(index ?? 0, Math.max(groups.length - 1, 0));
  const current = groups[currentIndex] ?? null;
  const currentComplete = current ? current.matches.every(isDone) : false;
  const atLastStep = currentIndex === groups.length - 1;

  // Check whether there is actually anything to generate after this round.
  const needsAction =
    !!current &&
    ((current.stage === "knockout" && current.matches.filter((m) => !m.is_third_place).length > 1) ||
      (current.stage === "group" && format === "group_knockout") ||
      (current.stage === "league" && format === "league_playoff"));

  // When the knockout final is finished and a champion is decided, the tournament
  // can automatically move to "completed".
  const championId = useMemo(() => {
    if (!current || current.stage !== "knockout" || !atLastStep) return null;
    const realMatches = current.matches.filter((m) => !m.is_third_place);
    if (realMatches.length !== 1) return null;
    const m = realMatches[0];
    if (m.status === "bye") return m.player1_id;
    if (m.status === "completed") return m.winner_id;
    return null;
  }, [current, atLastStep]);

  const championName = championId ? participants.find((p) => p.id === championId)?.username ?? "Unknown" : null;

  // In a pure "league" format there is no knockout stage — when the final round
  // finishes, the top team in the points table is the champion.
  const leagueChampionName = useMemo(() => {
    if (format !== "league") return null;
    if (!current || current.stage !== "league" || !atLastStep || !currentComplete) return null;
    const top = leagueStandings[0];
    return top ? getUsername(top.player_details) : null;
  }, [format, current, atLastStep, currentComplete, leagueStandings]);

  useEffect(() => {
    if (!championId || tournamentStatus === "completed") return;
    supabase
      .from("tournaments")
      .update({ status: "completed" })
      .eq("id", tournamentId)
      .neq("status", "completed")
      .then(() => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [championId, tournamentStatus, tournamentId]);

  async function generateNext() {
    if (!current) return;
    setError(null);
    setGenerating(true);
    try {
      if (current.stage === "knockout") {
        const realMatches = current.matches.filter((m) => !m.is_third_place);
        const winners = realMatches
          .map((m) => (m.status === "bye" ? m.player1_id : m.winner_id))
          .filter((id): id is string => !!id);

        if (winners.length < 2) {
          setGenerating(false);
          return;
        }

        const winnerPlayers = winners
          .map((id) => participants.find((p) => p.id === id))
          .filter((p): p is ParticipantOption => !!p)
          .map((p) => ({ id: p.id, username: p.username }));

        const alreadyByedIds = new Set(
          matches.filter((m) => m.status === "bye" && m.player1_id).map((m) => m.player1_id as string)
        );

        const drafts = generateKnockoutNextRound(winnerPlayers, current.round + 1, alreadyByedIds);
        const rows: any[] = drafts.map((d) => ({
          tournament_id: tournamentId,
          round: d.round,
          match_order: d.match_order,
          player1_id: d.player1_id,
          player2_id: d.player2_id,
          status: d.status,
          stage: "knockout",
          is_third_place: false,
        }));

        if (thirdPlaceMatch && winners.length === 2 && realMatches.length === 2) {
          const losers = realMatches
            .filter((m) => m.status === "completed" && m.player1_id && m.player2_id && m.winner_id)
            .map((m) => (m.winner_id === m.player1_id ? m.player2_id : m.player1_id))
            .filter((id): id is string => !!id);

          if (losers.length === 2) {
            rows.push({
              tournament_id: tournamentId,
              round: current.round + 1,
              match_order: Math.max(...drafts.map((d) => d.match_order)) + 1,
              player1_id: losers[0],
              player2_id: losers[1],
              status: "scheduled",
              stage: "knockout",
              is_third_place: true,
            });
          }
        }

        const { error: insertError } = await supabase.from("tournament_matches").insert(rows);
        if (insertError) throw new Error(insertError.message);
      } else if (current.stage === "group") {
        const allGroupMatches = matches.filter((m) => m.stage === "group");
        if (!allGroupMatches.every(isDone)) {
          setGenerating(false);
          return;
        }

        const groupsForDraw = groupStandings.map((g) => ({
          groupName: g.groupName,
          ranked: g.standings.slice(0, qualifiersPerGroup).map((row) => ({
            id: row.player_id,
            username: getUsername(row.player_details),
          })),
        }));

        const drafts = generateKnockoutFromGroups(groupsForDraw, qualifiersPerGroup);
        const rows = drafts.map((d) => ({
          tournament_id: tournamentId,
          round: d.round,
          match_order: d.match_order,
          player1_id: d.player1_id,
          player2_id: d.player2_id,
          status: d.status,
          stage: "knockout",
        }));

        const { error: insertError } = await supabase.from("tournament_matches").insert(rows);
        if (insertError) throw new Error(insertError.message);
      } else if (current.stage === "league" && format === "league_playoff") {
        const allLeagueMatches = matches.filter((m) => m.stage === "league");
        if (!allLeagueMatches.every(isDone)) {
          setGenerating(false);
          return;
        }

        if (leagueStandings.length < playoffSize) {
          setError(`At least ${playoffSize} ranked players are required for the playoff.`);
          setGenerating(false);
          return;
        }

        const topN = leagueStandings.slice(0, playoffSize).map((row, i) => ({
          id: row.player_id,
          username: getUsername(row.player_details),
          seed: i + 1,
        }));

        const drafts = generateSeededKnockoutRound1(topN);
        const rows = drafts.map((d) => ({
          tournament_id: tournamentId,
          round: d.round,
          match_order: d.match_order,
          player1_id: d.player1_id,
          player2_id: d.player2_id,
          status: d.status,
          stage: "knockout",
        }));

        const { error: insertError } = await supabase.from("tournament_matches").insert(rows);
        if (insertError) throw new Error(insertError.message);
      }

      setIndex(groups.length); // the new round will be at this index
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate the next round.");
    } finally {
      setGenerating(false);
    }
  }

  if (groups.length === 0 || current === null) {
    return <p className="mt-10 text-center text-sm text-muted">No fixtures generated yet.</p>;
  }

  const nextRoundAlreadyExists = currentIndex < groups.length - 1;
  const canGoNext = nextRoundAlreadyExists
    ? currentComplete
    : currentComplete && needsAction && !championId;
  const canGoPrev = currentIndex > 0;

  const stageLabel =
    current.stage === "group"
      ? "Group Stage"
      : current.stage === "knockout"
      ? "Knockout"
      : current.stage === "league"
      ? "League"
      : null;

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => canGoPrev && setIndex(currentIndex - 1)}
          disabled={!canGoPrev}
          className="btn-outline flex items-center gap-1 px-3 py-2 text-xs disabled:opacity-30"
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        <div className="text-center">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-gold">
            {stageLabel ? `${stageLabel} — Round ${current.round}` : `Round ${current.round}`}
          </h2>
          <p className="mt-0.5 text-[11px] text-muted">
            Step {currentIndex + 1} of {groups.length}
          </p>
        </div>

        <button
          onClick={() => {
            if (!canGoNext) return;
            if (nextRoundAlreadyExists) setIndex(currentIndex + 1);
            else generateNext();
          }}
          disabled={!canGoNext || generating}
          className="btn-outline flex items-center gap-1 px-3 py-2 text-xs disabled:opacity-30"
        >
          {generating ? "Generating..." : "Next"}
          {!generating && <ChevronRight size={14} />}
        </button>
      </div>

      <div key={currentIndex} className="round-step-slide flex flex-col gap-3">
        {current.matches.map((m) => (
          <FixtureRow
            key={m.id}
            match={m as any}
            allParticipants={participants}
            tournamentId={tournamentId}
            format={format}
          />
        ))}
      </div>

      {!currentComplete && (
        <p className="mt-4 text-center text-xs text-muted">
          Once all match results in this round are saved, the Next button will be enabled.
        </p>
      )}

      {championId && championName && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-gold/50 bg-gold/10 px-4 py-3">
          <Trophy size={18} className="text-gold" />
          <p className="text-sm font-semibold text-white">
            Champion: <span className="text-gold">{championName}</span>
          </p>
        </div>
      )}

      {leagueChampionName && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-gold/50 bg-gold/10 px-4 py-3">
          <Trophy size={18} className="text-gold" />
          <p className="text-sm font-semibold text-white">
            Champion: <span className="text-gold">{leagueChampionName}</span>
          </p>
        </div>
      )}

      {currentComplete && atLastStep && !needsAction && !championId && !leagueChampionName && (
        <p className="mt-4 text-center text-xs text-muted">Tournament complete — no further rounds.</p>
      )}

      {error && <p className="mt-3 text-center text-xs text-gold">{error}</p>}

      <style>{`
        @keyframes roundStepSlide {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .round-step-slide { animation: roundStepSlide 0.35s ease-out; }
      `}</style>
    </div>
  );
}
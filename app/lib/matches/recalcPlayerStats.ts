import { SupabaseClient } from "@supabase/supabase-js";

type Stat = {
  goals: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  motm_count: number;
};

function emptyStat(): Stat {
  return { goals: 0, matches: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, motm_count: 0 };
}

export async function recalcAllPlayerStats(supabase: SupabaseClient) {
  const { data: players } = await supabase.from("player_details").select("id");
  if (!players || players.length === 0) return;

  const statsMap: Record<string, Stat> = {};
  for (const p of players) statsMap[p.id] = emptyStat();

  // 1. Internal matches (player vs player)
  const { data: internalMatches } = await supabase
    .from("matches")
    .select("player1_id, player2_id, score_home, score_away")
    .eq("match_type", "internal")
    .eq("status", "completed");

  for (const m of internalMatches ?? []) {
    if (!m.player1_id || !m.player2_id) continue;
    if (m.score_home === null || m.score_away === null) continue;

    const s1 = statsMap[m.player1_id];
    const s2 = statsMap[m.player2_id];
    if (!s1 || !s2) continue;

    s1.matches++; s2.matches++;
    s1.goals += m.score_home; s2.goals += m.score_away;
    s1.goals_for += m.score_home; s1.goals_against += m.score_away;
    s2.goals_for += m.score_away; s2.goals_against += m.score_home;

    if (m.score_home > m.score_away) { s1.wins++; s2.losses++; }
    else if (m.score_away > m.score_home) { s2.wins++; s1.losses++; }
    else { s1.draws++; s2.draws++; }
  }

  // 2. Internal tournament matches (player vs player from tournament_matches)
  const { data: tournamentMatches } = await supabase
    .from("tournament_matches")
    .select("player1_id, player2_id, player1_score, player2_score, status")
    .eq("status", "completed");

  for (const m of tournamentMatches ?? []) {
    if (!m.player1_id || !m.player2_id) continue;
    if (m.player1_score === null || m.player2_score === null) continue;

    const s1 = statsMap[m.player1_id];
    const s2 = statsMap[m.player2_id];
    if (!s1 || !s2) continue;

    s1.matches++; s2.matches++;
    s1.goals += m.player1_score; s2.goals += m.player2_score;
    s1.goals_for += m.player1_score; s1.goals_against += m.player2_score;
    s2.goals_for += m.player2_score; s2.goals_against += m.player1_score;

    if (m.player1_score > m.player2_score) { s1.wins++; s2.losses++; }
    else if (m.player2_score > m.player1_score) { s2.wins++; s1.losses++; }
    else { s1.draws++; s2.draws++; }
  }

  // 3. External matches (Falcon vs external club, regular or tournament — one player marked as "Played By")
  const { data: externalMatches } = await supabase
    .from("matches")
    .select("id, score_home, score_away")
    .eq("match_type", "external")
    .eq("status", "completed");

  if (externalMatches && externalMatches.length > 0) {
    const matchIds = externalMatches.map((m) => m.id);

    const { data: squadRows } = await supabase
      .from("match_squad")
      .select("match_id, player_id")
      .in("match_id", matchIds);

    const playerByMatch: Record<string, string> = {};
    for (const row of squadRows ?? []) {
      playerByMatch[row.match_id] = row.player_id;
    }

    for (const m of externalMatches) {
      const playerId = playerByMatch[m.id];
      if (!playerId) continue; // skip if no player is selected

      const s = statsMap[playerId];
      if (!s) continue;
      if (m.score_home === null || m.score_away === null) continue;

      s.matches++;
      s.goals += m.score_home;
      s.goals_for += m.score_home;
      s.goals_against += m.score_away;

      if (m.score_home > m.score_away) s.wins++;
      else if (m.score_home < m.score_away) s.losses++;
      else s.draws++;
    }
  }

  // 4. MOTM counts (from match_events for all match types)
  const { data: motmEvents } = await supabase
    .from("match_events")
    .select("scorer_id")
    .eq("event_type", "motm");

  for (const e of motmEvents ?? []) {
    if (e.scorer_id && statsMap[e.scorer_id]) {
      statsMap[e.scorer_id].motm_count++;
    }
  }

  // 5. Save results
  await Promise.all(
    Object.entries(statsMap).map(async ([playerId, stat]) => {
      const { data: existing } = await supabase
        .from("player_stats")
        .select("id")
        .eq("player_id", playerId)
        .maybeSingle();

      if (existing) {
        await supabase.from("player_stats").update(stat).eq("id", existing.id);
      } else {
        await supabase.from("player_stats").insert({ player_id: playerId, ...stat });
      }
    })
  );
}
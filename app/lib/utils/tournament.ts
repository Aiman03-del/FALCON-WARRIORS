// Tournament utility functions for fixture generation and standings calculation

export type Match = {
  id: string;
  round: number;
  matchOrder: number;
  player1Id: string;
  player2Id: string;
  player1Score: number | null;
  player2Score: number | null;
  status: "pending" | "completed" | "live";
  player1?: { efootball_username: string };
  player2?: { efootball_username: string };
};

export type Participant = {
  id: string;
  playerId: string;
  points: number;
  rank: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  player?: { id: string; efootball_username: string };
};

/**
 * Generate round-robin fixtures for a tournament
 * Each participant plays every other participant once
 */
export function generateRoundRobinFixtures(playerIds: string[]): Array<{
  round: number;
  matchOrder: number;
  player1Id: string;
  player2Id: string;
}> {
  const fixtures: Array<{ round: number; matchOrder: number; player1Id: string; player2Id: string }> =
    [];
  const n = playerIds.length;
  const isEven = n % 2 === 0;
  const rounds = isEven ? n - 1 : n;

  // Round-robin algorithm
  for (let round = 0; round < rounds; round++) {
    const matchOrder = 0;
    const matchesInRound = isEven ? n / 2 : (n - 1) / 2;

    for (let i = 0; i < matchesInRound; i++) {
      let player1 = (round + i) % (n - 1);
      let player2 = (round - i + n - 1) % (n - 1);

      if (isEven && i === Math.floor(matchesInRound) - 1) {
        player2 = n - 1;
      }

      if (player1 !== player2) {
        fixtures.push({
          round: round + 1,
          matchOrder: i + 1,
          player1Id: playerIds[player1],
          player2Id: playerIds[player2],
        });
      }
    }
  }

  return fixtures;
}

/**
 * Generate knockout tournament fixtures (bracket)
 */
export function generateKnockoutFixtures(playerIds: string[]): Array<{
  round: number;
  matchOrder: number;
  player1Id: string;
  player2Id: string;
}> {
  const fixtures: Array<{ round: number; matchOrder: number; player1Id: string; player2Id: string }> =
    [];

  // Shuffle for random bracket seeding
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);

  let currentRound = 1;
  let currentPlayers = shuffled;

  while (currentPlayers.length > 1) {
    for (let i = 0; i < currentPlayers.length; i += 2) {
      fixtures.push({
        round: currentRound,
        matchOrder: Math.floor(i / 2) + 1,
        player1Id: currentPlayers[i],
        player2Id: currentPlayers[i + 1],
      });
    }

    // For next round simulation
    currentRound++;
    currentPlayers = currentPlayers.slice(0, Math.ceil(currentPlayers.length / 2));
  }

  return fixtures;
}

/**
 * Calculate standings from match results
 * Points system: Win = 3, Draw = 1, Loss = 0
 */
export function calculateStandings(
  participants: Participant[],
  matches: Match[]
): Participant[] {
  const standings = new Map<string, Participant>();

  // Initialize standings
  participants.forEach((p) => {
    standings.set(p.playerId, {
      ...p,
      points: 0,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    });
  });

  // Process completed matches
  const completedMatches = matches.filter((m) => m.status === "completed" && m.player1Score !== null);

  completedMatches.forEach((match) => {
    const player1 = standings.get(match.player1Id);
    const player2 = standings.get(match.player2Id);

    if (!player1 || !player2) return;

    const score1 = match.player1Score!;
    const score2 = match.player2Score!;

    // Update goals
    player1.goalsFor += score1;
    player1.goalsAgainst += score2;
    player2.goalsFor += score2;
    player2.goalsAgainst += score1;

    // Determine result and award points
    player1.matchesPlayed++;
    player2.matchesPlayed++;

    if (score1 > score2) {
      // Player 1 wins
      player1.wins++;
      player1.points += 3;
      player2.losses++;
    } else if (score2 > score1) {
      // Player 2 wins
      player2.wins++;
      player2.points += 3;
      player1.losses++;
    } else {
      // Draw
      player1.draws++;
      player2.draws++;
      player1.points += 1;
      player2.points += 1;
    }
  });

  // Calculate goal difference and determine ranking
  const result = Array.from(standings.values());

  result.sort((a, b) => {
    // Sort by: points (desc), goal difference (desc), goals for (desc)
    if (b.points !== a.points) return b.points - a.points;
    const aDiff = a.goalsFor - a.goalsAgainst;
    const bDiff = b.goalsFor - b.goalsAgainst;
    if (bDiff !== aDiff) return bDiff - aDiff;
    return b.goalsFor - a.goalsFor;
  });

  // Assign ranks
  result.forEach((p, i) => {
    p.rank = i + 1;
  });

  return result;
}

/**
 * Get upcoming matches for a tournament
 */
export function getUpcomingMatches(matches: Match[]): Match[] {
  return matches
    .filter((m) => m.status === "pending")
    .sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return a.matchOrder - b.matchOrder;
    });
}

/**
 * Get completed matches for a tournament
 */
export function getCompletedMatches(matches: Match[]): Match[] {
  return matches
    .filter((m) => m.status === "completed")
    .sort((a, b) => b.round - a.round || b.matchOrder - a.matchOrder);
}

/**
 * Get recent form for a player (last 5 matches)
 */
export function getPlayerRecentForm(
  playerId: string,
  matches: Match[]
): Array<"W" | "D" | "L"> {
  const playerMatches = matches
    .filter((m) => m.status === "completed" && (m.player1Id === playerId || m.player2Id === playerId))
    .sort((a, b) => b.round - a.round || b.matchOrder - a.matchOrder)
    .slice(0, 5);

  return playerMatches.map((m) => {
    const isPlayer1 = m.player1Id === playerId;
    const playerScore = isPlayer1 ? m.player1Score : m.player2Score;
    const opponentScore = isPlayer1 ? m.player2Score : m.player1Score;

    if (playerScore! > opponentScore!) return "W";
    if (playerScore! === opponentScore!) return "D";
    return "L";
  });
}

/**
 * Get match head-to-head record between two players
 */
export function getHeadToHeadRecord(
  player1Id: string,
  player2Id: string,
  matches: Match[]
): { wins: number; draws: number; losses: number } {
  const h2hMatches = matches.filter(
    (m) =>
      m.status === "completed" &&
      ((m.player1Id === player1Id && m.player2Id === player2Id) ||
        (m.player1Id === player2Id && m.player2Id === player1Id))
  );

  let wins = 0,
    draws = 0,
    losses = 0;

  h2hMatches.forEach((m) => {
    const isPlayer1 = m.player1Id === player1Id;
    const playerScore = isPlayer1 ? m.player1Score : m.player2Score;
    const opponentScore = isPlayer1 ? m.player2Score : m.player1Score;

    if (playerScore! > opponentScore!) wins++;
    else if (playerScore! === opponentScore!) draws++;
    else losses++;
  });

  return { wins, draws, losses };
}

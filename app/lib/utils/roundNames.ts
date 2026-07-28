// Standard knockout round naming, based on how many teams actually enter that
// round — not on distance-from-final guesswork. This stays correct even for
// odd/non-power-of-two brackets (byes, uneven group qualifiers, etc).

export function knockoutRoundName(teamCount: number): string {
  if (teamCount <= 2) return "Final";
  if (teamCount <= 4) return "Semi-final";
  if (teamCount <= 8) return "Quarter-final";
  return `Round of ${teamCount}`;
}

// Sums real participants in a round's matches. A "bye" match only has one
// real team (the other side auto-advanced), everything else has two.
export function countTeamsInRound(matches: { status: string }[]): number {
  return matches.reduce((sum, m) => sum + (m.status === "bye" ? 1 : 2), 0);
}
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

export function formatRoundName(
  stage: string | null | undefined,
  roundNumber: number | null | undefined,
  groupName?: string | null,
  matchIndex?: number | null
): string {
  if (!stage) return "";

  const cleanStage = stage.trim().toLowerCase();

  // 1. Group stage matches use the group name and optional match number.
  if (cleanStage === "group stage" || cleanStage === "group_stage" || cleanStage === "group") {
    const formattedGroup = groupName ? `Group ${groupName.replace(/^group\s+/i, "")}` : "Group Stage";
    const formattedMatchNum = matchIndex ? ` • Match ${matchIndex}` : "";
    return `${formattedGroup}${formattedMatchNum}`;
  }

  // 2. League / regular season matches use a round label and optional match number.
  if (cleanStage === "league" || cleanStage === "regular season") {
    const roundText = roundNumber ? `Round ${roundNumber}` : "League Match";
    const formattedMatchNum = matchIndex ? ` • Match ${matchIndex}` : "";
    return `${roundText}${formattedMatchNum}`;
  }

  // 3. Knockout and playoff matches map to named rounds.
  const stageMap: Record<string, string> = {
    round_of_16: "Round of 16",
    "round of 16": "Round of 16",
    quarter_finals: "Quarter-Final",
    "quarter-finals": "Quarter-Final",
    "quarter final": "Quarter-Final",
    semi_finals: "Semi-Final",
    "semi-finals": "Semi-Final",
    "semi final": "Semi-Final",
    third_place: "3rd Place Play-off",
    "third place": "3rd Place Play-off",
    final: "Final",
    playoffs: "Play-offs",
    playoff: "Play-off",
  };

  const stageDisplay = stageMap[cleanStage] || stage;
  const formattedMatchNum = matchIndex ? ` • Match ${matchIndex}` : "";

  return `${stageDisplay}${formattedMatchNum}`;
}

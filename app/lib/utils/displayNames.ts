export const DEFAULT_OPPONENT_NAME = "Opponent";

export function opponentDisplayName(name?: string | null): string {
  return name?.trim() ? name : DEFAULT_OPPONENT_NAME;
}

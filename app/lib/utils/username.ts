export function deriveUsernameFromEmail(email: string): string {
  const localPart = email.split("@")[0] || "";
  const cleaned = localPart.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return cleaned || `player${Date.now().toString().slice(-6)}`;
}
// Mock data for matches when Supabase is not connected
const MOCK_MATCHES = [
  // External matches (vs other clubs)
  {
    id: "ext-1",
    match_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    opponent_name: "Phoenix FC",
    opponent_tag: "PHX",
    opponent_logo_url: "https://via.placeholder.com/40?text=PHX",
    competition: "International League",
    status: "upcoming",
    match_type: "external",
    score_home: null,
    score_away: null,
    tournament_id: null,
  },
  {
    id: "ext-2",
    match_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    opponent_name: "Dragon United",
    opponent_tag: "DRG",
    opponent_logo_url: "https://via.placeholder.com/40?text=DRG",
    competition: "Champions Cup",
    status: "upcoming",
    match_type: "external",
    score_home: null,
    score_away: null,
    tournament_id: null,
  },
  {
    id: "ext-3",
    match_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    opponent_name: "Tiger Squad",
    opponent_tag: "TGR",
    opponent_logo_url: "https://via.placeholder.com/40?text=TGR",
    competition: "International League",
    status: "completed",
    match_type: "external",
    score_home: 3,
    score_away: 1,
    tournament_id: null,
  },
  {
    id: "ext-4",
    match_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    opponent_name: "Silver Strikers",
    opponent_tag: "SLV",
    opponent_logo_url: "https://via.placeholder.com/40?text=SLV",
    competition: "Champions Cup",
    status: "completed",
    match_type: "external",
    score_home: 2,
    score_away: 2,
    tournament_id: null,
  },
  {
    id: "ext-5",
    match_date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    opponent_name: "Golden Hawks",
    opponent_tag: "GLD",
    opponent_logo_url: "https://via.placeholder.com/40?text=GLD",
    competition: "International League",
    status: "completed",
    match_type: "external",
    score_home: 4,
    score_away: 2,
    tournament_id: null,
  },

  // Internal matches (player vs player)
  {
    id: "int-1",
    match_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    opponent_name: "Ahmed vs Hassan",
    opponent_tag: "INT",
    opponent_logo_url: null,
    competition: "Internal Championship",
    status: "upcoming",
    match_type: "internal",
    score_home: null,
    score_away: null,
    tournament_id: "tournament-1",
  },
  {
    id: "int-2",
    match_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    opponent_name: "Karim vs Bilal",
    opponent_tag: "INT",
    opponent_logo_url: null,
    competition: "Internal Championship",
    status: "completed",
    match_type: "internal",
    score_home: 2,
    score_away: 1,
    tournament_id: "tournament-1",
  },
  {
    id: "int-3",
    match_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    opponent_name: "Tariq vs Samir",
    opponent_tag: "INT",
    opponent_logo_url: null,
    competition: "Internal Championship",
    status: "completed",
    match_type: "internal",
    score_home: 1,
    score_away: 1,
    tournament_id: "tournament-1",
  },
];

export async function getMatches(filters?: {
  status?: string;
  search?: string;
  type?: "internal" | "external";
}) {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100));

  let results = [...MOCK_MATCHES];

  if (filters?.status) {
    results = results.filter((m) => m.status === filters.status);
  }

  if (filters?.type) {
    results = results.filter((m) => m.match_type === filters.type);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    results = results.filter(
      (m) =>
        m.opponent_name.toLowerCase().includes(searchLower) ||
        m.competition.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type PublicTournamentTab = "overview" | "standings" | "fixtures" | "bracket" | "squad";

export default function PublicTournamentTabs({
  tournamentId,
  activeTab,
  showStandings,
  showFixtures,
  showBracket,
  showSquad,
  overviewContent,
  standingsContent,
  fixturesContent,
  bracketContent,
  squadContent,
}: {
  tournamentId: string;
  activeTab: PublicTournamentTab;
  showStandings: boolean;
  showFixtures: boolean;
  showBracket: boolean;
  showSquad: boolean;
  overviewContent: React.ReactNode;
  standingsContent: React.ReactNode;
  fixturesContent: React.ReactNode;
  bracketContent: React.ReactNode;
  squadContent: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setTab(tab: PublicTournamentTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.replace(`/tournaments/${tournamentId}${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
  }

  const tabClass = (tab: PublicTournamentTab) =>
    `rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
      activeTab === tab
        ? "bg-gold text-black"
        : "border border-border bg-surface-2 text-muted hover:text-white"
    }`;

  return (
    <div>
      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("overview")} className={tabClass("overview")}>
          Overview
        </button>
        {showStandings && (
          <button type="button" onClick={() => setTab("standings")} className={tabClass("standings")}>
            Standings
          </button>
        )}
        {showFixtures && (
          <button type="button" onClick={() => setTab("fixtures")} className={tabClass("fixtures")}>
            Fixtures
          </button>
        )}
        {showBracket && (
          <button type="button" onClick={() => setTab("bracket")} className={tabClass("bracket")}>
            Bracket
          </button>
        )}
        {showSquad && (
          <button type="button" onClick={() => setTab("squad")} className={tabClass("squad")}>
            Squad
          </button>
        )}
      </div>

      <div className="mt-6">
        {activeTab === "overview" && overviewContent}
        {activeTab === "standings" && showStandings && standingsContent}
        {activeTab === "fixtures" && showFixtures && fixturesContent}
        {activeTab === "bracket" && showBracket && bracketContent}
        {activeTab === "squad" && showSquad && squadContent}
      </div>
    </div>
  );
}
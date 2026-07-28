"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type InternalTournamentTab =
  | "standings"
  | "fixtures"
  | "bracket"
  | "participants"
  | "edit";

export default function InternalTournamentTabs({
  tournamentId,
  activeTab,
  showStandings,
  standingsContent,
  fixturesContent,
  fixtureGenerator,
  bracketContent,
  participantsContent,
  editContent,
}: {
  tournamentId: string;
  activeTab: InternalTournamentTab;
  showStandings: boolean;
  standingsContent: React.ReactNode;
  fixturesContent: React.ReactNode;
  fixtureGenerator: React.ReactNode;
  bracketContent: React.ReactNode;
  participantsContent: React.ReactNode;
  editContent: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setTab(tab: InternalTournamentTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "standings") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.replace(`/dashboard/tournaments/${tournamentId}${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
  }

  const tabClass = (tab: InternalTournamentTab) =>
    `rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
      activeTab === tab
        ? "bg-gold text-black"
        : "border border-border bg-surface-2 text-muted hover:text-white"
    }`;

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-2">
        {showStandings && (
          <button type="button" onClick={() => setTab("standings")} className={tabClass("standings")}>
            Standings
          </button>
        )}
        <button type="button" onClick={() => setTab("fixtures")} className={tabClass("fixtures")}>
          Fixtures
        </button>
        <button type="button" onClick={() => setTab("bracket")} className={tabClass("bracket")}>
          Bracket
        </button>
        <button type="button" onClick={() => setTab("participants")} className={tabClass("participants")}>
          Participants
        </button>
        <button type="button" onClick={() => setTab("edit")} className={tabClass("edit")}>
          Edit
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "standings" && showStandings && standingsContent}
        {activeTab === "fixtures" && (
          <>
            <div className="mb-6">{fixtureGenerator}</div>
            {fixturesContent}
          </>
        )}
        {activeTab === "bracket" && bracketContent}
        {activeTab === "participants" && participantsContent}
        {activeTab === "edit" && editContent}
      </div>
    </div>
  );
}

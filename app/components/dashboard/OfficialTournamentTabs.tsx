"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type OfficialTournamentTab = "rounds" | "participants" | "edit";

export default function OfficialTournamentTabs({
  tournamentId,
  tournamentSlug,
  activeTab,
  roundsContent,
  participantsContent,
  editContent,
}: {
  tournamentId: string;
  tournamentSlug: string;
  activeTab: OfficialTournamentTab;
  roundsContent: React.ReactNode;
  participantsContent: React.ReactNode;
  editContent: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setTab(tab: OfficialTournamentTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "rounds") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.replace(`/dashboard/tournaments/${tournamentSlug}${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
  }

  const tabClass = (tab: OfficialTournamentTab) =>
    `rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
      activeTab === tab
        ? "bg-gold text-black"
        : "border border-border bg-surface-2 text-muted hover:text-white"
    }`;

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("rounds")} className={tabClass("rounds")}>
          Rounds
        </button>
        <button type="button" onClick={() => setTab("participants")} className={tabClass("participants")}>
          Participants
        </button>
        <button type="button" onClick={() => setTab("edit")} className={tabClass("edit")}>
          Edit
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "rounds" && roundsContent}
        {activeTab === "participants" && participantsContent}
        {activeTab === "edit" && editContent}
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { Trophy } from "lucide-react";
import BracketView, { type BracketViewHandle } from "@/app/components/BracketView";
import DownloadBracketIconButton from "@/app/components/DownloadBracketIconButton";
import ChampionModal from "@/app/components/ChampionModal";

type Champion = { name: string; avatarUrl: string | null } | null;

export default function BracketPanel({
  fixtureGenerator,
  tournamentName,
  matches,
  mode,
  editable,
  tournamentId,
  format,
  leagueChampion,
}: {
  fixtureGenerator?: React.ReactNode;
  tournamentName: string;
  matches: any[];
  mode: "knockout" | "league";
  editable?: boolean;
  tournamentId?: string;
  format?: string;
  leagueChampion?: Champion;
}) {
  const bracketRef = useRef<BracketViewHandle>(null);
  const openChampionModalRef = useRef<() => void>(() => {});
  const [champion, setChampion] = useState<Champion>(null);
  const [showLeagueChampionModal, setShowLeagueChampionModal] = useState(false);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>{fixtureGenerator}</div>
        <div className="flex items-center gap-2">
          {(mode === "league" ? leagueChampion : champion) && (
            <button
              onClick={() => {
                if (mode === "league") {
                  setShowLeagueChampionModal(true);
                } else {
                  openChampionModalRef.current();
                }
              }}
              className="flex h-9 items-center gap-1.5 rounded-full bg-gold px-3 text-xs font-semibold text-bg transition hover:bg-gold/90"
              title="Declare champion"
            >
              <Trophy size={14} /> Submit
            </button>
          )}
          <DownloadBracketIconButton bracketRef={bracketRef} tournamentName={tournamentName} />
        </div>
      </div>
      <BracketView
        ref={bracketRef}
        matches={matches}
        mode={mode}
        editable={editable}
        tournamentId={tournamentId}
        format={format}
        tournamentName={tournamentName}
        onChampionChange={(c, openModal) => {
          setChampion(c);
          openChampionModalRef.current = openModal;
        }}
      />
      {mode === "league" && leagueChampion && showLeagueChampionModal && (
        <ChampionModal
          champion={leagueChampion}
          tournamentName={tournamentName}
          onClose={() => setShowLeagueChampionModal(false)}
        />
      )}
    </div>
  );
}
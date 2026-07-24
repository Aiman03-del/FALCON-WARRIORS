import { AlertCircle, Lock } from "lucide-react";

type Props = {
  tournamentName: string;
  status: string;
  isPublicView?: boolean;
};

export default function ExternalTournamentInfo({ tournamentName, status, isPublicView = true }: Props) {
  return (
    <div className="card border-gold/20 bg-gold/5 p-4 sm:p-5">
      <div className="flex gap-3">
        <div className="shrink-0 pt-0.5">
          {isPublicView ? <Lock size={16} className="text-gold" /> : <AlertCircle size={16} className="text-gold" />}
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-gold">Admin-Managed Tournament</h3>
          <p className="text-sm text-muted">
            {isPublicView
              ? "This is an external tournament managed by the Falcon Warriors admin team. View the matches and results below."
              : "Participants and matches are managed by the admin team. You can manually add players and create fixtures for this tournament."}
          </p>
        </div>
      </div>
    </div>
  );
}

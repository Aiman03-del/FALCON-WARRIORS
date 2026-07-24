
import BracketView from "@/app/components/BracketView";
import Footer from "@/app/components/Footer";
import JoinTournamentButton from "@/app/components/JoinTournamentButton";
import Navbar from "@/app/components/Navbar";
import PointsTable from "@/app/components/PointsTable";
import TournamentStatusBadge from "@/app/components/TournamentStatusBadge";
import TournamentSquadList from "@/app/components/TournamentSquadList";
import ExternalTournamentInfo from "@/app/components/ExternalTournamentInfo";
import TournamentMatchesDisplay from "@/app/components/TournamentMatchesDisplay";
import { getMyJoinStatus, getTournamentDetail } from "@/app/lib/queries/tournaments";
import { notFound } from "next/navigation";


export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getTournamentDetail(id);

  if (!data) notFound();
  const { tournament, participants, matches, formMap, squad } = data;
  const joinStatus = await getMyJoinStatus(id);

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="section-divider" />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
            {tournament.name}
          </h1>
          <TournamentStatusBadge status={tournament.status} />
        </div>

        <p className="mt-2 text-sm capitalize text-muted">
          {tournament.type} · {tournament.format ?? "League"}
          {tournament.start_date && (
            <>
              {" "}
              · {new Date(tournament.start_date).toLocaleDateString()}
              {tournament.end_date &&
                ` – ${new Date(tournament.end_date).toLocaleDateString()}`}
            </>
          )}
        </p>

        {tournament.max_participants && (
          <p className="mt-1 text-xs text-muted">
            {participants.length} / {tournament.max_participants} slots filled
            {tournament.registration_deadline &&
              ` · Registration closes ${new Date(
                tournament.registration_deadline
              ).toLocaleDateString()}`}
          </p>
        )}

        <div className="mt-6">
          <JoinTournamentButton
            tournamentId={tournament.id}
            loggedIn={joinStatus.loggedIn}
            hasPlayerProfile={"hasPlayerProfile" in joinStatus ? joinStatus.hasPlayerProfile : undefined}
            playerId={"playerId" in joinStatus ? joinStatus.playerId : undefined}
            myRequestStatus={"myRequestStatus" in joinStatus ? joinStatus.myRequestStatus : null}
            approvedCount={"approvedCount" in joinStatus ? joinStatus.approvedCount : 0}
            maxParticipants={tournament.max_participants}
            registrationDeadline={tournament.registration_deadline}
            tournamentStatus={tournament.status}
            tournamentType={tournament.type as "internal" | "external"}
          />
        </div>

        {tournament.type === "external" && (
          <div className="mt-8">
            <ExternalTournamentInfo 
              tournamentName={tournament.name}
              status={tournament.status}
              isPublicView={true}
            />
          </div>
        )}

        {tournament.type === "official" && (
          <div className="mt-8">
            <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-gold">
              Falcon Warriors Squad
            </h2>
            <TournamentSquadList squad={squad} />
          </div>
        )}

        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-gold">
            Fixtures & Results
          </h2>
          <TournamentMatchesDisplay matches={matches as any} />
        </div>

        {tournament.format !== "knockout" && (
          <div className="mt-8">
            <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-gold">
              Points Table
            </h2>
            <PointsTable participants={participants} formMap={formMap} />
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}

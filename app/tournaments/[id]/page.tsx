
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

  const knockoutMatches = (matches as any[]).filter((m) => m.stage === "knockout" || m.stage == null);
  const bracketMatches = knockoutMatches.filter((m) => !m.is_third_place);
  const thirdPlaceMatch = knockoutMatches.find((m) => m.is_third_place) ?? null;
  const hasBracket = bracketMatches.length > 0;

  const groupNames =
    tournament.format === "group_knockout"
      ? Array.from(new Set(participants.map((p: any) => p.group_name).filter(Boolean))).sort()
      : [];

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
            tournamentType={tournament.type === "official" ? "external" : "internal"}
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

        {tournament.format === "group_knockout" &&
          groupNames.map((groupName) => (
            <div key={groupName} className="mt-8">
              <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-gold">
                Group {groupName}
              </h2>
              <PointsTable
                participants={participants.filter((p: any) => p.group_name === groupName)}
                formMap={formMap}
                matches={(matches as any[]).filter((m) => m.stage === "group" && m.group_name === groupName)}
              />
            </div>
          ))}

        {(tournament.format === "league" || tournament.format === "league_playoff") && (
          <div className="mt-8">
            <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-gold">
              Points Table
            </h2>
            <PointsTable
              participants={participants}
              formMap={formMap}
              matches={(matches as any[]).filter((m) => m.stage !== "knockout")}
            />
          </div>
        )}

        {(tournament.format === "knockout" || hasBracket) && (
          <div className="mt-8">
            <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-gold">
              Knockout Bracket
            </h2>
            <BracketView matches={bracketMatches as any} mode="knockout" />
          </div>
        )}

        {thirdPlaceMatch && (
          <div className="mt-8">
            <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-gold">
              3rd Place Match
            </h2>
            <div className="card flex items-center justify-between p-4 text-sm">
              <span className="font-medium">
                {(thirdPlaceMatch as any).player1?.efootball_username ?? "TBD"}
              </span>
              <span className="text-muted">
                {(thirdPlaceMatch as any).status === "completed"
                  ? `${(thirdPlaceMatch as any).player1_score} - ${(thirdPlaceMatch as any).player2_score}`
                  : "vs"}
              </span>
              <span className="font-medium">
                {(thirdPlaceMatch as any).player2?.efootball_username ?? "TBD"}
              </span>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}


import BracketView from "@/app/components/BracketView";
import Footer from "@/app/components/Footer";
import JoinTournamentButton from "@/app/components/JoinTournamentButton";
import Navbar from "@/app/components/Navbar";
import PointsTable from "@/app/components/PointsTable";
import TournamentStatusBadge from "@/app/components/TournamentStatusBadge";
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
  const { tournament, participants, matches } = data;
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
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-gold">
            {tournament.format === "knockout" ? "Bracket" : "Points Table"}
          </h2>

          {tournament.format === "knockout" ? (
            <BracketView matches={matches as any} />
          ) : (
            <PointsTable participants={participants} />
          )}
        </div>

        {matches.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-gold">
              Fixtures & Results
            </h2>
            <div className="flex flex-col gap-3">
              {matches.map((m: any) => (
                <div key={m.id} className="card flex items-center justify-between p-4">
                  <p className="text-sm">
                    {m.player1?.efootball_username ?? "BYE"} <span className="text-muted">vs</span>{" "}
                    {m.player2?.efootball_username ?? "BYE"}
                  </p>
                  {m.status === "completed" ? (
                    <span className="font-display font-bold text-gold">
                      {m.player1_score} - {m.player2_score}
                    </span>
                  ) : (
                    <span className="text-xs text-muted uppercase">{m.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
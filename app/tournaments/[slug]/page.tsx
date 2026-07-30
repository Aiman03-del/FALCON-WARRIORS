import BracketView from "@/app/components/BracketView";
import ChampionBanner from "@/app/components/ChampionBanner";
import Footer from "@/app/components/Footer";
import JoinTournamentButton from "@/app/components/JoinTournamentButton";
import Navbar from "@/app/components/Navbar";
import PointsTable from "@/app/components/PointsTable";
import PublicTournamentTabs, {
  type PublicTournamentTab,
} from "@/app/components/PublicTournamentTabs";
import TournamentStatusBadge from "@/app/components/TournamentStatusBadge";
import TournamentSquadList from "@/app/components/TournamentSquadList";
import ExternalTournamentInfo from "@/app/components/ExternalTournamentInfo";
import TournamentMatchesDisplay from "@/app/components/TournamentMatchesDisplay";
import {
  getMyJoinStatus,
  getTournamentDetail,
  type TournamentDetailData,
  type TournamentMatch,
  type TournamentParticipant,
} from "@/app/lib/queries/tournaments";
import { rankStandings } from "@/app/lib/fixtures/tiebreakers";
import { notFound } from "next/navigation";

type JoinedPlayer = {
  id: string;
  efootball_username: string;
  avatar_url?: string | null;
};

function getJoinedPlayer(pd: JoinedPlayer | JoinedPlayer[] | null | undefined) {
  return Array.isArray(pd) ? pd[0] ?? null : pd ?? null;
}

function computeChampion({
  tournament,
  matches,
  participants,
  bracketMatches,
}: {
  tournament: TournamentDetailData["tournament"];
  matches: TournamentMatch[];
  participants: TournamentParticipant[];
  bracketMatches: TournamentMatch[];
}): { name: string; avatarUrl: string | null; subtitle: string } | null {
  if (bracketMatches.length > 0) {
    const finalRound = Math.max(...bracketMatches.map((m) => m.round));
    const finalMatches = bracketMatches.filter((m) => m.round === finalRound);
    if (finalMatches.length !== 1) return null;

    const finalMatch = finalMatches[0];

    if (finalMatch.status === "bye") {
      const p = getJoinedPlayer(finalMatch.player1);
      return p ? { name: p.efootball_username, avatarUrl: p.avatar_url ?? null, subtitle: "Tournament Champion" } : null;
    }

    if (finalMatch.status !== "completed") return null;
    const s1 = finalMatch.player1_score;
    const s2 = finalMatch.player2_score;
    if (s1 == null || s2 == null || s1 === s2) return null;

    const winner = getJoinedPlayer(s1 > s2 ? finalMatch.player1 : finalMatch.player2);
    if (!winner) return null;
    return {
      name: winner.efootball_username,
      avatarUrl: winner.avatar_url ?? null,
      subtitle: `Won the Final ${s1} - ${s2}`,
    };
  }

  if (tournament.format === "league") {
    const leagueMatches = matches.filter((m) => m.stage !== "knockout");
    const allDone = leagueMatches.length > 0 && leagueMatches.every((m) => m.status === "completed" || m.status === "bye");
    if (!allDone) return null;

    const withPlayerId = participants.map((p) => ({
      ...p,
      player_id: getJoinedPlayer(p.player_details)?.id ?? p.id,
    }));
    const ranked = rankStandings(withPlayerId, leagueMatches);
    const top = ranked[0];
    if (!top) return null;

    const player = getJoinedPlayer((top as TournamentParticipant | undefined)?.player_details);
    if (!player) return null;

    return {
      name: player.efootball_username,
      avatarUrl: player.avatar_url ?? null,
      subtitle: `League Champion · ${top.points} pts`,
    };
  }

  return null;
}

function parseTab(tabParam: string | undefined): PublicTournamentTab {
  if (tabParam === "standings") return "standings";
  if (tabParam === "fixtures") return "fixtures";
  if (tabParam === "bracket") return "bracket";
  if (tabParam === "squad") return "squad";
  return "overview";
}

export default async function TournamentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab: tabParam } = await searchParams;
  const data = await getTournamentDetail(slug);

  if (!data) notFound();
  const { tournament, participants, matches, formMap, squad } = data;
  const joinStatus = await getMyJoinStatus(tournament.id);

  const knockoutMatches = matches.filter((m) => m.stage === "knockout" || m.stage == null);
  const bracketMatches = knockoutMatches.filter((m) => !m.is_third_place);
  const thirdPlaceMatch = knockoutMatches.find((m) => m.is_third_place) ?? null;
  const hasBracket = bracketMatches.length > 0;

  const groupNames =
    tournament.format === "group_knockout"
      ? Array.from(new Set(participants.map((p) => p.group_name).filter(Boolean))).sort()
      : [];

  const champion = computeChampion({ tournament, matches, participants, bracketMatches });

  const showStandings =
    tournament.format === "group_knockout" ||
    tournament.format === "league" ||
    tournament.format === "league_playoff";
  const showFixtures = !hasBracket;
  const showBracket = tournament.format === "knockout" || hasBracket;
  const showSquad = tournament.type === "official";

  const activeTab = parseTab(tabParam);

  const overviewContent = (
    <>
      {tournament.type === "external" && (
        <ExternalTournamentInfo
          tournamentName={tournament.name}
          status={tournament.status}
          isPublicView={true}
        />
      )}

      {champion && (
        <ChampionBanner name={champion.name} avatarUrl={champion.avatarUrl} subtitle={champion.subtitle} />
      )}

      {!champion && tournament.type !== "external" && (
        <p className="text-sm text-muted">
          Follow the tabs above for standings, fixtures, and the bracket.
        </p>
      )}
    </>
  );

  const standingsContent = (
    <>
      {tournament.format === "group_knockout" &&
        groupNames.map((groupName) => (
          <div key={groupName} className="mb-8">
            <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-gold">
              Group {groupName}
            </h2>
            <PointsTable
              participants={participants.filter((p) => p.group_name === groupName)}
              formMap={formMap}
              matches={matches.filter((m) => m.stage === "group" && m.group_name === groupName)}
            />
          </div>
        ))}

      {(tournament.format === "league" || tournament.format === "league_playoff") && (
        <PointsTable
          participants={participants}
          formMap={formMap}
          matches={matches.filter((m) => m.stage !== "knockout")}
        />
      )}
    </>
  );

  const fixturesContent = <TournamentMatchesDisplay matches={matches} />;

  const bracketContent = (
    <>
      <BracketView matches={bracketMatches} mode="knockout" />

      {thirdPlaceMatch && (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-gold">
            3rd Place Match
          </h2>
          <div className="card flex items-center justify-between p-4 text-sm">
            <span className="font-medium">
              {thirdPlaceMatch?.player1?.efootball_username ?? "TBD"}
            </span>
            <span className="text-muted">
              {thirdPlaceMatch?.status === "completed"
                ? `${thirdPlaceMatch.player1_score} - ${thirdPlaceMatch.player2_score}`
                : "vs"}
            </span>
            <span className="font-medium">
              {thirdPlaceMatch?.player2?.efootball_username ?? "TBD"}
            </span>
          </div>
        </div>
      )}
    </>
  );

  const squadContent = <TournamentSquadList squad={squad} />;

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
            maxParticipants={tournament.max_participants ?? null}
            registrationDeadline={tournament.registration_deadline ?? null}
            tournamentStatus={tournament.status}
            tournamentType={tournament.type === "official" ? "external" : "internal"}
          />
        </div>

        <PublicTournamentTabs
          tournamentSlug={tournament.slug ?? tournament.id}
          activeTab={activeTab}
          showStandings={showStandings}
          showFixtures={showFixtures}
          showBracket={showBracket}
          showSquad={showSquad}
          overviewContent={overviewContent}
          standingsContent={standingsContent}
          fixturesContent={fixturesContent}
          bracketContent={bracketContent}
          squadContent={squadContent}
        />
      </section>
      <Footer />
    </main>
  );
}
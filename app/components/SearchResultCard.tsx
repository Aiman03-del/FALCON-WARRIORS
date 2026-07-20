import Link from "next/link";
import Image from "next/image";
import MatchStatusBadge from "./MatchStatusBadge";

type PlayerResult = {
  id: string;
  efootball_username: string;
  avatar_url: string | null;
  preferred_position: string | null;
};

type MatchResult = {
  id: string;
  opponent_name: string;
  competition: string | null;
  match_date: string;
  status: string;
  score_home: number | null;
  score_away: number | null;
};

type NewsResult = {
  id: string;
  title: string;
  category: string | null;
  published_at: string;
  cover_image_url: string | null;
};

export function PlayerResultCard({ player }: { player: PlayerResult }) {
  return (
    <Link href={`/players/${player.id}`} className="card flex items-center gap-3 p-4">
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-2">
        {player.avatar_url ? (
          <Image src={player.avatar_url} alt={player.efootball_username} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gold">
            {player.efootball_username.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold">{player.efootball_username}</p>
        <p className="text-xs text-muted">{player.preferred_position ?? "Unassigned"}</p>
      </div>
    </Link>
  );
}

export function MatchResultCard({ match }: { match: MatchResult }) {
  return (
    <Link href="/matches" className="card flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-semibold">vs {match.opponent_name}</p>
        <p className="text-xs text-muted">{match.competition ?? "Friendly"}</p>
      </div>
      <div className="flex items-center gap-3">
        {match.score_home !== null && (
          <span className="font-display font-bold text-gold">
            {match.score_home} - {match.score_away}
          </span>
        )}
        <MatchStatusBadge status={match.status} />
      </div>
    </Link>
  );
}

export function NewsResultCard({ news }: { news: NewsResult }) {
  return (
    <Link href={`/news/${news.id}`} className="card flex items-center gap-4 p-4">
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
        {news.cover_image_url ? (
          <Image src={news.cover_image_url} alt={news.title} fill className="object-cover" />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-indigo/30 to-surface" />
        )}
      </div>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wide text-gold">
          {(news.category ?? "club_news").replace("_", " ")}
        </span>
        <p className="text-sm font-semibold leading-snug">{news.title}</p>
      </div>
    </Link>
  );
}
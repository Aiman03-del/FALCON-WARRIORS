import TournamentsSkeleton from "@/app/components/skeleton/dashboard/TournamentsSkeleton";

export default function TournamentsLoading() {
  return (
    <div className="min-h-[70vh]">
      <TournamentsSkeleton />
    </div>
  );
}

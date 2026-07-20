import MatchesSkeleton from "@/app/components/skeleton/dashboard/MatchesSkeleton";

export default function MatchesLoading() {
  return (
    <div className="min-h-[70vh]">
      <MatchesSkeleton />
    </div>
  );
}

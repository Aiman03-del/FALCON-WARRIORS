import AchievementsSkeleton from "@/app/components/skeleton/dashboard/AchievementsSkeleton";

export default function AchievementsLoading() {
  return (
    <div className="min-h-[70vh]">
      <AchievementsSkeleton />
    </div>
  );
}

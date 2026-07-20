import Skeleton from "@/app/components/Skeleton";

export default function AchievementsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton width="18rem" height="2rem" />
        <Skeleton width="12rem" height="1rem" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div className="space-y-2">
            <Skeleton width="10rem" height="1.5rem" />
            <Skeleton width="8rem" height="1rem" />
          </div>
          <Skeleton width="10rem" height="2.5rem" className="rounded-full" />
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-160 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr_1fr_0.8fr] gap-4 rounded-xl border border-border bg-surface-2 px-4 py-4"
              >
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="6rem" height="1.75rem" className="rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div className="space-y-2">
            <Skeleton width="10rem" height="1.5rem" />
          </div>
          <Skeleton width="8rem" height="1.25rem" className="rounded-full" />
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="min-w-160 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr_1fr_0.9fr_0.8fr] gap-4 rounded-xl border border-border bg-surface-2 px-4 py-4"
              >
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="6rem" height="1.75rem" className="rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

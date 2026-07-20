import Skeleton from "@/app/components/Skeleton";

export default function UsersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton width="16rem" height="2rem" />
        <Skeleton width="12rem" height="1rem" />
      </div>

      <div className="card mt-6 overflow-x-auto p-5">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton width="10rem" height="1.5rem" />
            <Skeleton width="8rem" height="1rem" />
          </div>
          <Skeleton width="8rem" height="2.5rem" className="rounded-full" />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-160 space-y-3">
            <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-3 text-xs uppercase text-muted">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} width="100%" height="1rem" />
              ))}
            </div>

            {Array.from({ length: 5 }).map((rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 rounded-xl border border-border bg-surface-2 px-4 py-4"
              >
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <Skeleton width="100%" height="1rem" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton width="4rem" height="1.75rem" className="rounded-lg" />
                  <Skeleton width="5rem" height="1.75rem" className="rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

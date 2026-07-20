import Skeleton from "@/app/components/Skeleton";

export default function NewsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton width="18rem" height="2rem" />
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
            <div className="grid grid-cols-[1.7fr_0.9fr_0.9fr_0.9fr] gap-4 px-4 py-3 text-xs uppercase text-muted">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} width="100%" height="1rem" />
              ))}
            </div>

            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[1.7fr_0.9fr_0.9fr_0.9fr] gap-4 rounded-xl border border-border bg-surface-2 px-4 py-4"
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

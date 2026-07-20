import Skeleton from "./Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton width="18rem" height="2rem" />
        <Skeleton width="11rem" height="1rem" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <Skeleton width="2.5rem" height="2.5rem" />
              <Skeleton width="3rem" height="2rem" className="rounded-full" />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton width="8rem" height="1.5rem" />
              <Skeleton width="6rem" height="1rem" />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Skeleton width="14rem" height="1.75rem" />
          <Skeleton width="10rem" height="2.5rem" className="rounded-full" />
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-160 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[1.9fr_1fr_1fr_1fr_0.8fr] gap-4 items-center"
              >
                <Skeleton width="100%" height="1.5rem" />
                <Skeleton width="100%" height="1.5rem" />
                <Skeleton width="100%" height="1.5rem" />
                <Skeleton width="100%" height="1.5rem" />
                <Skeleton width="5rem" height="1.5rem" shape="pill" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

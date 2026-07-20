import Skeleton from "@/app/components/Skeleton";

export default function OverviewSkeleton() {
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
              <Skeleton width="6rem" height="1.5rem" />
              <Skeleton width="5rem" height="1rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

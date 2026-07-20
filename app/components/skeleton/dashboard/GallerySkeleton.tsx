import Skeleton from "@/app/components/Skeleton";

export default function GallerySkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton width="18rem" height="2rem" />
        <Skeleton width="12rem" height="1rem" />
      </div>

      <div className="card p-5">
        <div className="space-y-4 sm:flex sm:items-end sm:justify-between sm:space-y-0">
          <div className="space-y-2">
            <Skeleton width="12rem" height="1rem" />
            <Skeleton width="10rem" height="1rem" />
          </div>
          <Skeleton width="8rem" height="2.5rem" className="rounded-full" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card overflow-hidden">
              <Skeleton width="100%" height="0" style={{ paddingTop: "100%" }} />
              <div className="p-3">
                <Skeleton width="80%" height="1rem" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

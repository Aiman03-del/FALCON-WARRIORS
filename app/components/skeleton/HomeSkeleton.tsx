import Skeleton from "@/app/components/Skeleton";

export default function HomeSkeleton() {
  return (
    <main className="space-y-10">
      <div className="space-y-4 px-4 py-6 sm:px-6">
        <Skeleton width="12rem" height="2.5rem" />
        <Skeleton width="10rem" height="1rem" />
        <Skeleton width="100%" height="18rem" className="rounded-4xl" />
      </div>

      <div className="space-y-6 px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="card p-5">
              <Skeleton width="4rem" height="4rem" />
              <Skeleton width="8rem" height="1.5rem" className="mt-4" />
              <Skeleton width="6rem" height="1rem" className="mt-2" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-4 rounded-3xl border border-border bg-surface p-6">
            <Skeleton width="12rem" height="1.5rem" />
            <Skeleton width="100%" height="10rem" className="rounded-3xl" />
          </div>
          <div className="space-y-4">
            <div className="card p-5">
              <Skeleton width="8rem" height="1.5rem" />
              <Skeleton width="100%" height="12rem" className="mt-4 rounded-3xl" />
            </div>
            <div className="card p-5">
              <Skeleton width="8rem" height="1.5rem" />
              <Skeleton width="100%" height="8rem" className="mt-4 rounded-3xl" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton width="10rem" height="1.5rem" />
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card overflow-hidden">
                <Skeleton width="100%" height="0" style={{ paddingTop: "60%" }} />
                <div className="p-4">
                  <Skeleton width="80%" height="1rem" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

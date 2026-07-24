// Skeleton loader components for smooth loading UX

export function TextSkeleton({ lines = 1, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 w-full animate-pulse rounded bg-white/10" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-background/50 p-4 backdrop-blur-sm">
      <div className="h-6 w-2/3 animate-pulse rounded bg-white/10" />
      <TextSkeleton lines={2} />
      <div className="flex gap-2">
        <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 border-b border-white/10 pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1">
            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={colIdx} className="flex-1">
              <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ImageSkeleton({ width = "w-full", height = "h-48" }) {
  return <div className={`${width} ${height} animate-pulse rounded-lg bg-white/10`} />;
}

export function MatchCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-background/50 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="h-6 w-2/5 animate-pulse rounded bg-white/10" />
        <div className="h-6 w-1/4 animate-pulse rounded bg-white/10" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded bg-white/10" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-8 w-8 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export function TournamentCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-background/50 p-4 backdrop-blur-sm">
      <div className="h-6 w-2/3 animate-pulse rounded bg-white/10" />
      <TextSkeleton lines={2} />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-6 w-20 animate-pulse rounded bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-background/50 p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-8 w-1/4 animate-pulse rounded bg-white/10" />
        </div>
        <div className="h-8 w-8 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-1/4 animate-pulse rounded bg-white/10" />
          <div className="h-10 w-full animate-pulse rounded bg-white/10" />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <div className="h-10 w-1/3 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-1/3 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-1/2 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
    </div>
  );
}

export function GridSkeleton({ items = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

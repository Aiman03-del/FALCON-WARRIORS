type SkeletonProps = {
  className?: string;
  width?: string;
  height?: string;
  count?: number;
  shape?: "rounded" | "pill" | "circle";
  style?: React.CSSProperties;
};

const shapeClasses: Record<SkeletonProps["shape"], string> = {
  rounded: "rounded-lg",
  pill: "rounded-full",
  circle: "rounded-full",
};

export default function Skeleton({
  className = "",
  width = "100%",
  height = "1rem",
  count = 1,
  shape = "rounded",
  style,
}: SkeletonProps) {
  const skeletonClass = `animate-pulse bg-surface-2 ${shapeClasses[shape]} ${className}`.trim();

  const skeleton = (
    <div
      className={skeletonClass}
      style={{ width, height, ...style }}
    />
  );

  if (count <= 1) {
    return skeleton;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={skeletonClass}
          style={{ width, height, ...style }}
        />
      ))}
    </div>
  );
}

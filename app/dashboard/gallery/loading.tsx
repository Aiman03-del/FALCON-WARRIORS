import GallerySkeleton from "@/app/components/skeleton/dashboard/GallerySkeleton";

export default function GalleryLoading() {
  return (
    <div className="min-h-[70vh]">
      <GallerySkeleton />
    </div>
  );
}

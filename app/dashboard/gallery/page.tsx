import DeleteGalleryButton from "@/app/components/dashboard/DeleteGalleryButton";
import GalleryUploadForm from "@/app/components/dashboard/GalleryUploadForm";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/client";
import Image from "next/image";

export default async function GalleryDashboardPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("gallery")
    .select("id, image_url, caption, event_tag, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Gallery
      </h1>
      <p className="mt-1 text-sm text-muted">
        Upload match screenshots and event photos.
      </p>

      <GalleryUploadForm />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {(items ?? []).map((item) => (
          <div key={item.id} className="card overflow-hidden">
            <div className="relative aspect-square w-full bg-surface-2">
              <Image
                src={item.image_url}
                alt={item.caption ?? "Gallery photo"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between p-3">
              <p className="truncate text-xs text-muted">
                {item.caption ?? "Untitled"}
              </p>
              <DeleteGalleryButton id={item.id} />
            </div>
          </div>
        ))}
        {(items ?? []).length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted">
            No photos uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
}
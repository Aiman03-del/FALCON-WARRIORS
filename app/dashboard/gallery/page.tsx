import GalleryUploadForm from "@/app/components/dashboard/GalleryUploadForm";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/client";
import Image from "next/image";
import DeleteGalleryButton from "@/app/components/dashboard/DeleteGalleryButton";
import { Images } from "lucide-react";

export default async function GalleryDashboardPage() {
  await requireStaff();

  let items: {
    id: string;
    image_url: string;
    caption: string | null;
    event_tag: string | null;
    created_at: string;
  }[] = [];

  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from("gallery")
      .select("id, image_url, caption, event_tag, created_at")
      .order("created_at", { ascending: false });

    if (data) items = data;
  } catch {}

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-surface p-6">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold tracking-wide">
              Gallery Manager
            </h1>

            <p className="mt-2 text-sm text-muted">
              Upload and manage tournament screenshots &
              event photos.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface-2 px-5 py-4">

            <Images className="h-7 w-7 text-primary" />

            <div>
              <p className="text-xs text-muted">
                Total Images
              </p>

              <p className="text-2xl font-bold">
                {items.length}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Upload Section */}

      <div className="rounded-2xl border border-white/10 bg-surface p-6">

        <h2 className="mb-5 text-lg font-semibold">
          Upload New Image
        </h2>

        <GalleryUploadForm />

      </div>

      {/* Gallery */}

      <div>

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            Gallery Photos
          </h2>

          <span className="text-sm text-muted">
            {items.length} Images
          </span>

        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">

            <Images className="mx-auto mb-4 h-12 w-12 opacity-40" />

            <h3 className="text-lg font-semibold">
              No Photos Yet
            </h3>

            <p className="mt-2 text-sm text-muted">
              Upload your first gallery image.
            </p>

          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {items.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-surface transition duration-300 hover:-translate-y-1 hover:border-primary/50"
              >

                <div className="relative aspect-square overflow-hidden">

                  <Image
                    src={item.image_url}
                    alt={item.caption ?? "Gallery"}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />

                </div>

                <div className="space-y-3 p-4">

                  <div>

                    <h3 className="truncate font-semibold">
                      {item.caption || "Untitled"}
                    </h3>

                    {item.event_tag && (
                      <span className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {item.event_tag}
                      </span>
                    )}

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-xs text-muted">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>

                    <DeleteGalleryButton id={item.id} />

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}
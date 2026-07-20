import Image from "next/image";

type GalleryItem = { id: string; image_url: string; caption: string | null };

export default function Gallery({ items }: { items: GalleryItem[] }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 sm:py-14">
        <div className="section-divider mx-auto" />
        <h2 className="font-display text-xl font-bold uppercase tracking-wide sm:text-2xl">
          Match Gallery
        </h2>
        <p className="mt-2 text-sm text-muted">
          Iconic moments from our most intense battles.
        </p>

        {items.length === 0 ? (
          <p className="mt-8 text-sm text-muted">No photos uploaded yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-2 sm:rounded-xl"
              >
                <Image
                  src={item.image_url}
                  alt={item.caption ?? "Falcon Warriors gallery photo"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
import ImageKit from "imagekit";

// NOTE: this file must only ever be imported from server code (server
// actions, route handlers, RSCs) since it uses IMAGEKIT_PRIVATE_KEY.
// Consider `npm i server-only` and adding `import "server-only"` above
// for a build-time guarantee that it's never bundled into client code.

function getImageKitClient() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return null;
  }

  return new ImageKit({ publicKey, privateKey, urlEndpoint });
}

/**
 * Deletes a single file from ImageKit by its fileId.
 * Safe to call with null/undefined - it will just no-op.
 * Never throws - logs and swallows errors so a failed ImageKit
 * cleanup never blocks a DB delete the user is waiting on.
 */
export async function deleteImageKitFile(fileId: string | null | undefined) {
  if (!fileId) return { ok: true as const, skipped: true as const };

  const imagekit = getImageKitClient();
  if (!imagekit) {
    console.error("ImageKit is not configured; skipping remote file delete.");
    return { ok: false as const, error: "ImageKit not configured" };
  }

  try {
    await imagekit.deleteFile(fileId);
    return { ok: true as const };
  } catch (err: any) {
    console.error(`Failed to delete ImageKit file ${fileId}:`, err?.message ?? err);
    return { ok: false as const, error: err?.message ?? "Unknown error" };
  }
}

/**
 * Deletes multiple files from ImageKit. Uses the bulk delete API when
 * possible, falls back to per-file deletes if that fails.
 * Never throws.
 */
export async function deleteImageKitFiles(fileIds: (string | null | undefined)[]) {
  const ids = fileIds.filter((id): id is string => Boolean(id));
  if (ids.length === 0) return { ok: true as const, deleted: 0 };

  const imagekit = getImageKitClient();
  if (!imagekit) {
    console.error("ImageKit is not configured; skipping remote bulk delete.");
    return { ok: false as const, error: "ImageKit not configured", deleted: 0 };
  }

  try {
    await imagekit.bulkDeleteFiles(ids);
    return { ok: true as const, deleted: ids.length };
  } catch (err: any) {
    console.error("Bulk delete failed, falling back to per-file delete:", err?.message ?? err);
    let deleted = 0;
    for (const id of ids) {
      const result = await deleteImageKitFile(id);
      if (result.ok) deleted++;
    }
    return { ok: deleted === ids.length, deleted };
  }
}
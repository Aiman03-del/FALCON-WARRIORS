"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { uploadToImageKit } from "@/app/lib/imagekit/upload";

type Props = {
  folder?: string;
  value?: string;
  onUploaded: (url: string) => void;
  label?: string;
  circular?: boolean; // নতুন — true হলে গোল অ্যাভাটার স্টাইলে দেখাবে
};

export default function ImageUploadInput({
  folder = "/falcon-warriors",
  value,
  onUploaded,
  label = "Upload Image",
  circular = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const result = await uploadToImageKit(file, folder);
      setPreview(result.url);
      onUploaded(result.url);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    setPreview(null);
    onUploaded("");
  }

  if (circular) {
    return (
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="group relative h-24 w-24 overflow-hidden rounded-full border border-border bg-surface-2 text-muted transition hover:border-gold disabled:opacity-50"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : null}

          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
            {uploading ? (
              <Loader2 className="animate-spin text-white" size={20} />
            ) : (
              <Camera
                size={20}
                className={preview ? "text-white opacity-0 transition group-hover:opacity-100" : "text-muted group-hover:text-gold"}
              />
            )}
          </span>
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="mt-2 text-xs text-muted hover:text-red-400"
          >
            Remove photo
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && <p className="mt-2 text-xs text-gold">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>

      {preview ? (
        <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-2 text-muted hover:border-gold hover:text-gold disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="animate-spin" size={22} />
          ) : (
            <ImagePlus size={22} />
          )}
          <span className="text-xs">
            {uploading ? "Uploading..." : "Click to upload"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-2 text-xs text-gold">{error}</p>}
    </div>
  );
}
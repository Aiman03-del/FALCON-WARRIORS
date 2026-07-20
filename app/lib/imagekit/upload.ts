"use client";

export type ImageKitUploadResult = {
  url: string;
  fileId: string;
  name: string;
};

async function getAuthParams() {
  const res = await fetch("/api/imagekit-auth");
  if (!res.ok) throw new Error("Failed to get upload authentication");
  return res.json() as Promise<{
    signature: string;
    expire: number;
    token: string;
  }>;
}

export async function uploadToImageKit(
  file: File,
  folder: string = "/falcon-warriors"
): Promise<ImageKitUploadResult> {
  const { signature, expire, token } = await getAuthParams();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("folder", folder);
  formData.append(
    "publicKey",
    process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!
  );
  formData.append("signature", signature);
  formData.append("expire", String(expire));
  formData.append("token", token);
  formData.append("useUniqueFileName", "true");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ImageKit upload failed: ${errText}`);
  }

  const data = await res.json();
  return { url: data.url, fileId: data.fileId, name: data.name };
}
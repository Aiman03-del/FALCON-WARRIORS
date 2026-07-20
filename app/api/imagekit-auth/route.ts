import { NextResponse } from "next/server";
import ImageKit from "imagekit";

function getImageKitClient() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return null;
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
}

export async function GET() {
  const imagekit = getImageKitClient();

  if (!imagekit) {
    return NextResponse.json(
      { error: "ImageKit is not configured" },
      { status: 500 }
    );
  }

  const authParams = imagekit.getAuthenticationParameters();
  return NextResponse.json(authParams);
}
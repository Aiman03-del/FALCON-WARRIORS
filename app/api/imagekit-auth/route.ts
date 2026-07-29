import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { createClient } from "@/app/lib/supabase/server";

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

export async function GET(request: Request) {
  const imagekit = getImageKitClient();

  if (!imagekit) {
    return NextResponse.json({ error: "ImageKit is not configured" }, { status: 500 });
  }

  // Require an authenticated user (server-side). If not authenticated, return 401.
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({ error: "Failed to verify user" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authParams = imagekit.getAuthenticationParameters();
  return NextResponse.json(authParams);
}
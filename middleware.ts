import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Demo mode - set to true to allow access without authentication
const DEMO_MODE = false;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  // Check if Supabase credentials are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // If no Supabase credentials and demo mode is on, allow all protected paths
    if (DEMO_MODE) {
      return response;
    }
    return response;
  }

  const protectedPaths = ["/dashboard", "/profile/edit"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const protectedPaths = ["/dashboard", "/profile/edit"];
    const isProtected = protectedPaths.some((p) =>
      request.nextUrl.pathname.startsWith(p)
    );

    // Allow dashboard access in demo mode
    if (DEMO_MODE && isProtected) {
      return response;
    }

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user) {
      const blockedForSuspended = ["/dashboard", "/profile/edit"].some((p) =>
        request.nextUrl.pathname.startsWith(p)
      );

      if (blockedForSuspended) {
        const { data: player } = await supabase
          .from("player_details")
          .select("membership_status")
          .eq("profile_id", user.id)
          .maybeSingle();

        if (player?.membership_status === "suspended") {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          url.searchParams.set("suspended", "1");
          return NextResponse.redirect(url);
        }
      }
    }
  } catch (error) {
    // If Supabase fails, don't silently fail-open for protected paths.
    // In demo mode allow access; otherwise, if the path is protected redirect to login.
    if (DEMO_MODE) {
      return response;
    }
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};  

import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=oauth_missing_code`
    );
  }

  const supabase = await createClient();

  /*
   * Exchange Google's OAuth code for a Supabase session.
   */
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("OAuth exchange error:", exchangeError);

    return NextResponse.redirect(
      `${origin}/login?error=oauth_failed`
    );
  }

  /*
   * Get the authenticated Supabase user.
   */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("OAuth user error:", userError);

    return NextResponse.redirect(
      `${origin}/login?error=user_not_found`
    );
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const googleName =
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    "";
  const googleAvatar =
    (typeof metadata.avatar_url === "string" && metadata.avatar_url.trim()) ||
    (typeof metadata.picture === "string" && metadata.picture.trim()) ||
    "";

  /*
   * Check whether this authenticated user already has
   * a player profile in player_details.
   *
   * profile_id must be the Supabase Auth user ID.
   */
  const { data: player, error: playerError } = await supabase
    .from("player_details")
    .select("id, membership_status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (playerError) {
    console.error("Player profile lookup error:", playerError);

    return NextResponse.redirect(
      `${origin}/login?error=profile_lookup_failed`
    );
  }

  /*
   * CASE 1:
   *
   * Google user exists in player_details.
   *
   * This is an existing user.
   * Send them directly to the requested destination.
   */
  if (player) {
    if (player.membership_status === "pending") {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=pending_approval`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  /*
   * CASE 2:
   *
   * Google authentication succeeded, but there is
   * no player_details record yet.
   *
   * This means the user has authenticated with Google
   * but has not completed their Falcon Warriors profile.
   *
   * Send them to /register.
   *
   * The register page will detect the active Google
   * session and show the "Finish Setup" form.
   */
  return NextResponse.redirect(`${origin}/register`);
}
import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getAccessToken, createPlaylist } from "@/lib/spotify";

interface Prompt {
  id: string;
  title: string;
  description: string;
  creator_name: string;
  is_open: number;
  spotify_playlist_id: string | null;
  spotify_playlist_url: string | null;
}

interface Submission {
  track_uri: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // this is the prompt ID
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/prompt/${state}?error=spotify_denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}?error=invalid_callback`);
  }

  try {
    const db = getDb();
    const prompt = db
      .prepare("SELECT * FROM prompts WHERE id = ?")
      .get(state) as Prompt | undefined;

    if (!prompt) {
      return NextResponse.redirect(`${baseUrl}?error=prompt_not_found`);
    }

    // If playlist already exists, redirect
    if (prompt.spotify_playlist_url) {
      return NextResponse.redirect(`${baseUrl}/prompt/${state}`);
    }

    const submissions = db
      .prepare("SELECT track_uri FROM submissions WHERE prompt_id = ?")
      .all(state) as Submission[];

    if (submissions.length === 0) {
      return NextResponse.redirect(
        `${baseUrl}/prompt/${state}?error=no_submissions`
      );
    }

    const tokens = await getAccessToken(code);
    const trackUris = submissions.map((s) => s.track_uri);

    const playlist = await createPlaylist(
      tokens.access_token,
      prompt.title,
      `${prompt.description} — Created with Phds MP3`,
      trackUris
    );

    db.prepare(
      "UPDATE prompts SET spotify_playlist_id = ?, spotify_playlist_url = ? WHERE id = ?"
    ).run(playlist.id, playlist.external_urls.spotify, state);

    return NextResponse.redirect(`${baseUrl}/prompt/${state}`);
  } catch (err) {
    console.error("Spotify callback error:", err);
    return NextResponse.redirect(
      `${baseUrl}/prompt/${state}?error=playlist_creation_failed`
    );
  }
}

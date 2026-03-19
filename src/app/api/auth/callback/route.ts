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

interface CommunityPlaylist {
  id: string;
  name: string;
  description: string;
  spotify_playlist_id: string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!code || !state) {
    if (error && state) {
      // Try to figure out where to redirect on denial
      if (state.startsWith("community:")) {
        const id = state.slice("community:".length);
        return NextResponse.redirect(`${baseUrl}/community/${id}?error=spotify_denied`);
      }
      return NextResponse.redirect(`${baseUrl}/prompt/${state}?error=spotify_denied`);
    }
    return NextResponse.redirect(`${baseUrl}?error=invalid_callback`);
  }

  // Route to the right handler based on state prefix
  if (state.startsWith("community:")) {
    return handleCommunityCallback(code, state.slice("community:".length), baseUrl);
  }

  return handlePromptCallback(code, state, baseUrl);
}

async function handleCommunityCallback(code: string, id: string, baseUrl: string) {
  try {
    const db = getDb();
    const playlist = db
      .prepare("SELECT * FROM community_playlists WHERE id = ?")
      .get(id) as CommunityPlaylist | undefined;

    if (!playlist) {
      return NextResponse.redirect(`${baseUrl}?error=playlist_not_found`);
    }

    if (playlist.spotify_playlist_id) {
      return NextResponse.redirect(`${baseUrl}/community/${id}`);
    }

    const tokens = await getAccessToken(code);

    // Create the Spotify playlist
    const spotifyPlaylist = await createPlaylist(
      tokens.access_token,
      playlist.name,
      `${playlist.description} — Community playlist on Phds MP3`,
      []
    );

    // Store the playlist info AND refresh token for future track additions
    db.prepare(
      `UPDATE community_playlists
       SET spotify_playlist_id = ?, spotify_playlist_url = ?, spotify_refresh_token = ?
       WHERE id = ?`
    ).run(
      spotifyPlaylist.id,
      spotifyPlaylist.external_urls.spotify,
      tokens.refresh_token,
      id
    );

    return NextResponse.redirect(`${baseUrl}/community/${id}`);
  } catch (err) {
    console.error("Community playlist callback error:", err);
    return NextResponse.redirect(
      `${baseUrl}/community/new?error=creation_failed`
    );
  }
}

async function handlePromptCallback(code: string, promptId: string, baseUrl: string) {
  try {
    const db = getDb();
    const prompt = db
      .prepare("SELECT * FROM prompts WHERE id = ?")
      .get(promptId) as Prompt | undefined;

    if (!prompt) {
      return NextResponse.redirect(`${baseUrl}?error=prompt_not_found`);
    }

    if (prompt.spotify_playlist_url) {
      return NextResponse.redirect(`${baseUrl}/prompt/${promptId}`);
    }

    const submissions = db
      .prepare("SELECT track_uri FROM submissions WHERE prompt_id = ?")
      .all(promptId) as Submission[];

    if (submissions.length === 0) {
      return NextResponse.redirect(
        `${baseUrl}/prompt/${promptId}?error=no_submissions`
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
    ).run(playlist.id, playlist.external_urls.spotify, promptId);

    return NextResponse.redirect(`${baseUrl}/prompt/${promptId}`);
  } catch (err) {
    console.error("Spotify callback error:", err);
    return NextResponse.redirect(
      `${baseUrl}/prompt/${promptId}?error=playlist_creation_failed`
    );
  }
}

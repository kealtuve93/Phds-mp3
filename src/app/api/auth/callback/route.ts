import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { getAccessToken, createPlaylist } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!code || !state) {
    if (error && state) {
      if (state.startsWith("community:")) {
        const id = state.slice("community:".length);
        return NextResponse.redirect(`${baseUrl}/community/${id}?error=spotify_denied`);
      }
      return NextResponse.redirect(`${baseUrl}/prompt/${state}?error=spotify_denied`);
    }
    return NextResponse.redirect(`${baseUrl}?error=invalid_callback`);
  }

  if (state.startsWith("community:")) {
    return handleCommunityCallback(code, state.slice("community:".length), baseUrl);
  }

  return handlePromptCallback(code, state, baseUrl);
}

async function handleCommunityCallback(code: string, id: string, baseUrl: string) {
  try {
    const playlists = await query(
      "SELECT * FROM community_playlists WHERE id = ?",
      [id]
    );

    if (playlists.length === 0) {
      return NextResponse.redirect(`${baseUrl}?error=playlist_not_found`);
    }

    const playlist = playlists[0];

    if (playlist.spotify_playlist_id) {
      return NextResponse.redirect(`${baseUrl}/community/${id}`);
    }

    const tokens = await getAccessToken(code);

    const spotifyPlaylist = await createPlaylist(
      tokens.access_token,
      playlist.name as string,
      `${playlist.description} — Community playlist on Phds MP3`,
      []
    );

    await execute(
      `UPDATE community_playlists
       SET spotify_playlist_id = ?, spotify_playlist_url = ?, spotify_refresh_token = ?
       WHERE id = ?`,
      [spotifyPlaylist.id, spotifyPlaylist.external_urls.spotify, tokens.refresh_token, id]
    );

    return NextResponse.redirect(`${baseUrl}/community/${id}`);
  } catch (err) {
    console.error("Community playlist callback error:", err);
    return NextResponse.redirect(`${baseUrl}/community/new?error=creation_failed`);
  }
}

async function handlePromptCallback(code: string, promptId: string, baseUrl: string) {
  try {
    const prompts = await query("SELECT * FROM prompts WHERE id = ?", [promptId]);

    if (prompts.length === 0) {
      return NextResponse.redirect(`${baseUrl}?error=prompt_not_found`);
    }

    const prompt = prompts[0];

    if (prompt.spotify_playlist_url) {
      return NextResponse.redirect(`${baseUrl}/prompt/${promptId}`);
    }

    const submissions = await query(
      "SELECT track_uri FROM submissions WHERE prompt_id = ?",
      [promptId]
    );

    if (submissions.length === 0) {
      return NextResponse.redirect(`${baseUrl}/prompt/${promptId}?error=no_submissions`);
    }

    const tokens = await getAccessToken(code);
    const trackUris = submissions.map((s) => s.track_uri as string);

    const playlist = await createPlaylist(
      tokens.access_token,
      prompt.title as string,
      `${prompt.description} — Created with Phds MP3`,
      trackUris
    );

    await execute(
      "UPDATE prompts SET spotify_playlist_id = ?, spotify_playlist_url = ? WHERE id = ?",
      [playlist.id, playlist.external_urls.spotify, promptId]
    );

    return NextResponse.redirect(`${baseUrl}/prompt/${promptId}`);
  } catch (err) {
    console.error("Spotify callback error:", err);
    return NextResponse.redirect(`${baseUrl}/prompt/${promptId}?error=playlist_creation_failed`);
  }
}

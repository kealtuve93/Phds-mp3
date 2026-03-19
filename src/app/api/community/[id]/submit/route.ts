import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import {
  extractTrackId,
  getTrackInfo,
  refreshAccessToken,
  addTracksToPlaylist,
} from "@/lib/spotify";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { spotifyLink, submittedBy, description } = body;

  if (!spotifyLink || !submittedBy) {
    return NextResponse.json(
      { error: "Spotify link and your name are required" },
      { status: 400 }
    );
  }

  const playlists = await query(
    "SELECT * FROM community_playlists WHERE id = ?",
    [id]
  );

  if (playlists.length === 0) {
    return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
  }

  const playlist = playlists[0];

  if (!playlist.spotify_playlist_id || !playlist.spotify_refresh_token) {
    return NextResponse.json(
      { error: "Playlist is not yet connected to Spotify" },
      { status: 400 }
    );
  }

  const trackId = extractTrackId(spotifyLink);
  if (!trackId) {
    return NextResponse.json(
      { error: "Invalid Spotify link. Please provide a valid Spotify track URL or URI." },
      { status: 400 }
    );
  }

  const trackInfo = await getTrackInfo(trackId);
  const trackUri = trackInfo?.uri || `spotify:track:${trackId}`;

  const existing = await query(
    "SELECT id FROM community_submissions WHERE playlist_id = ? AND track_uri = ?",
    [id, trackUri]
  );

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "This track has already been added to the playlist" },
      { status: 400 }
    );
  }

  try {
    const tokens = await refreshAccessToken(
      playlist.spotify_refresh_token as string
    );
    await addTracksToPlaylist(
      tokens.access_token,
      playlist.spotify_playlist_id as string,
      [trackUri]
    );

    if (tokens.refresh_token) {
      await execute(
        "UPDATE community_playlists SET spotify_refresh_token = ? WHERE id = ?",
        [tokens.refresh_token, id]
      );
    }
  } catch (err) {
    console.error("Failed to add track to Spotify:", err);
    return NextResponse.json(
      { error: "Failed to add track to Spotify. The playlist owner may need to re-authorize." },
      { status: 500 }
    );
  }

  await execute(
    "INSERT INTO community_submissions (playlist_id, track_uri, track_name, track_artist, track_image, submitted_by, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, trackUri, trackInfo?.name || null, trackInfo?.artist || null, trackInfo?.image || null, submittedBy, description || null]
  );

  return NextResponse.json({
    success: true,
    track: trackInfo
      ? { name: trackInfo.name, artist: trackInfo.artist, image: trackInfo.image }
      : null,
  });
}

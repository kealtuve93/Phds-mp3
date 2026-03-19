import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const playlists = await query(
    "SELECT id, name, description, creator_name, spotify_playlist_id, spotify_playlist_url, created_at FROM community_playlists WHERE id = ?",
    [id]
  );

  if (playlists.length === 0) {
    return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
  }

  const submissions = await query(
    "SELECT id, track_uri, track_name, track_artist, track_image, submitted_by, description, created_at FROM community_submissions WHERE playlist_id = ? ORDER BY created_at DESC",
    [id]
  );

  return NextResponse.json({ playlist: playlists[0], submissions });
}

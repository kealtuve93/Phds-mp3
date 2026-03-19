import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { extractTrackId, getTrackInfo } from "@/lib/spotify";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { spotifyLink, submittedBy } = body;

  if (!spotifyLink || !submittedBy) {
    return NextResponse.json(
      { error: "Spotify link and your name are required" },
      { status: 400 }
    );
  }

  const prompts = await query("SELECT * FROM prompts WHERE id = ?", [id]);
  if (prompts.length === 0) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  const prompt = prompts[0];
  if (!prompt.is_open) {
    return NextResponse.json(
      { error: "Submissions are closed for this prompt" },
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
    "SELECT id FROM submissions WHERE prompt_id = ? AND track_uri = ?",
    [id, trackUri]
  );

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "This track has already been submitted" },
      { status: 400 }
    );
  }

  await execute(
    "INSERT INTO submissions (prompt_id, track_uri, track_name, track_artist, track_image, submitted_by) VALUES (?, ?, ?, ?, ?, ?)",
    [id, trackUri, trackInfo?.name || null, trackInfo?.artist || null, trackInfo?.image || null, submittedBy]
  );

  return NextResponse.json({
    success: true,
    track: trackInfo
      ? { name: trackInfo.name, artist: trackInfo.artist, image: trackInfo.image }
      : null,
  });
}

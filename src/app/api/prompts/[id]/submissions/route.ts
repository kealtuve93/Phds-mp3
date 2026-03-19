import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
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

  const db = getDb();

  const prompt = db
    .prepare("SELECT * FROM prompts WHERE id = ?")
    .get(id) as { is_open: number } | undefined;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

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

  // Look up track info from Spotify
  const trackInfo = await getTrackInfo(trackId);
  const trackUri = trackInfo?.uri || `spotify:track:${trackId}`;

  // Check for duplicate submissions
  const existing = db
    .prepare("SELECT id FROM submissions WHERE prompt_id = ? AND track_uri = ?")
    .get(id, trackUri);

  if (existing) {
    return NextResponse.json(
      { error: "This track has already been submitted" },
      { status: 400 }
    );
  }

  db.prepare(
    "INSERT INTO submissions (prompt_id, track_uri, track_name, track_artist, track_image, submitted_by) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    id,
    trackUri,
    trackInfo?.name || null,
    trackInfo?.artist || null,
    trackInfo?.image || null,
    submittedBy
  );

  return NextResponse.json({
    success: true,
    track: trackInfo
      ? { name: trackInfo.name, artist: trackInfo.artist, image: trackInfo.image }
      : null,
  });
}

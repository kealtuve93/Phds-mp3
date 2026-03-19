import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { nanoid } from "nanoid";
import { getAuthUrl } from "@/lib/spotify";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, creatorName } = body;

  if (!name || !description || !creatorName) {
    return NextResponse.json(
      { error: "Name, description, and your name are required" },
      { status: 400 }
    );
  }

  const id = nanoid(10);
  const db = getDb();

  db.prepare(
    "INSERT INTO community_playlists (id, name, description, creator_name) VALUES (?, ?, ?, ?)"
  ).run(id, name, description, creatorName);

  // state encodes both type and id so the callback knows what to do
  const authUrl = getAuthUrl(`community:${id}`);

  return NextResponse.json({ id, authUrl });
}

export async function GET() {
  const db = getDb();
  const playlists = db
    .prepare(
      `SELECT cp.*, COUNT(cs.id) as song_count
       FROM community_playlists cp
       LEFT JOIN community_submissions cs ON cp.id = cs.playlist_id
       WHERE cp.spotify_playlist_id IS NOT NULL
       GROUP BY cp.id
       ORDER BY cp.created_at DESC`
    )
    .all();

  return NextResponse.json(playlists);
}

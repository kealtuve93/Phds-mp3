import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getAuthUrl } from "@/lib/spotify";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const prompt = db
    .prepare("SELECT * FROM prompts WHERE id = ?")
    .get(id) as { is_open: number } | undefined;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  // Close submissions
  db.prepare("UPDATE prompts SET is_open = 0 WHERE id = ?").run(id);

  // Return Spotify auth URL so the creator can authorize playlist creation
  const authUrl = getAuthUrl(id);

  return NextResponse.json({ authUrl });
}

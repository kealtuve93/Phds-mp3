import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const prompt = db.prepare("SELECT * FROM prompts WHERE id = ?").get(id);
  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  const submissions = db
    .prepare(
      "SELECT * FROM submissions WHERE prompt_id = ? ORDER BY created_at DESC"
    )
    .all(id);

  return NextResponse.json({ prompt, submissions });
}

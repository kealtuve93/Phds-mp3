import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prompts = await query("SELECT * FROM prompts WHERE id = ?", [id]);
  if (prompts.length === 0) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  const submissions = await query(
    "SELECT * FROM submissions WHERE prompt_id = ? ORDER BY created_at DESC",
    [id]
  );

  return NextResponse.json({ prompt: prompts[0], submissions });
}

import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { getAuthUrl } from "@/lib/spotify";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prompts = await query("SELECT * FROM prompts WHERE id = ?", [id]);
  if (prompts.length === 0) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  await execute("UPDATE prompts SET is_open = 0 WHERE id = ?", [id]);

  const authUrl = getAuthUrl(id);
  return NextResponse.json({ authUrl });
}

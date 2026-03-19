import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, creatorName } = body;

  if (!title || !description || !creatorName) {
    return NextResponse.json(
      { error: "Title, description, and your name are required" },
      { status: 400 }
    );
  }

  const id = nanoid(10);

  await execute(
    "INSERT INTO prompts (id, title, description, creator_name) VALUES (?, ?, ?, ?)",
    [id, title, description, creatorName]
  );

  return NextResponse.json({ id });
}

export async function GET() {
  const prompts = await query(
    "SELECT p.*, COUNT(s.id) as submission_count FROM prompts p LEFT JOIN submissions s ON p.id = s.prompt_id GROUP BY p.id ORDER BY p.created_at DESC"
  );

  return NextResponse.json(prompts);
}

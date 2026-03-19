import { createClient, type Client, type Row } from "@libsql/client";

let client: Client | null = null;
let initialized = false;

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:playlist.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

async function initDb(): Promise<void> {
  if (initialized) return;
  const db = getClient();

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      creator_name TEXT NOT NULL,
      is_open INTEGER NOT NULL DEFAULT 1,
      spotify_playlist_id TEXT,
      spotify_playlist_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt_id TEXT NOT NULL REFERENCES prompts(id),
      track_uri TEXT NOT NULL,
      track_name TEXT,
      track_artist TEXT,
      track_image TEXT,
      submitted_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS community_playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      creator_name TEXT NOT NULL,
      spotify_playlist_id TEXT,
      spotify_playlist_url TEXT,
      spotify_refresh_token TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS community_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id TEXT NOT NULL REFERENCES community_playlists(id),
      track_uri TEXT NOT NULL,
      track_name TEXT,
      track_artist TEXT,
      track_image TEXT,
      submitted_by TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(playlist_id, track_uri)
    );
  `);

  initialized = true;
}

export async function query(
  sql: string,
  args: (string | number | null)[] = []
): Promise<Row[]> {
  await initDb();
  const db = getClient();
  const result = await db.execute({ sql, args });
  return result.rows;
}

export async function execute(
  sql: string,
  args: (string | number | null)[] = []
): Promise<void> {
  await initDb();
  const db = getClient();
  await db.execute({ sql, args });
}

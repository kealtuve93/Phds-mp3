import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "playlist.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
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
  `);
}

export default getDb;

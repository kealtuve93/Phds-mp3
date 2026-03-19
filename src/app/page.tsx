"use client";

import { useEffect, useState } from "react";

interface Prompt {
  id: string;
  title: string;
  description: string;
  creator_name: string;
  is_open: number;
  submission_count: number;
  spotify_playlist_url: string | null;
  created_at: string;
}

interface CommunityPlaylist {
  id: string;
  name: string;
  description: string;
  creator_name: string;
  song_count: number;
  spotify_playlist_url: string | null;
  created_at: string;
}

export default function HomePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [communityPlaylists, setCommunityPlaylists] = useState<CommunityPlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/prompts").then((r) => r.json()),
      fetch("/api/community").then((r) => r.json()),
    ])
      .then(([promptData, communityData]) => {
        setPrompts(promptData);
        setCommunityPlaylists(communityData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hasContent = prompts.length > 0 || communityPlaylists.length > 0;

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">
          Collaborative Playlist Creator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Create playlist prompts or community playlists, share them with
          friends, collect song submissions, and enjoy music together on
          Spotify.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : !hasContent ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-6">Nothing here yet.</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/community/new"
              className="inline-block bg-purple-500 hover:bg-purple-400 text-white font-semibold px-6 py-3 rounded-full transition"
            >
              Create a Community Playlist
            </a>
            <a
              href="/create"
              className="inline-block bg-green-500 hover:bg-green-400 text-gray-950 font-semibold px-6 py-3 rounded-full transition"
            >
              Create a Prompt
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Community Playlists */}
          {communityPlaylists.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Community Playlists</h2>
                <a
                  href="/community/new"
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium transition"
                >
                  + New
                </a>
              </div>
              <div className="grid gap-4">
                {communityPlaylists.map((pl) => (
                  <a
                    key={pl.id}
                    href={`/community/${pl.id}`}
                    className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold group-hover:text-purple-400 transition truncate">
                          {pl.name}
                        </h3>
                        <p className="text-gray-400 mt-1 line-clamp-2">
                          {pl.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>by {pl.creator_name}</span>
                          <span>·</span>
                          <span>{pl.song_count} songs</span>
                        </div>
                      </div>
                      <span className="flex-shrink-0 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                        Always Open
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Prompt Playlists */}
          {prompts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Playlist Prompts</h2>
                <a
                  href="/create"
                  className="text-green-400 hover:text-green-300 text-sm font-medium transition"
                >
                  + New
                </a>
              </div>
              <div className="grid gap-4">
                {prompts.map((prompt) => (
                  <a
                    key={prompt.id}
                    href={`/prompt/${prompt.id}`}
                    className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold group-hover:text-green-400 transition truncate">
                          {prompt.title}
                        </h3>
                        <p className="text-gray-400 mt-1 line-clamp-2">
                          {prompt.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>by {prompt.creator_name}</span>
                          <span>·</span>
                          <span>{prompt.submission_count} songs</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {prompt.spotify_playlist_url ? (
                          <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                            Playlist Ready
                          </span>
                        ) : prompt.is_open ? (
                          <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                            Open
                          </span>
                        ) : (
                          <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

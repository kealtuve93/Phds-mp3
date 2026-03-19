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

export default function HomePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prompts")
      .then((res) => res.json())
      .then((data) => {
        setPrompts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">
          Collaborative Playlist Creator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Create a playlist prompt, share it with friends, collect song
          submissions, and generate a Spotify playlist everyone can enjoy.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading prompts...</div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No prompts yet.</p>
          <a
            href="/create"
            className="inline-block bg-green-500 hover:bg-green-400 text-gray-950 font-semibold px-6 py-3 rounded-full transition"
          >
            Create the first one!
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {prompts.map((prompt) => (
            <a
              key={prompt.id}
              href={`/prompt/${prompt.id}`}
              className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold group-hover:text-green-400 transition truncate">
                    {prompt.title}
                  </h2>
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
      )}
    </div>
  );
}

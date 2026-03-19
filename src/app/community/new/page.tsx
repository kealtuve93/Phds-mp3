"use client";

import { useState } from "react";

export default function NewCommunityPlaylistPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, creatorName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create playlist");
      }

      const { authUrl } = await res.json();
      // Redirect to Spotify to authorize playlist creation
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Create a Community Playlist</h1>
      <p className="text-gray-400 mb-8">
        Create a shared playlist that stays open forever. Share the link and
        anyone can add songs anytime — they go straight to Spotify.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Playlist Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`e.g., "The Phds Collective"`}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition placeholder:text-gray-600"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What kind of songs should people add? Or just a note for the crew."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition placeholder:text-gray-600 resize-none"
          />
        </div>

        <div>
          <label
            htmlFor="creatorName"
            className="block text-sm font-medium mb-2"
          >
            Your Name
          </label>
          <input
            id="creatorName"
            type="text"
            required
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition placeholder:text-gray-600"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm text-gray-400">
          <p>
            <strong className="text-gray-300">How it works:</strong> After
            clicking create, you&apos;ll be redirected to Spotify to authorize the
            playlist. Once connected, anyone with the link can add songs
            directly to the playlist — no login needed for them.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-gray-950 font-semibold py-3 rounded-full transition"
        >
          {submitting ? "Creating..." : "Create & Connect to Spotify"}
        </button>
      </form>
    </div>
  );
}

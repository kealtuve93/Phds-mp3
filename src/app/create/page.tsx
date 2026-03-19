"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, creatorName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create prompt");
      }

      const { id } = await res.json();
      router.push(`/prompt/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Create a Playlist Prompt</h1>
      <p className="text-gray-400 mb-8">
        Set the theme, share the link, and let your friends submit songs.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Playlist Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g., "Late Night Drive Vibes"'
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition placeholder:text-gray-600"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Prompt / Description
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`e.g., "Songs that make you feel like you're cruising through the city at 2am with the windows down"`}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition placeholder:text-gray-600 resize-none"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Your Name
          </label>
          <input
            id="name"
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-gray-950 font-semibold py-3 rounded-full transition"
        >
          {submitting ? "Creating..." : "Create Prompt"}
        </button>
      </form>
    </div>
  );
}

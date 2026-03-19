"use client";

import { useEffect, useState, use } from "react";

interface Prompt {
  id: string;
  title: string;
  description: string;
  creator_name: string;
  is_open: number;
  spotify_playlist_id: string | null;
  spotify_playlist_url: string | null;
  created_at: string;
}

interface Submission {
  id: number;
  track_uri: string;
  track_name: string | null;
  track_artist: string | null;
  track_image: string | null;
  submitted_by: string;
  created_at: string;
}

export default function PromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [spotifyLink, setSpotifyLink] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/prompts/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setPrompt(data.prompt);
      setSubmissions(data.submissions);
    } catch {
      setPrompt(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/prompts/${id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyLink, submittedBy }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSubmitSuccess(
        data.track
          ? `Added "${data.track.name}" by ${data.track.artist}`
          : "Song submitted!"
      );
      setSpotifyLink("");
      fetchData();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClose() {
    if (
      !confirm(
        "Are you sure? This will close submissions and start Spotify playlist creation."
      )
    )
      return;

    setClosing(true);
    try {
      const res = await fetch(`/api/prompts/${id}/close`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Redirect to Spotify auth
      window.location.href = data.authUrl;
    } catch {
      setClosing(false);
      alert("Failed to close submissions");
    }
  }

  function handleCopyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">Loading...</div>
    );
  }

  if (!prompt) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-2">Prompt Not Found</h1>
        <p className="text-gray-400">
          This prompt doesn&apos;t exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">{prompt.title}</h1>
            <p className="text-gray-400 mt-1">by {prompt.creator_name}</p>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex-shrink-0 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
          >
            {copied ? "Copied!" : "📋 Share Link"}
          </button>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-lg text-gray-300 italic">
            &ldquo;{prompt.description}&rdquo;
          </p>
        </div>
      </div>

      {/* Spotify Playlist Banner */}
      {prompt.spotify_playlist_url && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8 text-center">
          <h2 className="text-xl font-bold text-green-400 mb-2">
            🎉 Playlist is Ready!
          </h2>
          <p className="text-gray-400 mb-4">
            The playlist has been created on Spotify with{" "}
            {submissions.length} songs.
          </p>
          <a
            href={prompt.spotify_playlist_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 hover:bg-green-400 text-gray-950 font-semibold px-6 py-3 rounded-full transition"
          >
            🎧 Open in Spotify
          </a>
          {/* Spotify Embed */}
          {prompt.spotify_playlist_id && (
            <div className="mt-6">
              <iframe
                src={`https://open.spotify.com/embed/playlist/${prompt.spotify_playlist_id}?theme=0`}
                width="100%"
                height="380"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Submit Song Form */}
      {prompt.is_open && !prompt.spotify_playlist_url && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Submit a Song</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="spotifyLink"
                className="block text-sm font-medium mb-1.5"
              >
                Spotify Link
              </label>
              <input
                id="spotifyLink"
                type="text"
                required
                value={spotifyLink}
                onChange={(e) => setSpotifyLink(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-green-500 transition placeholder:text-gray-600 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="submittedBy"
                className="block text-sm font-medium mb-1.5"
              >
                Your Name
              </label>
              <input
                id="submittedBy"
                type="text"
                required
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                placeholder="Your name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-green-500 transition placeholder:text-gray-600 text-sm"
              />
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm">
                {submitSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-gray-950 font-semibold px-6 py-2.5 rounded-full transition text-sm"
            >
              {submitting ? "Submitting..." : "Submit Song"}
            </button>
          </form>
        </div>
      )}

      {/* Close Submissions Button */}
      {prompt.is_open && !prompt.spotify_playlist_url && (
        <div className="flex justify-end mb-8">
          <button
            onClick={handleClose}
            disabled={closing || submissions.length === 0}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium px-5 py-2.5 rounded-lg transition text-sm disabled:opacity-50"
          >
            {closing
              ? "Closing..."
              : `Close Submissions & Create Playlist (${submissions.length} songs)`}
          </button>
        </div>
      )}

      {/* Closed but no playlist yet */}
      {!prompt.is_open && !prompt.spotify_playlist_url && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8 text-center">
          <h2 className="text-xl font-bold text-yellow-400 mb-2">
            Submissions Closed
          </h2>
          <p className="text-gray-400">
            The playlist is being generated. Check back soon!
          </p>
        </div>
      )}

      {/* Submissions List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Submissions ({submissions.length})
        </h2>
        {submissions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No songs submitted yet. Be the first!
          </p>
        ) : (
          <div className="space-y-2">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-lg p-3"
              >
                {sub.track_image && (
                  <img
                    src={sub.track_image}
                    alt=""
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {sub.track_name || "Unknown Track"}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {sub.track_artist || "Unknown Artist"}
                  </p>
                </div>
                <div className="text-sm text-gray-500 flex-shrink-0">
                  {sub.submitted_by}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

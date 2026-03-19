"use client";

import { useEffect, useState, use } from "react";

interface CommunityPlaylist {
  id: string;
  name: string;
  description: string;
  creator_name: string;
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
  description: string | null;
  created_at: string;
}

export default function CommunityPlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [playlist, setPlaylist] = useState<CommunityPlaylist | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [spotifyLink, setSpotifyLink] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/community/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setPlaylist(data.playlist);
      setSubmissions(data.submissions);
    } catch {
      setPlaylist(null);
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
      const res = await fetch(`/api/community/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyLink, submittedBy, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSubmitSuccess(
        data.track
          ? `Added "${data.track.name}" by ${data.track.artist} to the playlist!`
          : "Song added to the playlist!"
      );
      setSpotifyLink("");
      setDescription("");
      fetchData();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading...</div>;
  }

  if (!playlist) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-2">Playlist Not Found</h1>
        <p className="text-gray-400">
          This community playlist doesn&apos;t exist or has been removed.
        </p>
      </div>
    );
  }

  const isReady = !!playlist.spotify_playlist_id;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
                Community Playlist
              </span>
              <span className="text-green-400 text-xs font-medium">
                Always Open
              </span>
            </div>
            <h1 className="text-3xl font-bold">{playlist.name}</h1>
            <p className="text-gray-400 mt-1">by {playlist.creator_name}</p>
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
            &ldquo;{playlist.description}&rdquo;
          </p>
        </div>
      </div>

      {/* Spotify Embed */}
      {playlist.spotify_playlist_id && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Listen Now</h2>
            {playlist.spotify_playlist_url && (
              <a
                href={playlist.spotify_playlist_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-sm font-medium transition"
              >
                Open in Spotify →
              </a>
            )}
          </div>
          <iframe
            src={`https://open.spotify.com/embed/playlist/${playlist.spotify_playlist_id}?theme=0`}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
          />
        </div>
      )}

      {/* Submit Song Form */}
      {isReady && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-1">Add a Song</h2>
          <p className="text-gray-500 text-sm mb-4">
            Paste a Spotify link and it goes straight to the playlist.
          </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1.5"
                >
                  Why this song?{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="It just hits different"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-green-500 transition placeholder:text-gray-600 text-sm"
                />
              </div>
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
              {submitting ? "Adding..." : "Add to Playlist"}
            </button>
          </form>
        </div>
      )}

      {!isReady && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8 text-center">
          <h2 className="text-xl font-bold text-yellow-400 mb-2">
            Setting Up...
          </h2>
          <p className="text-gray-400">
            This playlist is being connected to Spotify. Check back soon!
          </p>
        </div>
      )}

      {/* Submissions List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Recent Additions ({submissions.length})
        </h2>
        {submissions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No songs added yet. Be the first!
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
                  {sub.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate italic">
                      &ldquo;{sub.description}&rdquo;
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-500 flex-shrink-0 text-right">
                  <div>{sub.submitted_by}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

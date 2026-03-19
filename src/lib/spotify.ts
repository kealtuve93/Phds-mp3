const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || "";

export function getAuthUrl(promptId: string): string {
  const scopes = "playlist-modify-public playlist-modify-private";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: promptId,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Spotify token error: ${err}`);
  }

  return response.json();
}

export async function createPlaylist(
  accessToken: string,
  name: string,
  description: string,
  trackUris: string[]
): Promise<{ id: string; external_urls: { spotify: string } }> {
  // Get current user
  const meRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!meRes.ok) throw new Error("Failed to get Spotify user");
  const me = await meRes.json();

  // Create playlist
  const playlistRes = await fetch(
    `https://api.spotify.com/v1/users/${me.id}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        public: true,
      }),
    }
  );
  if (!playlistRes.ok) throw new Error("Failed to create playlist");
  const playlist = await playlistRes.json();

  // Add tracks in batches of 100
  for (let i = 0; i < trackUris.length; i += 100) {
    const batch = trackUris.slice(i, i + 100);
    const addRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: batch }),
      }
    );
    if (!addRes.ok) throw new Error("Failed to add tracks to playlist");
  }

  return playlist;
}

export async function getTrackInfo(
  trackId: string
): Promise<{ name: string; artist: string; uri: string; image: string } | null> {
  // Use client credentials flow for track lookup
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!tokenRes.ok) return null;
  const { access_token } = await tokenRes.json();

  const trackRes = await fetch(
    `https://api.spotify.com/v1/tracks/${trackId}`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  if (!trackRes.ok) return null;
  const track = await trackRes.json();

  return {
    name: track.name,
    artist: track.artists.map((a: { name: string }) => a.name).join(", "),
    uri: track.uri,
    image: track.album?.images?.[0]?.url || "",
  };
}

export function extractTrackId(input: string): string | null {
  // Handle Spotify URIs: spotify:track:XXXXX
  const uriMatch = input.match(/spotify:track:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  // Handle Spotify URLs: https://open.spotify.com/track/XXXXX?...
  const urlMatch = input.match(
    /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/
  );
  if (urlMatch) return urlMatch[1];

  return null;
}

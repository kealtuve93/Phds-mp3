# Phds MP3 — Collaborative Spotify Playlist Creator

A web app where you create a playlist prompt, share it with friends, collect Spotify song submissions, and generate a real Spotify playlist.

## How It Works

### Playlist Prompts
1. **Create a Prompt** — Give your playlist a title and a creative theme (e.g., "Songs that make you feel like you're in a movie")
2. **Share the Link** — Send the unique prompt URL to friends
3. **Collect Songs** — Friends submit Spotify track links that match the prompt
4. **Generate Playlist** — When ready, close submissions and authorize with Spotify to create the playlist
5. **Listen Together** — Everyone can enjoy the playlist on Spotify, with an embedded player right on the page

### Community Playlists
1. **Create a Community Playlist** — Name it, describe it, connect to Spotify
2. **Share the Link** — Anyone with the link can add songs anytime
3. **Songs go straight to Spotify** — No closing step, tracks are added in real-time
4. **Listen & Grow** — The playlist lives on and keeps growing

## Setup

### Prerequisites

- Node.js 20+
- A [Spotify Developer](https://developer.spotify.com/dashboard) application
- A [Turso](https://turso.tech) database (free tier works fine)

### Spotify App Configuration

1. Go to the Spotify Developer Dashboard and create an app
2. Set the redirect URI to `http://localhost:3000/api/auth/callback` (and your production URL)
3. Copy the Client ID and Client Secret

### Turso Database Setup

1. Install the Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Sign up: `turso auth signup`
3. Create a database: `turso db create phds-mp3`
4. Get the URL: `turso db show phds-mp3 --url`
5. Create a token: `turso db tokens create phds-mp3`

For local development, you can skip Turso — the app falls back to a local SQLite file automatically.

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Netlify

1. Push this repo to GitHub
2. In Netlify, create a new site from the repo
3. Set these environment variables in the Netlify dashboard:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REDIRECT_URI` (set to `https://your-site.netlify.app/api/auth/callback`)
   - `NEXT_PUBLIC_BASE_URL` (set to `https://your-site.netlify.app`)
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Update the Spotify Developer Dashboard redirect URI to match your Netlify URL
5. Deploy!

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Turso** (hosted SQLite via libSQL)
- **Spotify Web API**
- **Netlify** (deployment)

# Phds MP3 — Collaborative Spotify Playlist Creator

A web app where you create a playlist prompt, share it with friends, collect Spotify song submissions, and generate a real Spotify playlist.

## How It Works

1. **Create a Prompt** — Give your playlist a title and a creative theme (e.g., "Songs that make you feel like you're in a movie")
2. **Share the Link** — Send the unique prompt URL to friends
3. **Collect Songs** — Friends submit Spotify track links that match the prompt
4. **Generate Playlist** — When ready, close submissions and authorize with Spotify to create the playlist
5. **Listen Together** — Everyone can enjoy the playlist on Spotify, with an embedded player right on the page

## Setup

### Prerequisites

- Node.js 18+
- A [Spotify Developer](https://developer.spotify.com/dashboard) application

### Spotify App Configuration

1. Go to the Spotify Developer Dashboard and create an app
2. Set the redirect URI to `http://localhost:3000/api/auth/callback`
3. Copy the Client ID and Client Secret

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Spotify credentials:

```bash
cp .env.example .env.local
```

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **SQLite** (via better-sqlite3)
- **Spotify Web API**

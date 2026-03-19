import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phds MP3 — Collaborative Playlist Creator",
  description:
    "Create a playlist prompt, share it with friends, and generate a Spotify playlist from everyone's submissions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        <header className="border-b border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-green-400 hover:text-green-300 transition">
              🎵 Phds MP3
            </a>
            <a
              href="/create"
              className="bg-green-500 hover:bg-green-400 text-gray-950 font-semibold px-4 py-2 rounded-full text-sm transition"
            >
              + New Prompt
            </a>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

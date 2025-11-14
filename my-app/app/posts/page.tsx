"use client";

import { useEffect, useState } from "react";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    try {
      const res = await fetch(`/api/posts?page=1&limit=20`);
      const json = await res.json();

      if (res.ok) {
        setPosts(json.posts);
      }
    } catch (err) {
      console.error("Feed load error:", err);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  if (loading) return <div className="p-6">Loading feed...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Latest Posts</h1>

      {posts.length === 0 && (
        <div className="text-gray-500">No posts yet.</div>
      )}

      {posts.map((p) => (
        <a
          key={p.id}
          href={`/posts/${p.id}`}
          className="block p-4 border rounded-lg hover:bg-gray-50 transition"
        >
          {/* USER HEADER */}
          <div className="flex items-center gap-2">
            <img
              src={p.profiles?.avatar_url || "/default-avatar.png"}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-medium">@{p.profiles?.username}</span>
          </div>

          {/* CONTENT */}
          <p className="mt-2">{p.content}</p>

          {p.image_url && (
            <img src={p.image_url} className="mt-2 rounded" />
          )}

          {/* STATS */}
          <div className="text-sm text-gray-500 mt-2">
            ❤️ {p.like_count || 0} · 💬 {p.comment_count || 0}
          </div>
        </a>
      ))}
    </div>
  );
}

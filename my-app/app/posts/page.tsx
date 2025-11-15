"use client";

import { useEffect, useState } from "react";
import { Home, PlusSquare, Bell } from 'lucide-react';

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    try {
      const res = await fetch(`/api/posts?page=1&=20`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-2 border-gray-700 rounded-full border-t-blue-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="max-w-2xl px-4 py-3 mx-auto">
          <h1 className="text-xl font-semibold text-white">Latest Posts</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl px-4 py-6 pb-32 mx-auto space-y-1">
        {posts.length === 0 && (
          <div className="p-4 text-gray-500">No posts yet.</div>
        )}

        {posts.map((p) => (
          <a
            key={p.id}
            href={`/posts/${p.id}`}
            className="block p-4 border border-gray-800 transition-colors hover:bg-gray-900"
          >
            {/* USER HEADER */}
            <div className="flex items-center gap-2">
              <img
                src={p.profiles?.avatar_url || "/default-avatar.png"}
                alt={`${p.profiles?.username}'s avatar`}
                className="w-10 h-10 rounded-full object-cover border border-gray-700"
              />
              <div className="flex-1">
                <span className="font-medium text-white">@{p.profiles?.username}</span>
                <p className="text-xs text-gray-500">Posted by {p.profiles?.username}</p>
              </div>
            </div>

            {/* CONTENT */}
            <p className="mt-3 text-gray-100">{p.content}</p>

            {p.image_url && (
              <img src={p.image_url || "/placeholder.svg"} alt="Post content" className="mt-3 rounded-lg max-h-80 object-cover w-full" />
            )}

            {/* STATS */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>❤️ {p.like_count || 0}</span>
              <span>💬 {p.comment_count || 0}</span>
            </div>
          </a>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-1">
            <div className="flex flex-col items-center justify-center py-3 bg-gray-900">
              <Home className="w-6 h-6 mb-1 text-blue-500" />
              <span className="text-xs font-medium text-blue-500">Feed</span>
            </div>
            <a
              href="/posts/new"
              className="flex flex-col items-center justify-center py-3 transition-colors hover:bg-gray-900"
            >
              <PlusSquare className="w-6 h-6 mb-1 text-gray-300" />
              <span className="text-xs font-medium text-gray-300">New Post</span>
            </a>
            <a
              href="/notifications"
              className="flex flex-col items-center justify-center py-3 transition-colors hover:bg-gray-900"
            >
              <Bell className="w-6 h-6 mb-1 text-gray-300" />
              <span className="text-xs font-medium text-gray-300">Notifications</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

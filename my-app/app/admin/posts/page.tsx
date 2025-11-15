"use client";

import { useEffect, useState } from "react";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    const token = localStorage.getItem("access_token");
    const res = await fetch("/api/admin/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    if (res.ok) {
      setPosts(json.posts);
      setLoading(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

    const token = localStorage.getItem("access_token");

    await fetch(`/api/admin/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    loadPosts();
  }

  useEffect(() => {
    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-zinc-500">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-semibold text-white">Posts</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage and moderate user posts
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-8 text-sm">
        <div>
          <span className="text-zinc-500">Total Posts:</span>{" "}
          <span className="font-medium text-white">{posts.length}</span>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-px bg-zinc-800">
        {posts.length === 0 ? (
          <div className="bg-black px-6 py-12 text-center">
            <p className="text-sm text-zinc-500">No posts found</p>
          </div>
        ) : (
          posts.map((p) => (
            <div
              key={p.id}
              className="bg-black px-6 py-5 hover:bg-zinc-900 transition-colors"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-400">
                    {p.profiles.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      @{p.profiles.username}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(p.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deletePost(p.id)}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Delete
                </button>
              </div>

              {/* Post Content */}
              <div className="mt-4 space-y-3">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {p.content}
                </p>

                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt="Post image"
                    className="w-full max-w-md rounded-lg border border-zinc-800"
                  />
                )}
              </div>

              {/* Post Meta */}
              <div className="mt-4 flex items-center gap-6 text-xs text-zinc-500">
                <span>❤️ {p.like_count || 0} likes</span>
                <span>💬 {p.comment_count || 0} comments</span>
                <span className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-400">
                  {p.category}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
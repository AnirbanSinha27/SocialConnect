"use client";

import { useEffect, useState } from "react";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);

  async function loadPosts() {
    const token = localStorage.getItem("access_token");
    const res = await fetch("/api/admin/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    if (res.ok) setPosts(json.posts);
  }

  async function deletePost(id: string) {
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📝 Manage Posts</h1>

      {posts.length === 0 && <p>No posts found.</p>}

      {posts.map((p) => (
        <div key={p.id} className="p-4 bg-white mb-4 rounded shadow">
          <div className="flex justify-between">
            <p className="font-semibold">@{p.profiles.username}</p>
            <button
              className="px-3 py-1 bg-red-600 text-white rounded"
              onClick={() => deletePost(p.id)}
            >
              Delete
            </button>
          </div>

          <p className="mt-2">{p.content}</p>

          {p.image_url && (
            <img src={p.image_url} className="mt-2 rounded" />
          )}
        </div>
      ))}
    </div>
  );
}

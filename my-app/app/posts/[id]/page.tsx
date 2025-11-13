"use client";

import { useEffect, useState } from "react";

export default function PostPage({ params }: any) {
  const { id } = params;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadPost() {
    const res = await fetch(`/api/posts/${id}`);
    const json = await res.json();
    if (res.ok) setPost(json.post);
    setLoading(false);
  }

  useEffect(() => {
    loadPost();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!post) return <div>Not found</div>;

  return (
    <div className="max-w-xl p-6 mx-auto">
      <div className="flex items-center gap-2">
        <img
          src={post.profiles.avatar_url || "/default-avatar.png"}
          className="object-cover w-10 h-10 border rounded-full"
        />
        <span className="font-medium">@{post.profiles.username}</span>
      </div>

      <p className="mt-4">{post.content}</p>

      {post.image_url && (
        <img
          src={post.image_url}
          className="w-full mt-4 rounded"
        />
      )}

      <p className="mt-2 text-sm text-gray-500">
        {new Date(post.created_at).toLocaleString()}
      </p>
    </div>
  );
}

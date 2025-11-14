"use client";

import { useEffect, useState, use } from "react";

export default function PostPage({ params }: any) {
  const { id } = use(params as Promise<{ id: string }>);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  async function loadPost() {
    // 1. Fetch post
    const res = await fetch(`/api/posts/${id}`);
    const json = await res.json();
    if (res.ok) setPost(json.post);
  
    // 2. Check if user is logged in and if they liked the post
    const token = localStorage.getItem("access_token");
    
    if (token) {
      const likeRes = await fetch(`/api/posts/${id}/like`, {  // Changed from /like/status
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const likeJson = await likeRes.json();
      setLiked(likeJson.liked);
    }
  
    setLoading(false);
  }

  async function toggleLike() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please log in first");
      return;
    }

    if (liked) {
      await fetch(`/api/posts/${id}/like`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLiked(false);
      setPost((p: any) => ({ ...p, like_count: p.like_count - 1 }));
    } else {
      await fetch(`/api/posts/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLiked(true);
      setPost((p: any) => ({ ...p, like_count: p.like_count + 1 }));
    }
  }

  useEffect(() => {
    loadPost();
  }, [id]);

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
        <img src={post.image_url} className="w-full mt-4 rounded" />
      )}

      <p className="mt-2 text-sm text-gray-500">
        {new Date(post.created_at).toLocaleString()}
      </p>

      <button
        onClick={toggleLike}
        className={`mt-4 px-4 py-2 rounded text-white ${
          liked ? "bg-red-500" : "bg-gray-300"
        }`}
      >
        {liked ? "❤️ Liked" : "🤍 Like"} ({post.like_count})
      </button>
    </div>
  );
}
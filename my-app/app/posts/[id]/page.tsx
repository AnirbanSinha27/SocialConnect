"use client";

import { useEffect, useState, use } from "react";

export default function PostPage({ params }: any) {
  // Required for Next.js 14+ dynamic routes
  const { id } = use(params as Promise<{ id: string }>);

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");

  // -------------------------------------
  // LOAD POST
  // -------------------------------------
  async function loadPost() {
    const res = await fetch(`/api/posts/${id}`);
    const json = await res.json();
    if (res.ok) setPost(json.post);

    // Like status
    const token = localStorage.getItem("access_token");
    if (token) {
      const likeRes = await fetch(`/api/posts/${id}/like`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (likeRes.ok) {
        const likeJson = await likeRes.json();
        setLiked(likeJson.liked);
      }
    }
  }

  // -------------------------------------
  // LOAD COMMENTS
  // -------------------------------------
  async function loadComments() {
    const res = await fetch(`/api/posts/${id}/comments`);
    const json = await res.json();
    if (res.ok) setComments(json.comments);
  }

  async function addComment() {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Login first!");

    if (!commentText.trim()) return;

    const res = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: commentText }),
    });

    if (!res.ok) return alert("Failed to comment");

    setCommentText("");
    loadComments();

    setPost((p: any) => ({
      ...p,
      comment_count: (p.comment_count || 0) + 1,
    }));
  }

  async function deleteComment(commentId: number) {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Login first!");

    const res = await fetch(`/api/posts/${id}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return alert("Failed to delete comment");

    loadComments();

    setPost((p: any) => ({
      ...p,
      comment_count: Math.max((p.comment_count || 1) - 1, 0),
    }));
  }

  // -------------------------------------
  // LIKE / UNLIKE
  // -------------------------------------
  async function toggleLike() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please log in first");
      return;
    }

    if (liked) {
      await fetch(`/api/posts/${id}/like`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setLiked(false);
      setPost((p: any) => ({ ...p, like_count: p.like_count - 1 }));
    } else {
      await fetch(`/api/posts/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      setLiked(true);
      setPost((p: any) => ({ ...p, like_count: p.like_count + 1 }));
    }
  }

  // -------------------------------------
  // INITIAL LOAD
  // -------------------------------------
  useEffect(() => {
    loadPost();
    loadComments();
    setLoading(false);
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!post) return <div>Not found</div>;

  return (
    <div className="max-w-xl p-6 mx-auto space-y-6">
      
      {/* Post Header */}
      <div className="flex items-center gap-2">
        <img
          src={post.profiles?.avatar_url || "/default-avatar.png"}
          className="object-cover w-10 h-10 border rounded-full"
        />
        <span className="font-medium">@{post.profiles?.username}</span>
      </div>

      {/* Post Content */}
      <p className="mt-2">{post.content}</p>

      {post.image_url && (
        <img src={post.image_url} className="w-full mt-3 rounded" />
      )}

      <p className="text-sm text-gray-500">
        {new Date(post.created_at).toLocaleString()}
      </p>

      {/* Like Button */}
      <button
        onClick={toggleLike}
        className={`px-4 py-2 rounded text-white ${
          liked ? "bg-red-500" : "bg-gray-300"
        }`}
      >
        {liked ? "❤️ Liked" : "🤍 Like"} ({post.like_count})
      </button>

      {/* COMMENTS SECTION */}
      <div className="border-t pt-4">
        <h2 className="text-lg font-bold mb-3">Comments ({post.comment_count})</h2>

        {/* Comment Input */}
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />

        <button
          onClick={addComment}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
        >
          Comment
        </button>

        {/* All Comments */}
        <div className="mt-4 space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="p-3 border rounded relative">
              <div className="flex items-center gap-2">
                <img
                  src={c.profiles.avatar_url || "/default-avatar.png"}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium">@{c.profiles.username}</span>
              </div>

              <p className="mt-1">{c.content}</p>

              {/* Delete button (only if author matches) */}
              <button
                onClick={() => deleteComment(c.id)}
                className="absolute right-2 top-2 text-xs text-red-500"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

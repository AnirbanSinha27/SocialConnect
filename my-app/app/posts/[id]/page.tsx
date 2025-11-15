"use client";

import { useEffect, useState, use } from "react";

export default function PostPage({ params }: any) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  async function saveEdit() {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Login required");

    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: editContent }),
    });

    if (!res.ok) return alert("Failed to update");
    setIsEditing(false);
    setPost((p: any) => ({ ...p, content: editContent }));
  }

  async function deletePost() {
    if (!confirm("Delete this post permanently?")) return;

    const token = localStorage.getItem("access_token");

    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return alert("Failed to delete");

    alert("Deleted!");
    window.location.href = "/posts";
  }

  const { id } = use(params as Promise<{ id: string }>);

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");

  async function loadPost() {
    const res = await fetch(`/api/posts/${id}`);
    const json = await res.json();

    if (res.ok) setPost(json.post);

    const token = localStorage.getItem("access_token");
    if (token) {
      const likeRes = await fetch(`/api/posts/${id}/like`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (likeRes.ok) {
        const likeJson = await likeRes.json();
        setLiked(likeJson.liked);
      }
      const meRes = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (meRes.ok) {
        const meJson = await meRes.json();
        setCurrentUserId(meJson.user.id);
      }
    }
  }

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

  useEffect(() => {
    loadPost();
    loadComments();
    setLoading(false);
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
      </div>
    );

  if (!post)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Post not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto">
        <div className="bg-black border-x border-zinc-800">
          <div className="bg-black border-b border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={post.profiles?.avatar_url || "/default-avatar.png"}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-800"
                    alt="Profile"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">
                    {post.profiles?.username || "Anonymous"}
                  </span>
                  <span className="text-zinc-500 text-xs">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {currentUserId === post.author && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditContent(post.content);
                      setIsEditing(true);
                    }}
                    className="p-2 hover:bg-zinc-900 rounded-full transition-colors duration-200"
                    title="Edit post"
                  >
                    <svg
                      className="w-5 h-5 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={deletePost}
                    className="p-2 hover:bg-zinc-900 rounded-full transition-colors duration-200"
                    title="Delete post"
                  >
                    <svg
                      className="w-5 h-5 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {post.image_url && (
            <div className="w-full aspect-square bg-zinc-900">
              <img
                src={post.image_url}
                className="w-full h-full object-cover"
                alt="Post content"
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={toggleLike}
                className="group transition-transform duration-200 hover:scale-110 active:scale-95"
              >
                <svg
                  className={`w-7 h-7 transition-colors duration-200 ${
                    liked
                      ? "fill-red-500 text-red-500"
                      : "text-white group-hover:text-zinc-400"
                  }`}
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={liked ? 0 : 2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                  />
                </svg>
              </button>

              <button className="group transition-transform duration-200 hover:scale-110 active:scale-95">
                <svg
                  className="w-7 h-7 text-white group-hover:text-zinc-400 transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
            </div>

            {post.like_count > 0 && (
              <p className="text-white font-semibold text-sm mb-2">
                {post.like_count.toLocaleString()}{" "}
                {post.like_count === 1 ? "like" : "likes"}
              </p>
            )}

            {isEditing ? (
              <div className="mb-4">
                <textarea
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent resize-none"
                  rows={3}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Edit your caption..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={saveEdit}
                    className="flex-1 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-2">
                <span className="text-white font-semibold text-sm mr-2">
                  {post.profiles?.username || "Anonymous"}
                </span>
                <span className="text-white text-sm leading-relaxed">
                  {post.content}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0"></div>
                <input
                  type="text"
                  className="flex-1 bg-transparent text-white text-sm placeholder-zinc-500 focus:outline-none"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addComment();
                    }
                  }}
                />
                {commentText.trim() && (
                  <button
                    onClick={addComment}
                    className="text-blue-500 font-semibold text-sm hover:text-blue-400 transition-colors duration-200"
                  >
                    Post
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3 group">
                    <img
                      src={c.profiles.avatar_url || "/default-avatar.png"}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-800 shrink-0"
                      alt="Commenter"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="text-white font-semibold text-sm mr-2">
                            {c.profiles.username}
                          </span>
                          <span className="text-white text-sm leading-relaxed">
                            {c.content}
                          </span>
                        </div>
                        {currentUserId === c.user_id && (
                          <button
                            onClick={() => deleteComment(c.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1"
                          >
                            <svg
                              className="w-4 h-4 text-zinc-500 hover:text-zinc-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-zinc-500 text-xs">
                          {new Date(c.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
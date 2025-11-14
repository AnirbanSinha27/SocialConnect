"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewPostPage() {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function uploadImage(file: File) {
    setUploading(true);

    const ext = file.name.split(".").pop();
    const filePath = `${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(filePath, file);

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath);

    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  async function createPost() {
    if (!content.trim()) {
      alert("Content is required");
      return;
    }
  
    setCreating(true);
  
    const token = localStorage.getItem("access_token");
  
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,   // 🔥 REQUIRED
      },
      body: JSON.stringify({
        content,
        image_url: imageUrl,
        category,
      }),
    });
  
    const json = await res.json();
    setCreating(false);
  
    if (!res.ok) {
      alert(json.error);
      return;
    }
  
    alert("Post created!");
    window.location.href = `/posts/${json.post.id}`;
  }
  

  return (
    <div className="max-w-xl p-6 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Create Post</h1>

      <textarea
        className="w-full p-2 border rounded"
        maxLength={280}
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <select
        className="w-full p-2 mt-2 border rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="general">General</option>
        <option value="announcement">Announcement</option>
        <option value="question">Question</option>
      </select>

      <div className="mt-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => uploadImage(e.target.files?.[0] as File)}
        />
        {uploading && <p>Uploading...</p>}
        {imageUrl && (
          <img src={imageUrl} className="w-full mt-2 rounded" />
        )}
      </div>

      <button
        onClick={createPost}
        disabled={creating}
        className="w-full p-2 mt-4 text-white bg-blue-600 rounded"
      >
        {creating ? "Posting..." : "Post"}
      </button>
    </div>
  );
}

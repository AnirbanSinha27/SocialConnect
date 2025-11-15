"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Home, PlusSquare, Bell, Upload, X } from "lucide-react";

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
        Authorization: `Bearer ${token}`,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const removeImage = () => {
    setImageUrl(null);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex items-center justify-between max-w-2xl px-4 py-3 mx-auto">
          <button
            onClick={() => window.history.back()}
            className="text-sm font-semibold text-gray-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <h1 className="text-xl font-semibold text-white">New Post</h1>
          <button
            onClick={createPost}
            disabled={creating || !content.trim()}
            className="px-4 py-1.5 text-sm font-semibold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-900 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {creating ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl px-4 py-6 pb-32 mx-auto">
        {/* Image Upload Area */}
        <div className="mb-6">
          {!imageUrl ? (
            <label className="relative flex flex-col items-center justify-center w-full border-2 border-gray-800 border-dashed rounded-lg cursor-pointer h-96 hover:border-gray-700 bg-gray-900/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-gray-600" />
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-full overflow-hidden rounded-lg">
              <img
                src={imageUrl}
                alt="Post preview"
                className="object-cover w-full rounded-lg max-h-96"
              />
              <button
                onClick={removeImage}
                className="absolute p-2 transition-colors bg-black rounded-full top-3 right-3 bg-opacity-70 hover:bg-opacity-90"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
          
          {uploading && (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-gray-700 rounded-full border-t-blue-500 animate-spin"></div>
              <span className="ml-3 text-sm text-gray-400">Uploading image...</span>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Caption
          </label>
          <textarea
            className="w-full px-4 py-3 text-sm text-white transition-colors bg-gray-900 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
            placeholder="Write a caption..."
            rows={4}
            maxLength={280}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {content.length}/280 characters
            </p>
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Category
          </label>
          <select
            className="w-full px-4 py-3 text-sm text-white transition-colors bg-gray-900 border border-gray-700 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="general">General</option>
            <option value="announcement">Announcement</option>
            <option value="question">Question</option>
          </select>
        </div>

        {/* Post Requirements */}
        <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
          <p className="mb-2 text-sm font-medium text-gray-300">Post Requirements</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className={content.trim() ? "text-green-500" : ""}>
              • Caption is required
            </li>
            <li className="text-gray-500">
              • Image is optional
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-1">
            <a
              href="/posts"
              className="flex flex-col items-center justify-center py-3 transition-colors hover:bg-gray-900"
            >
              <Home className="w-6 h-6 mb-1 text-gray-300" />
              <span className="text-xs font-medium text-gray-300">Feed</span>
            </a>
            <div className="flex flex-col items-center justify-center py-3 bg-gray-900">
              <PlusSquare className="w-6 h-6 mb-1 text-blue-500" />
              <span className="text-xs font-medium text-blue-500">New Post</span>
            </div>
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

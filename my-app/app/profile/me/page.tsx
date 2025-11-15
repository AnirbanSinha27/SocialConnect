"use client";

import { useEffect, useState } from "react";
import AvatarUpload from "@/app/components/AvatarUpload";
import { Home, PlusSquare, Bell } from "lucide-react";

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Fetch current user data
  async function loadProfile() {
    const token = localStorage.getItem("access_token");

    const res = await fetch("/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      setProfile(data.user);
    } else {
      alert("Not logged in");
      window.location.href = "/auth/login";
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
  
    const token = localStorage.getItem("access_token");
  
    const res = await fetch("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(profile),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });
  
    const data = await res.json();
    setSaving(false);
  
    if (!res.ok) {
      alert(data.error);
      return;
    }
  
    alert("Profile updated!");
  }

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
        <div className="flex items-center justify-between max-w-2xl px-4 py-3 mx-auto">
          <h1 className="text-xl font-semibold text-white">Edit Profile</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer px-4 py-1.5 text-sm font-semibold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Done"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl px-4 py-8 pb-32 mx-auto">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-8 mb-8 border-b border-gray-800">
          <div className="relative">
            <img
              src={profile?.avatar_url || "/default-avatar.png"}
              alt="avatar"
              className="object-cover w-24 h-24 border-2 border-gray-700 rounded-full"
            />
          </div>
          <div className="flex-1">
            <h2 className="mb-1 text-lg font-semibold text-white">{profile?.username || "Username"}</h2>
            <AvatarUpload
              onUpload={(url: any) => setProfile({ ...profile, avatar_url: url })}
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              className="w-full px-4 py-3 text-sm text-white transition-colors bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
              placeholder="username"
              value={profile?.username ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, username: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                First Name
              </label>
              <input
                className="w-full px-4 py-3 text-sm text-white transition-colors bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                placeholder="First name"
                value={profile?.first_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Last Name
              </label>
              <input
                className="w-full px-4 py-3 text-sm text-white transition-colors bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                placeholder="Last name"
                value={profile?.last_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Bio
            </label>
            <textarea
              className="w-full px-4 py-3 text-sm text-white transition-colors bg-gray-900 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={160}
              value={profile?.bio || ""}
              onChange={(e) =>
                setProfile({ ...profile, bio: e.target.value })
              }
            />
            <p className="mt-1 text-xs text-right text-gray-400">
              {profile?.bio?.length || 0}/160
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Website
            </label>
            <input
              className="w-full px-4 py-3 text-sm text-white transition-colors bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
              placeholder="https://yourwebsite.com"
              value={profile?.website || ""}
              onChange={(e) =>
                setProfile({ ...profile, website: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Location
            </label>
            <input
              className="w-full px-4 py-3 text-sm text-white transition-colors bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
              placeholder="City, Country"
              value={profile?.location || ""}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
            />
          </div>
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

"use client";

import { useEffect, useState } from "react";
import AvatarUpload from "@/app/components/AvatarUpload";

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
    

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl p-6 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Edit Profile</h1>

      {/* Avatar Upload */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={profile?.avatar_url || "/default-avatar.png"}
          alt="avatar"
          className="object-cover w-20 h-20 border rounded-full"
        />

        <AvatarUpload
          onUpload={(url:any) => setProfile({ ...profile, avatar_url: url })}
        />
      </div>

      <div className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Username"
          value={profile?.username ?? ""}
          onChange={(e) =>
            setProfile({ ...profile, username: e.target.value })
          }
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="First name"
          value={profile?.first_name || ""}
          onChange={(e) =>
            setProfile({ ...profile, first_name: e.target.value })
          }
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Last name"
          value={profile?.last_name || ""}
          onChange={(e) =>
            setProfile({ ...profile, last_name: e.target.value })
          }
        />

        <textarea
          className="w-full p-2 border rounded"
          placeholder="Bio (max 160 chars)"
          maxLength={160}
          value={profile?.bio || ""}
          onChange={(e) =>
            setProfile({ ...profile, bio: e.target.value })
          }
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Website"
          value={profile?.website || ""}
          onChange={(e) =>
            setProfile({ ...profile, website: e.target.value })
          }
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Location"
          value={profile?.location || ""}
          onChange={(e) =>
            setProfile({ ...profile, location: e.target.value })
          }
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full p-2 font-medium text-white bg-blue-600 rounded"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

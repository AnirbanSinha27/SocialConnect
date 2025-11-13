"use client";

import { useEffect, useState } from "react";

export default function UserProfilePage({ params }: any) {
  const { username } = params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  async function loadProfile() {
    const res = await fetch(`/api/users/profile/${username}`)
;
    const json = await res.json();

    if (!res.ok) {
      alert(json.error);
      return;
    }

    setData(json);

    // Check logged-in user
    const meRes = await fetch("/api/users/me");
    const meJson = await meRes.json();

    if (meRes.ok) {
      setCurrentUserId(meJson.user.id);

      // Check follow state
      const fRes = await fetch(`/api/users/${meJson.user.id}/following`);
      // optional later when implementing following list
    }

    setLoading(false);
  }

  async function toggleFollow() {
    if (!currentUserId) {
      alert("Login first");
      return;
    }

    if (isFollowing) {
      await fetch(`/api/users/${data.profile.id}/follow`, {
        method: "DELETE",
      });
      setIsFollowing(false);
    } else {
      await fetch(`/api/users/${data.profile.id}/follow`, {
        method: "POST",
      });
      setIsFollowing(true);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div>User not found</div>;

  const { profile, stats } = data;

  return (
    <div className="max-w-xl p-6 mx-auto">
      <div className="flex items-center gap-4">
        <img
          src={profile.avatar_url || "/default-avatar.png"}
          className="object-cover w-20 h-20 border rounded-full"
        />
        <div>
          <h1 className="text-xl font-bold">@{profile.username}</h1>
          <p className="text-gray-600">
            {profile.first_name} {profile.last_name}
          </p>
        </div>
      </div>

      <p className="mt-4 text-gray-800">{profile.bio}</p>

      <div className="flex gap-6 mt-4 text-sm">
        <span><b>{stats.followers}</b> Followers</span>
        <span><b>{stats.following}</b> Following</span>
      </div>

      {currentUserId && currentUserId !== profile.id && (
        <button
          onClick={toggleFollow}
          className={`mt-4 w-full p-2 rounded text-white 
            ${isFollowing ? "bg-red-500" : "bg-blue-600"}`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  );
}

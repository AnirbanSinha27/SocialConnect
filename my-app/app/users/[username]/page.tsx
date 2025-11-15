"use client";

import { useEffect, useState, use } from "react";

export default function UserProfilePage({ params }: any) {
  const { username } = use(params as Promise<{ username: string }>);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  async function loadProfile() {
    const res = await fetch(`/api/users/profile/${username}`);
    const json = await res.json();

    if (!res.ok) {
      alert(json.error);
      return;
    }

    setData(json);

    const token = localStorage.getItem("access_token");

    if (token) {
      const meRes = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const meJson = await meRes.json();

      if (meRes.ok && meJson.user) {
        setCurrentUserId(meJson.user.id);

        const followRes = await fetch(
          `/api/users/${json.profile.id}/followers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const followJson = await followRes.json();

        if (followRes.ok && followJson.followers) {
          const alreadyFollowing = followJson.followers.some(
            (f: any) => f.follower === meJson.user.id
          );
          setIsFollowing(alreadyFollowing);
        }
      }
    }

    setLoading(false);
  }

  async function toggleFollow() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Login first");
      return;
    }

    if (isFollowing) {
      await fetch(`/api/users/${data.profile.id}/follow`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsFollowing(false);
    } else {
      await fetch(`/api/users/${data.profile.id}/follow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsFollowing(true);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">User not found</p>
      </div>
    );

  const { profile, stats } = data;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto border-x border-zinc-800">
        <div className="border-b border-zinc-800 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {profile.username}
              </h1>
              {(profile.first_name || profile.last_name) && (
                <p className="text-zinc-500 text-sm">
                  {profile.first_name} {profile.last_name}
                </p>
              )}
            </div>

            {currentUserId && currentUserId !== profile.id && (
              <button
                onClick={toggleFollow}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  isFollowing
                    ? "bg-zinc-900 text-white border border-zinc-700 hover:border-zinc-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-8 mb-6">
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              className="w-32 h-32 rounded-full object-cover ring-2 ring-zinc-800"
              alt={profile.username}
            />
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-white text-2xl font-bold">
                  {stats?.posts || 0}
                </p>
                <span className="text-zinc-400 text-sm">Posts</span>
              </div>
              <div className="text-center">
                <p className="text-white text-2xl font-bold">
                  {stats?.followers || 0}
                </p>
                <span className="text-zinc-400 text-sm">Followers</span>
              </div>
              <div className="text-center">
                <p className="text-white text-2xl font-bold">
                  {stats?.following || 0}
                </p>
                <span className="text-zinc-400 text-sm">Following</span>
              </div>
            </div>
          </div>

          {profile.bio && (
            <p className="text-white leading-relaxed text-sm">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  async function loadStats() {
    const token = localStorage.getItem("access_token");
    const res = await fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (res.status === 403) {
      alert("Only admins can access this page");
      window.location.href = "/profile/me";
      return;
    }
    
    const json = await res.json();
    if (res.ok) setStats(json);
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-zinc-500">Loading stats...</div>
      </div>
    );
  }

  const statItems = [
    { label: "Total Users", value: stats.total_users, icon: "👤" },
    { label: "Total Posts", value: stats.total_posts, icon: "📝" },
    { label: "Total Comments", value: stats.total_comments, icon: "💬" },
    { label: "Total Likes", value: stats.total_likes, icon: "❤️" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Overview of Social Connect platform metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-px bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="bg-black px-6 py-8 hover:bg-zinc-900 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <span className="text-3xl opacity-50">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
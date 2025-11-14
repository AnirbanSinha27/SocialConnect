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
      window.location.href = "/profile/me"; // redirect to home
      return;
    }

    const json = await res.json();
    if (res.ok) setStats(json);
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div className="bg-gray-800">
      <h1 className="text-2xl font-bold mb-6">📊 Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-black rounded shadow">Users: {stats.total_users}</div>
        <div className="p-4 bg-black rounded shadow">Posts: {stats.total_posts}</div>
        <div className="p-4 bg-black rounded shadow">Comments: {stats.total_comments}</div>
        <div className="p-4 bg-black rounded shadow">Likes: {stats.total_likes}</div>
      </div>
    </div>
  );
}

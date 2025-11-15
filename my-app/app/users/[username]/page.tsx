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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-tr from-purple-500 to-pink-500 animate-spin" style={{
            background: 'conic-gradient(from 0deg, transparent, #a855f7, transparent)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)'
          }}></div>
          <p className="text-gray-600 font-medium">Loading stats...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: "Total Users", 
      value: stats.total_users, 
      icon: "👥", 
      gradient: "from-blue-500 to-cyan-500",
      lightBg: "from-blue-50 to-cyan-50"
    },
    { 
      label: "Total Posts", 
      value: stats.total_posts, 
      icon: "📸", 
      gradient: "from-purple-500 to-pink-500",
      lightBg: "from-purple-50 to-pink-50"
    },
    { 
      label: "Comments", 
      value: stats.total_comments, 
      icon: "💬", 
      gradient: "from-orange-500 to-red-500",
      lightBg: "from-orange-50 to-red-50"
    },
    { 
      label: "Total Likes", 
      value: stats.total_likes, 
      icon: "❤️", 
      gradient: "from-pink-500 to-rose-500",
      lightBg: "from-pink-50 to-rose-50"
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your social media platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
          >
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-linear-to-br ${stat.lightBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-linear-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className={`px-3 py-1 bg-linear-to-r ${stat.gradient} rounded-full text-white text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                  Active
                </div>
              </div>
              
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value.toLocaleString()}
              </p>
              
              {/* Trend Indicator */}
              <div className="mt-3 flex items-center gap-1 text-xs">
                <span className="text-green-600 font-semibold">↑ 12%</span>
                <span className="text-gray-400">vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-xl bg-linear-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors text-sm font-medium text-gray-700">
              Create New Post
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-linear-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors text-sm font-medium text-gray-700">
              Invite Users
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-linear-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-colors text-sm font-medium text-gray-700">
              View Reports
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-linear-to-br from-purple-400 to-pink-400 rounded-full shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500 mt-0.5">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
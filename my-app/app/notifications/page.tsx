"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Home, PlusSquare, Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function loadNotifications() {
    const token = localStorage.getItem("access_token");

    const res = await fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    if (res.ok) setNotifications(json.notifications);

    setLoading(false);
  }

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          // new notification row
          const newNotification = payload.new;

          // fetch actor details
          const { data: actor } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", newNotification.actor_id)
            .single();

          // merge actor details
          newNotification.actor = actor;

          // add to UI immediately
          setNotifications((prev) => [newNotification, ...prev]);

          // OPTIONAL: play a sound
          // new Audio("/notify.mp3").play();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-2 border-gray-700 rounded-full border-t-blue-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex items-center justify-between max-w-2xl px-4 py-3 mx-auto">
          <h1 className="text-xl font-semibold text-white">Notifications</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {notifications.length === 0 && (
          <div className="text-gray-500">No notifications yet.</div>
        )}

        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-4 border border-gray-800 rounded-lg bg-gray-900 hover:bg-gray-800/50 transition-colors flex gap-3"
            >
              <img
                src={n.actor?.avatar_url || "/default-avatar.png"}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />

              <div className="flex-1">
                <p className="font-medium text-white">@{n.actor?.username}</p>

                {/* Message based on type */}
                <p className="text-gray-400 mt-1">
                  {n.type === "like" && "liked your post"}
                  {n.type === "follow" && "started following you"}
                  {n.type === "comment" && "commented on your post"}
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

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
            <div className="flex flex-col items-center justify-center py-3 bg-gray-900">
              <Bell className="w-6 h-6 mb-1 text-blue-500" />
              <span className="text-xs font-medium text-blue-500">Notifications</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

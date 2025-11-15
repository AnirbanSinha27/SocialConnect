"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

  if (loading) return <div className="p-6">Loading notifications…</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {notifications.length === 0 && (
        <div className="text-gray-500">No notifications yet.</div>
      )}

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="p-4 border rounded-lg bg-white shadow-sm flex gap-3"
          >
            <img
              src={n.actor?.avatar_url || "/default-avatar.png"}
              className="w-10 h-10 rounded-full object-cover"
            />

            <div>
              <p className="font-medium">@{n.actor?.username}</p>

              {/* Message based on type */}
              <p className="text-gray-700 mt-1">
                {n.type === "like" && "liked your post ❤️"}
                {n.type === "follow" && "started following you 👤"}
                {n.type === "comment" && "commented on your post 💬"}
              </p>

              <p className="text-gray-400 text-sm mt-1">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

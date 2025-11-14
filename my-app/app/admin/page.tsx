"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    const token = localStorage.getItem("access_token");

    const res = await fetch("/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    console.log("Admin users:", json);

    if (res.ok) setUsers(json.users);

    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {users?.length === 0 ? (
        <p>No users yet.</p>
      ) : (
        <ul className="space-y-2">
          {users?.map((u: any) => (
            <li key={u.id} className="p-3 border rounded">
              {u.username} — {u.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

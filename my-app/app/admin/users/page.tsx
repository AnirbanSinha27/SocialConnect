"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<string | null>(null); // logged-in admin id

  async function loadCurrentAdmin() {
    const token = localStorage.getItem("access_token");

    const res = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    if (res.ok) setCurrentAdmin(json.user.id);
  }

  async function loadUsers() {
    const token = localStorage.getItem("access_token");
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    if (res.ok) setUsers(json.users);
  }

  async function deactivate(id: string) {
    const token = localStorage.getItem("access_token");

    await fetch(`/api/admin/users/${id}/deactivate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    loadUsers();
  }

  async function reactivate(id: string) {
    const token = localStorage.getItem("access_token");

    await fetch(`/api/admin/users/${id}/reactivate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    loadUsers();
  }

  useEffect(() => {
    loadCurrentAdmin();
    loadUsers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👤 Manage Users</h1>

      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Username</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">@{u.username}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2 capitalize">{u.role}</td>

              <td className="p-2">
                {/* Prevent admin from modifying themselves */}
                {u.id === currentAdmin ? (
                  <span className="text-gray-400 italic">Your account</span>
                ) : u.role === "deactivated" ? (
                  <button
                    onClick={() => reactivate(u.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Reactivate
                  </button>
                ) : (
                  <button
                    onClick={() => deactivate(u.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

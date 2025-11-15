"use client";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (res.ok) {
      setUsers(json.users);
      setLoading(false);
    }
  }

  async function deactivate(id: string) {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-zinc-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-8 text-sm">
        <div>
          <span className="text-zinc-500">Total Users:</span>{" "}
          <span className="font-medium text-white">{users.length}</span>
        </div>
        <div>
          <span className="text-zinc-500">Active:</span>{" "}
          <span className="font-medium text-white">
            {users.filter((u) => u.role !== "deactivated").length}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">Deactivated:</span>{" "}
          <span className="font-medium text-white">
            {users.filter((u) => u.role === "deactivated").length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="border-t border-zinc-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                Role
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-zinc-900 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400">
                      {u.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-white">
                      @{u.username}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">
                  {u.email}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-blue-500/10 text-blue-400"
                        : u.role === "deactivated"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {u.id === currentAdmin ? (
                    <span className="text-xs italic text-zinc-600">
                      Your account
                    </span>
                  ) : u.role === "deactivated" ? (
                    <button
                      onClick={() => reactivate(u.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/10 transition-colors"
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => deactivate(u.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
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

      {users.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-zinc-500">No users found</p>
        </div>
      )}
    </div>
  );
}
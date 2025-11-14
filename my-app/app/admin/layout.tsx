"use client";

import Link from "next/link";

export default function AdminLayout({ children }: any) {
  return (
    <div className="flex min-h-screen bg-gray-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1>

        <nav className="space-y-3">
          <Link href="/admin" className="block hover:text-blue-300">
            📊 Dashboard
          </Link>

          <Link href="/admin/users" className="block hover:text-blue-300">
            👤 Users
          </Link>

          <Link href="/admin/posts" className="block hover:text-blue-300">
            📝 Posts
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 bg-gray-100">{children}</main>
    </div>
  );
}

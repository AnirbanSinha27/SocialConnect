"use client";

import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert("Login successful!");
      window.location.href = "/profile/me"; // we will build this page next
    } else {
      alert(data.error || "Invalid credentials");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md p-6 space-y-4 border rounded-xl">
        <h2 className="text-2xl font-bold">Login</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <button
          disabled={loading}
          className="w-full p-2 font-medium text-white bg-blue-600 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <a href="/auth/register" className="text-blue-500 underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Mail, Lock, User, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleRegister(e: any) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    // 🔥 Split username into first & last name for backend
    const nameParts = form.username.trim().split(" ");
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    const payload = {
      email: form.email,
      password: form.password,
      username: form.username,
      first_name,
      last_name,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert("Registration successful!");

      // If Supabase email confirmation is ON, data.session = null
      if (data.session) {
        localStorage.setItem("access_token", data.session.access_token);
        localStorage.setItem("refresh_token", data.session.refresh_token);
      }

      window.location.href = "/auth/login";
      return;
    }

    alert(data.error || "Registration failed");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        
        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-3">

          {/* Username Input */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-800 border border-gray-700 rounded placeholder-gray-500 text-white focus:outline-none focus:border-gray-600 focus:bg-gray-800 transition-colors"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-800 border border-gray-700 rounded placeholder-gray-500 text-white focus:outline-none focus:border-gray-600 focus:bg-gray-800 transition-colors"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-800 border border-gray-700 rounded placeholder-gray-500 text-white focus:outline-none focus:border-gray-600 focus:bg-gray-800 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <span>hide</span> : <span>show</span>}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-800 border border-gray-700 rounded placeholder-gray-500 text-white focus:outline-none focus:border-gray-600 focus:bg-gray-800 transition-colors"
            />
          </div>

          {/* Register Button */}
          <button
            disabled={loading}
            className="w-full py-2.5 mt-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing up...</span>
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 p-4 text-center border border-gray-700 rounded bg-gray-800">
          <p className="text-sm text-gray-300">
            Already have an account?{" "}
            <a href="/auth/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Log in
            </a>
          </p>
        </div>

        <div className="text-center mt-6 text-xs text-gray-600 space-y-2">
          <p>With ❤️ from SocialConnect.</p>
        </div>
      </div>
    </div>
  );
}

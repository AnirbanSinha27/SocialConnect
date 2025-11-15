"use client";

import { useState } from "react";
import { Mail, Lock, Loader2 } from 'lucide-react';

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
      // Save tokens
      localStorage.setItem("access_token", data.session.access_token);
      localStorage.setItem("refresh_token", data.session.refresh_token);
    
      alert("Login successful!");
      window.location.href = "/profile/me";
    }
     else {
      alert(data.error || "Invalid credentials");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        
        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3">
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
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-800 border border-gray-700 rounded placeholder-gray-500 text-white focus:outline-none focus:border-gray-600 focus:bg-gray-800 transition-colors"
            />
          </div>

          {/* Login Button */}
          <button
            disabled={loading}
            className="w-full py-2.5 mt-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              "Log in"
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 p-4 text-center border border-gray-700 rounded bg-gray-800">
          <p className="text-sm text-gray-300">
            Don't have an account?{" "}
            <a href="/auth/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Sign up
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-600 space-y-2">
          <p>With ❤️ from SocialConnect.</p>
        </div>
      </div>
    </div>
  );
}

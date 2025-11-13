"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    first_name: "",
    last_name: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleRegister(e: any) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert("Registration successful!");
      window.location.href = "/auth/login";
    } else {
      alert(data.error || "Something went wrong");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form onSubmit={handleRegister} className="w-full max-w-md p-6 space-y-4 border rounded-xl">
        <h2 className="text-2xl font-bold">Create an account</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="username"
          type="text"
          placeholder="Username"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="first_name"
          type="text"
          placeholder="First Name"
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />

        <input
          name="last_name"
          type="text"
          placeholder="Last Name"
          className="w-full p-2 border rounded"
          onChange={handleChange}
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
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-500 underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}

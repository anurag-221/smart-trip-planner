"use client";

export default function TempLogin() {
  async function login() {
    await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "owner@gmail.com",
        name: "Trip Owner",
      }),
    });

    alert("Logged in (cookie set). Refresh now.");
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-emerald-600 rounded"
    >
      Temp Login
    </button>
  );
}
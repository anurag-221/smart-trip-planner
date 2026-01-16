"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function CreateTripPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isValid =
    name.trim().length > 0 
    // &&
    // startDate.length > 0 &&
    // endDate.length > 0;

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!isValid) return;

  try {
    await apiFetch("/trips", {
      method: "POST",
      body: JSON.stringify({
        name: name,
      }),
    });

    router.push("/trips");
  } catch (err) {
    console.error("Failed to create trip", err);
    alert("Failed to create trip");
  }
}

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">
            Create a Trip
          </h1>
          <p className="text-slate-400">
            Plan your journey and invite others to collaborate.
          </p>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Trip Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Trip Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Goa Vacation"
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Dates */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div> */}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={!isValid}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                isValid
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Create Trip
            </button>

            <button
              type="button"
              onClick={() => router.push("/trips")}
              className="text-slate-400 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
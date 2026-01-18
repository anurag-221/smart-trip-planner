"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { API_URLS, API_BASE } from "@/config/urls";

type Trip = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/trips")
      .then((data) => setTrips((data as Trip[]) || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Your Trips</h1>

        <Link
          href="/trips/create"
          className="px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-500 transition"
        >
          + Create Trip
        </Link>
      </header>

      {/* Loading */}
      {loading && (
        <div className="text-slate-400">Loading trips...</div>
      )}

      {/* Empty State */}
      {!loading && trips.length === 0 && (
        <EmptyState />
      )}

      {/* Trips List */}
      {!loading && trips.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </main>
  );
}

/* ---------- Components ---------- */

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-emerald-500 transition"
    >
      <h3 className="font-semibold text-lg">
        {trip.name}
      </h3>

      {(trip.startDate || trip.endDate) && (
        <p className="text-sm text-slate-400 mt-1">
          {trip.startDate} → {trip.endDate}
        </p>
      )}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 space-y-4">
      <div className="text-4xl">🧳</div>

      <h2 className="text-xl font-semibold">
        No trips yet
      </h2>

      <p className="text-slate-400 max-w-sm">
        Start planning your next adventure.
        Create a trip and collaborate with friends.
      </p>

      <Link
        href="/trips/create"
        className="mt-4 px-6 py-3 bg-emerald-600 rounded-lg font-medium hover:bg-emerald-500 transition"
      >
        Create Your First Trip
      </Link>
    </div>
  );
}
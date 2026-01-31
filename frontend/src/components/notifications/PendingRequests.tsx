"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/config/urls";
import { toast } from "sonner";

type PendingMember = {
  userId: string;
  name: string;
  email: string;
  tripId: string;
  tripName: string;
};

export default function PendingRequests() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        // First, fetch all trips owned by the user
        const tripsRes = await fetch(`${API_BASE}/trips`, {
          credentials: "include",
        });

        if (!tripsRes.ok) {
          const errData = await tripsRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch owned trips");
        }
        const ownedTrips: { id: string; name: string; ownerId: string }[] = await tripsRes.json();

        const requests: PendingMember[] = [];

        for (const trip of ownedTrips) {
          if (trip.ownerId === user.id) { // Only fetch for trips the user owns
            const pendingRes = await fetch(`${API_BASE}/trips/${trip.id}/members/pending`, {
              credentials: "include",
            });

            if (!pendingRes.ok) {
              const errData = await pendingRes.json().catch(() => ({}));
              console.error(`Failed to fetch pending members for trip ${trip.name}:`, errData.error);
              continue;
            }

            const pendingMembers: { userId: string; user: { id: string; name: string; email: string } }[] = await pendingRes.json();

            pendingMembers.forEach((member) => {
              requests.push({
                userId: member.user.id,
                name: member.user.name,
                email: member.user.email,
                tripId: trip.id,
                tripName: trip.name,
              });
            });
          }
        }
        setPendingRequests(requests);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [user]);

  const handleApprove = async (tripId: string, userId: string) => {
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}/members/${userId}/approve`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to approve member");
      }

      toast.success("Member approved!");
      setPendingRequests((prev) =>
        prev.filter((req) => !(req.tripId === tripId && req.userId === userId))
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // For now, no reject functionality is implemented on backend
  const handleReject = async (tripId: string, userId: string) => {
    toast.info("Reject functionality not yet implemented.");
  };

  if (loading) {
    return <div className="p-4 text-white">Loading pending requests...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Pending Join Requests</h3>
      {pendingRequests.length === 0 ? (
        <p className="text-gray-300">No pending requests.</p>
      ) : (
        <ul className="space-y-4">
          {pendingRequests.map((request) => (
            <li key={`${request.tripId}-${request.userId}`} className="flex items-center justify-between bg-[var(--bg-dark)] p-3 rounded-md">
              <div>
                <p className="text-white font-medium">{request.name} wants to join <span className="font-bold">{request.tripName}</span></p>
                <p className="text-gray-400 text-sm">{request.email}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApprove(request.tripId, request.userId)}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request.tripId, request.userId)}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

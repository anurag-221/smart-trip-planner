"use client";

import { useEffect, useState, useRef } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import PendingRequests from "./PendingRequests";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/config/urls";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const { user } = useAuth();
  const prevPendingRequestsCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    prevPendingRequestsCountRef.current = pendingRequestsCount;
  }, [pendingRequestsCount]);

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!user) return;

      try {
        const tripsRes = await fetch(`${API_BASE}/trips`, {
          credentials: "include",
        });

        if (!tripsRes.ok) {
          console.error("Failed to fetch owned trips for notification count");
          return;
        }
        const ownedTrips: { id: string; name: string; ownerId: string }[] = await tripsRes.json();

        let count = 0;
        for (const trip of ownedTrips) {
          if (trip.ownerId === user.id) {
            const pendingRes = await fetch(`${API_BASE}/trips/${trip.id}/members/pending`, {
              credentials: "include",
            });

            if (!pendingRes.ok) {
              console.error(`Failed to fetch pending members for trip ${trip.name} for count`);
              continue;
            }
            const pendingMembers = await pendingRes.json();
            count += pendingMembers.length;
          }
        }

        if (count > prevPendingRequestsCountRef.current && audioRef.current) {
          audioRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
        setPendingRequestsCount(count);
      } catch (err) {
        console.error("Error fetching pending requests count:", err);
      }
    };

    fetchPendingCount();

    const interval = setInterval(fetchPendingCount, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [user]);

  const togglePopover = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <audio ref={audioRef} id="notification-sound" src="/sounds/notification.mp3" preload="auto" />
      <button onClick={togglePopover} className="relative p-1 rounded-full text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {pendingRequestsCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {pendingRequestsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-md shadow-lg bg-[var(--bg-glass)] ring-1 ring-black ring-opacity-5 z-50">
          <PendingRequests />
        </div>
      )}
    </div>
  );
}
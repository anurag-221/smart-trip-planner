"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import PendingRequests from "./PendingRequests";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/config/urls";

const REFRESH_DEBOUNCE_MS = 2000; // Min interval between dashboard fetches

export interface NotificationItem {
  id: string;
  userId: string;
  tripId?: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PendingRequestItem {
  tripId: string;
  tripName: string;
  userId: string;
  name: string;
  email: string;
}

export interface Dashboard {
  unreadCount: number;
  notifications: NotificationItem[];
  pendingRequests: PendingRequestItem[];
  pendingCount: number;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevTotalRef = useRef(0);
  const lastFetchRef = useRef(0);
  const audioUnlockedRef = useRef(false);

  const fetchDashboard = useCallback(async (force = false) => {
    if (!user) return;
    const now = Date.now();
    if (!force && now - lastFetchRef.current < REFRESH_DEBOUNCE_MS) return;
    lastFetchRef.current = now;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications/dashboard`, { credentials: "include" });
      if (!res.ok) return;
      const data: Dashboard = await res.json();
      setDashboard(data);
      if ("setAppBadge" in navigator) {
        const total = data.unreadCount + data.pendingCount;
        if (total > 0) (navigator as any).setAppBadge(total);
        else (navigator as any).clearAppBadge?.();
      }
    } catch (err) {
      console.error("Error fetching notification dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchDashboard(true);
  }, [user, fetchDashboard]);

  const playNotificationSound = useCallback(() => {
    try {
      const play = (el: HTMLAudioElement | Audio) => {
        (el as HTMLAudioElement).currentTime = 0;
        el.volume = 1;
        el.play().catch(() => {});
      };
      if (audioRef.current) {
        play(audioRef.current);
      } else {
        play(new Audio("/sounds/notification.mp3"));
      }
      if ("vibrate" in navigator) navigator.vibrate(200);
    } catch {
      // ignore
    }
  }, []);

  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;
    audioUnlockedRef.current = true;
    if (audioRef.current) {
      const el = audioRef.current;
      el.volume = 0;
      el.play().then(() => {
        el.pause();
        el.volume = 1;
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!dashboard) return;
    const total = dashboard.unreadCount + dashboard.pendingCount;
    if (total > prevTotalRef.current) {
      playNotificationSound();
    }
    prevTotalRef.current = total;
  }, [dashboard?.unreadCount, dashboard?.pendingCount, playNotificationSound]);

  useEffect(() => {
    const onFocus = () => fetchDashboard(false);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchDashboard]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "UNREAD_COUNT_UPDATE") {
        setDashboard((prev) => prev ? { ...prev, unreadCount: event.data.payload } : null);
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, []);

  const onRefresh = useCallback(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  const togglePopover = () => {
    unlockAudio(); // Unlock audio on first click so notification sound can play later
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    fetchDashboard(false); // Refetch when opening (debounced)
  };

  const totalCount = dashboard ? dashboard.unreadCount + dashboard.pendingCount : 0;

  return (
    <div className="relative">
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" aria-hidden />
      <button
        onClick={togglePopover}
        className="relative p-1 rounded-full text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
        aria-label="View notifications"
      >
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[1.25rem] px-1.5 py-0.5 text-xs font-bold text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-md shadow-lg bg-[var(--bg-glass)] ring-1 ring-black ring-opacity-5 z-50">
          <PendingRequests
            dashboard={dashboard}
            loading={loading}
            onRefresh={onRefresh}
            onClearNotifications={async () => {
              if (!user) return;
              try {
                await fetch(`${API_BASE}/notifications/delete-read`, {
                  method: "POST",
                  credentials: "include",
                });
                onRefresh();
              } catch (err) {
                console.error("Error deleting read notifications:", err);
                onRefresh();
              }
            }}
            hasReadNotifications={Boolean(dashboard?.notifications.some(n => n.isRead))}
          />
        </div>
      )}
    </div>
  );
}

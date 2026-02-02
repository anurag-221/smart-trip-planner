"use client";

import { useState } from "react";
import { API_BASE } from "@/config/urls";
import { toast } from "sonner";
import type { Dashboard } from "./NotificationBell";

interface PendingRequestsProps {
  dashboard: Dashboard | null;
  loading: boolean;
  onRefresh: () => void;
  onClearNotifications?: () => void | Promise<void>;
  hasReadNotifications?: boolean;
}

const debounceMap = new Map<string, ReturnType<typeof setTimeout>>();
function debounce(key: string, fn: () => void, delay = 400) {
  if (debounceMap.has(key)) clearTimeout(debounceMap.get(key)!);
  debounceMap.set(key, setTimeout(() => {
    debounceMap.delete(key);
    fn();
  }, delay));
}

export default function PendingRequests({
  dashboard,
  loading,
  onRefresh,
  onClearNotifications,
  hasReadNotifications = false,
}: PendingRequestsProps) {
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});

  const notifications = dashboard?.notifications ?? [];
  const pendingRequests = dashboard?.pendingRequests ?? [];

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`${API_BASE}/notifications/${notificationId}/mark-as-read`, {
        method: "POST",
        credentials: "include",
      });
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleApprove = (tripId: string, userId: string) => {
    const key = `${tripId}-${userId}`;
    if (actionInProgress[key]) return;
    debounce(key, async () => {
      setActionInProgress((p) => ({ ...p, [key]: true }));
      try {
        const res = await fetch(
          `${API_BASE}/trips/${tripId}/members/${userId}/approve`,
          { method: "POST", credentials: "include" },
        );
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to approve");
        toast.success("Member approved!");
        onRefresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed");
        onRefresh();
      } finally {
        setActionInProgress((p) => {
          const c = { ...p };
          delete c[key];
          return c;
        });
      }
    });
  };

  const handleReject = (tripId: string, userId: string) => {
    if (!confirm("Reject this join request?")) return;
    const key = `${tripId}-${userId}`;
    if (actionInProgress[key]) return;
    debounce(key, async () => {
      setActionInProgress((p) => ({ ...p, [key]: true }));
      try {
        const res = await fetch(
          `${API_BASE}/trips/${tripId}/members/${userId}/decline`,
          { method: "POST", credentials: "include" },
        );
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to reject");
        toast.success("Request rejected");
        onRefresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed");
        onRefresh();
      } finally {
        setActionInProgress((p) => {
          const c = { ...p };
          delete c[key];
          return c;
        });
      }
    });
  };

  if (loading && !dashboard) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  const hasPending = pendingRequests.length > 0;
  const hasNotifications = notifications.length > 0;

  return (
    <div className="p-4 space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-white mb-2">Pending Join Requests</h3>
        {hasPending ? (
          <ul className="space-y-3">
            {pendingRequests.map((req) => (
              <li key={`${req.tripId}-${req.userId}`} className="bg-[var(--bg-dark)] p-3 rounded-md">
                <p className="text-white font-medium text-sm">
                  {req.name} wants to join <span className="font-bold">{req.tripName}</span>
                </p>
                <p className="text-gray-400 text-xs">{req.email}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    disabled={actionInProgress[`${req.tripId}-${req.userId}`]}
                    onClick={() => handleApprove(req.tripId, req.userId)}
                    className="text-xs font-bold py-1 px-2 rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    disabled={actionInProgress[`${req.tripId}-${req.userId}`]}
                    onClick={() => handleReject(req.tripId, req.userId)}
                    className="text-xs font-bold py-1 px-2 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No pending requests.</p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          {hasReadNotifications && onClearNotifications && (
            <button
              type="button"
              onClick={() => onClearNotifications()}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline shrink-0"
            >
              Clear all read
            </button>
          )}
        </div>
        {hasNotifications ? (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-3 rounded-md text-sm ${n.isRead ? "bg-[var(--bg-dark)]" : "bg-[var(--bg-light)]"}`}
              >
                <p className="text-white font-medium">{n.message}</p>
                <p className="text-gray-400 text-xs">{new Date(n.createdAt).toLocaleString()}</p>
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-xs text-blue-400 hover:underline mt-1"
                  >
                    Mark as Read
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No notifications.</p>
        )}
      </section>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Itinerary from "@/components/itinerary/Itinerary";
import Expenses from "@/components/expenses/Expenses";
import Chat from "@/components/chat/Chat";
import PageContainer from "@/components/layout/PageContainer";
import { useMe } from "@/hooks/useMe";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type Tab = "itinerary" | "expenses" | "chat";

type Trip = { id: string; name: string; ownerId: string };
type PendingMember = { id: string; user: { id: string; name: string; email: string } };

export default function TripDetailPage({
  params,
}: {
  params: { tripId: string };
}) {
  const { tripId } = params;
  const [activeTab, setActiveTab] = useState<Tab>("itinerary");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [shareLoading, setShareLoading] = useState(false);
  const me = useMe();
  const isOwner = Boolean(trip && me && trip.ownerId === me.user.id);

  useEffect(() => {
    apiFetch<Trip>(`/trips/${tripId}`)
      .then(setTrip)
      .catch(() => setTrip(null));
  }, [tripId]);

  useEffect(() => {
    if (!isOwner) return;
    apiFetch<PendingMember[]>(`/trips/${tripId}/members/pending`)
      .then(setPendingMembers)
      .catch(() => setPendingMembers([]));
  }, [tripId, isOwner]);

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const { inviteUrl } = await apiFetch<{ inviteUrl: string }>(`/trips/${tripId}/invite`);
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied. Anyone with the link can request to join.");
    } catch {
      toast.error("Could not get invite link");
    } finally {
      setShareLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await apiFetch(`/trips/${tripId}/members/${userId}/approve`, { method: "POST" });
      setPendingMembers((prev) => prev.filter((m) => m.user.id !== userId));
      toast.success("Member approved");
    } catch {
      toast.error("Could not approve");
    }
  };

  return (
    <PageContainer className=" bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800">
        <div className="p-4 flex items-center gap-4">
          <Link
            href="/trips"
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </Link>

          <div className="flex-1">
            <h1 className="font-semibold">
              {trip?.name ?? "Trip"}
            </h1>
            <p className="text-xs text-slate-400">
              Collaborative Trip
            </p>
          </div>

          <button
            onClick={handleShare}
            disabled={shareLoading}
            className="text-sm px-3 py-1 border border-slate-700 rounded hover:bg-slate-900 disabled:opacity-50"
          >
            {shareLoading ? "…" : "Invite"}
          </button>
        </div>

        {/* Tabs */}
        <nav className="flex">
          <TabButton
            label="Itinerary"
            active={activeTab === "itinerary"}
            onClick={() => setActiveTab("itinerary")}
          />
          <TabButton
            label="Expenses"
            active={activeTab === "expenses"}
            onClick={() => setActiveTab("expenses")}
          />
          <TabButton
            label="Chat"
            active={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
          />
        </nav>
      </header>

      {/* Pending members (owner only) */}
      {isOwner && pendingMembers.length > 0 && (
        <div className="px-4 pb-3 border-b border-slate-800">
          <p className="text-xs text-amber-400 mb-2">Join requests — approve to add to chat</p>
          <ul className="space-y-2">
            {pendingMembers.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-300">{m.user.name ?? m.user.email}</span>
                <button
                  onClick={() => handleApprove(m.user.id)}
                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  Approve
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content */}
      <section className="p-6">
        {activeTab === "itinerary" && (
          <Itinerary />
        )}

        {activeTab === "expenses" && (
          <Expenses />
        )}

        {activeTab === "chat" && (
          <Chat tripId={tripId} />
        )}
      </section>
    </PageContainer>
  );
}

/* ---------- UI Components ---------- */

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${
        active
          ? "border-emerald-500 text-emerald-400"
          : "border-transparent text-slate-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function Placeholder({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="border border-dashed border-slate-800 rounded-xl p-10 text-center space-y-2">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>
      <p className="text-slate-400 text-sm">
        {desc}
      </p>
    </div>
  );
}
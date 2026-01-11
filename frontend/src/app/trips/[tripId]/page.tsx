"use client";

import { useState } from "react";
import Link from "next/link";
import Itinerary from "@/components/itinerary/Itinerary";
import Expenses from "@/components/expenses/Expenses";
import Chat from "@/components/chat/Chat";


type Tab = "itinerary" | "expenses" | "chat";

export default function TripDetailPage({
  params,
}: {
  params: { tripId: string };
}) {
  const { tripId } = params;
  const [activeTab, setActiveTab] = useState<Tab>("itinerary");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
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
              Trip #{tripId}
            </h1>
            <p className="text-xs text-slate-400">
              Collaborative Trip
            </p>
          </div>

          <button className="text-sm px-3 py-1 border border-slate-700 rounded hover:bg-slate-900">
            Share
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
    </main>
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
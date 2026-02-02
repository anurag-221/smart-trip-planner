"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ProfileModal from "@/components/profile/ProfileModal";

export default function BottomNav() {
  const path = usePathname();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur border-t border-white/10 md:hidden">
      <div className="flex justify-around py-3">
        <Link href="/trips" className={path === "/trips" ? "text-white" : "text-gray-400"}>
          Trips
        </Link>
        <Link href="/trips/create" className="text-gray-400">
          +
        </Link>
        <button onClick={() => setShowProfile(true)} className="text-gray-400">
          Profile
        </button>
      </div>
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </nav>
  );
}
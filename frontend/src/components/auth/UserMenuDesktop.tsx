"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Avatar from "@/components/common/Avatar";
import { useAuth } from "@/context/AuthContext";
import ProfileModal from "@/components/profile/ProfileModal";

export default function UserMenuDesktop() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}>
        <Avatar name={user.name} image={user.image} />
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-3 w-56
            rounded-xl
            bg-[var(--bg-glass)]
            backdrop-blur-xl
            border border-[var(--border-soft)]
            shadow-xl
            overflow-hidden
          "
        >
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-white">
              {user.name}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {user.email}
            </p>
          </div>

          <div className="border-t border-[var(--border-soft)]" />
          
          <button
             onClick={() => {
                 setOpen(false);
                 setShowProfile(true);
             }}
             className="w-full text-left px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-white/5"
          >
             Edit Profile
          </button>

          <div className="border-t border-[var(--border-soft)]" />

          <button
            onClick={logout}
            className="
              w-full text-left px-4 py-2
              text-sm text-red-400
              hover:bg-red-500/10
            "
          >
            Logout
          </button>
        </div>
      )}
      
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Avatar from "@/components/common/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProfileModal from "@/components/profile/ProfileModal";

export default function UserMenuMobile() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) return null;

  return (
    <>
      <button onClick={() => setOpen(true)}>
        <Avatar name={user.name} image={user.image} />
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* sheet */}
          <div
            className="
              relative
              w-full sm:w-96
              bg-[#0a0a0a]/90
              backdrop-blur-2xl
              border-t sm:border border-white/10
              rounded-t-3xl sm:rounded-3xl
              p-6
              shadow-2xl
              animate-in slide-in-from-bottom duration-300
            "
          >
            {/* Handle bar for mobile feel */}
            <div className="mx-auto w-12 h-1.5 bg-white/20 rounded-full mb-6 sm:hidden" />

            <button 
              className="flex items-center gap-4 mb-4 w-full text-left hover:bg-white/5 active:bg-white/10 p-3 -mx-3 rounded-xl transition-all group cursor-pointer"
              onClick={() => {
                setOpen(false);
                setShowProfile(true);
              }}
            >
              <div className="relative">
                <Avatar name={user.name} image={user.image} className="w-12 h-12 border-2 border-emerald-500/50" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{user.name}</p>
                <p className="text-sm text-zinc-400">
                  {user.email}
                </p>
              </div>
              <div className="text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </button>

            <div className="h-px w-full bg-white/10 my-2" />

            <button
              onClick={logout}
              className="
                w-full text-left py-3.5 px-2 
                text-red-400 font-medium 
                hover:text-red-300 hover:bg-red-500/10 
                rounded-xl transition-all
                flex items-center gap-3
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Log out
            </button>
          </div>
        </div>,
        document.body
      )}
      
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}
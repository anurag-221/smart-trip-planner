"use client";

import { useState } from "react";
import Link from "next/link";
import Avatar from "@/components/common/Avatar";
import { useAuth } from "@/context/AuthContext";

export default function UserMenuMobile() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <button onClick={() => setOpen(true)}>
        <Avatar name={user.name} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* sheet */}
          <div
            className="
              absolute bottom-0 left-0 right-0
              rounded-t-2xl
              bg-[var(--bg-glass)]
              backdrop-blur-xl
              border-t border-[var(--border-soft)]
              p-6
            "
          >
            <div className="flex items-center gap-3 mb-6">
              <Avatar name={user.name} />
              <div>
                <p className="font-medium text-white">{user.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full text-left py-3 text-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
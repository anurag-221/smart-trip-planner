"use client";

import { useState } from "react";
import ProfileModal from "@/components/profile/ProfileModal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, MapIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, MapIcon as MapIconSolid, UserCircleIcon as UserCircleIconSolid } from "@heroicons/react/24/solid";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon, activeIcon: HomeIconSolid },
  { href: "/trips", label: "Trips", icon: MapIcon, activeIcon: MapIconSolid },
  { href: "/profile", label: "Profile", icon: UserCircleIcon, activeIcon: UserCircleIconSolid },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-slate-900
        border-t border-slate-800
        md:hidden
        pb-[var(--safe-bottom)]
      "
    >
      <ul className="flex justify-around items-center h-[64px]">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = active ? item.activeIcon : item.icon;
          
          return (
            <li key={item.href} className="flex-1">
              {item.href === "/profile" ? (
                <button
                  onClick={() => setShowProfile(true)}
                  className={`
                    flex flex-col items-center justify-center h-full w-full
                    ${active ? "text-emerald-500" : "text-slate-400 hover:text-slate-200"}
                    transition-colors
                  `}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    flex flex-col items-center justify-center h-full w-full
                    ${active ? "text-emerald-500" : "text-slate-400 hover:text-slate-200"}
                    transition-colors
                  `}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </nav>
  );
}
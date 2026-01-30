"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/trips", label: "Trips", icon: "🧳" },
  { href: "/trips/create", label: "Add", icon: "➕" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-[var(--bg-glass)]
        backdrop-blur-xl
        border-t border-[var(--border-soft)]
        md:hidden
        pb-[var(--safe-bottom)]
      "
    >
      <ul className="flex justify-around items-center h-[72px]">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex flex-col items-center text-xs
                  ${active ? "text-white" : "text-[var(--text-muted)]"}
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import content from "@/content/site.json";
import { useAuth } from "@/context/AuthContext";
import GoogleLoginButton from "@/components/common/GoogleLoginBtn";
import UserMenuDesktop from "../auth/UserMenuDesktop";
import UserMenuMobile from "../auth/UserMenuMobile";
import NavbarSkeleton from "./NavbarSkelton";
import NotificationBell from "../notifications/NotificationBell";

export default function Navbar() {
  const { nav } = content;
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="
            mt-4 rounded-2xl
            bg-[var(--bg-glass)]
            backdrop-blur-xl
            border border-[var(--border-soft)]
            shadow-lg
          "
        >
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <Link
              href={nav.logo.href}
              className="text-lg font-bold tracking-wide text-white"
            >
              {nav.logo.text}
              {/* <Image src={nav.logo.image} alt={nav.logo.text} width={24} height={24}/> */}
            </Link>

           {/* Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
                <NavbarSkeleton />
              ) : user ? (
                <>
                  <NotificationBell />
                  <UserMenuDesktop/>
                </>
              ) : (
                <GoogleLoginButton />
              )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center space-x-4">
            {loading ? (
                <NavbarSkeleton />
              ) : user ? (
                <>
                  <NotificationBell />
                  <UserMenuMobile/>
                </>
              ) : (
                <GoogleLoginButton />
              )}
          </div>
        </div>
        </div>
      </div>
    </header>
  );
}
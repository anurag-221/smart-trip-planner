"use client";

import { useState } from "react";
import Link from "next/link";
import content from "@/content/site.json";
import Image from "next/image";

export default function Navbar() {
  const { nav } = content;
  const [open, setOpen] = useState(false);

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
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {nav.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-[var(--text-muted)] hover:text-white transition"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth */}
            <div className="hidden md:block">
              <Link
                href={nav.auth.login.href}
                className="
                  px-5 py-2 rounded-lg text-sm font-medium
                  bg-white text-black
                  hover:bg-slate-200 transition flex items-center justify-center gap-3
        w-full max-w-sm
        border border-slate-300
        
                "
              >
                <Image
                  src="/images/google-logo.svg"
                  alt="Google"
                  width={18}
                  height={18}
                  priority
                />
                <span>{nav.auth.login.label}</span>
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-white"
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>

          {/* Mobile menu */}
          {open && (
            <div className="md:hidden border-t border-[var(--border-soft)]">
              <nav className="flex flex-col px-6 py-4 gap-4">
                {nav.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm text-[var(--text-muted)] hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  href={nav.auth.login.href}
                  className="
                    mt-2 text-center px-4 py-2 rounded-lg
                    bg-white text-black font-medium
                  "
                >
                  <Image
                    src="/images/google-logo.svg"
                    alt="Google"
                    width={18}
                    height={18}
                    priority
                  />
                  <span>{nav.auth.login.label}</span>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
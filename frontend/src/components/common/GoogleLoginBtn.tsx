"use client";

import Link from "next/link";
import Image from "next/image";

export default function GoogleLoginButton() {
  return (
    <Link
      href="http://localhost:5000/api/auth/google"
      className="
        flex items-center justify-center gap-3
        w-full max-w-sm
        bg-white text-slate-800
        border border-slate-300
        rounded-lg
        px-4 py-3
        font-medium
        shadow-sm
        hover:bg-slate-50
        active:scale-[0.98]
        transition
      "
    >
      <Image
        src="/google-logo.svg"
        alt="Google"
        width={18}
        height={18}
        priority
      />
      <span>Continue with Google</span>
    </Link>
  );
}
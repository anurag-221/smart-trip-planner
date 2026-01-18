"use client";

import Link from "next/link";
import Image from "next/image";
import { API_URLS, API_BASE } from "@/config/urls";

const GoogleLoginButton = () => {
  return (
    <Link
      href={API_BASE + API_URLS.GOOGLE_AUTH}
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
      <span>Login</span>
    </Link>
  );
};

export default GoogleLoginButton;
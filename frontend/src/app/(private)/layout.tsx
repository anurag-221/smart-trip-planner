"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import SwipeBack from "@/components/mobile/SwipeBack";
import BottomNav from "@/components/mobile/BottomNav";
import PageTransition from "@/components/ui/PageTransition";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem("redirectAfterLogin", pathname);

      toast.error("Please login to continue", {
        id: "auth-required", // prevents duplicates
      });

      router.replace("/");
    }
  }, [loading, user, pathname, router]);

  if (loading) return null;

  return (
    <>
      <SwipeBack />
      <PageTransition>{children}</PageTransition>
      <BottomNav />
    </>
  );
}

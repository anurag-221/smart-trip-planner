"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { API_BASE } from "@/config/urls";
import PageContainer from "@/components/layout/PageContainer";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      sessionStorage.setItem(
        "redirectAfterLogin",
        `/invite/${token}`
      );
      toast.info("Login to join the trip");
      router.replace("/");
      return;
    }

    fetch(`${API_BASE}/api/trips/join/${token}`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        toast.success("Join request sent");
        router.replace("/trips");
      })
      .catch(() => {
        toast.error("Invalid or expired invite");
        router.replace("/");
      });
  }, [user, loading, token, router]);

  return (
    <PageContainer className="flex items-center justify-center text-white">
      Processing invite…
    </PageContainer>
  );
}
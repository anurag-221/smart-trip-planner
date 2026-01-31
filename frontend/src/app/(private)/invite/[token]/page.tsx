"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { API_BASE } from "@/config/urls";
import PageContainer from "@/components/layout/PageContainer";

type JoinResponse = {
  tripId: string;
  status: "joined" | "pending_approval" | "already_joined";
};

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait for auth loading
    if (!token) {
      toast.error("Invalid invite link");
      router.replace("/");
      return;
    }

    if (!user) {
      sessionStorage.setItem("redirectAfterLogin", `/invite/${token}`);
      toast.info("Sign in to join the trip");
      router.replace("/");
      return;
    }

    async function joinTrip() {
      try {
        const res = await fetch(`${API_BASE}/trips/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Request failed");
        }

        const data: JoinResponse = await res.json();

        if (data.status === "joined" || data.status === "already_joined") {
          toast.success("You’re in! Opening the trip.");
          router.replace(`/trips/${data.tripId}`);
        } else {
          toast.success("Join request sent. The trip owner will approve you shortly.");
          router.replace("/trips");
        }
      } catch (error) {
        toast.error("Invalid or expired invite link");
        router.replace("/");
      }
    }

    joinTrip();
  }, [user, loading, token, router]);

  return (
    <PageContainer className="flex items-center justify-center text-white">
      Processing invite…
    </PageContainer>
  );
}
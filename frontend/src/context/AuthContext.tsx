"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { API_URLS, API_BASE } from "@/config/urls";
import { toast } from "sonner";
import { requestNotificationPermission } from "@/utils/notifications"

type User = {
  id: string;
  email: string;
  name: string;
  image?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const authCheckedRef = useRef(false);

  // ✅ LOGOUT (backend + frontend)
  const logout = async () => {
    try {
      await fetch(`${API_BASE}${API_URLS.LOGOUT_ME}`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      localStorage.setItem("logout", Date.now().toString()); // multi-tab sync
      toast.success("Logged out");
      router.replace("/");
    }
  };

  // ✅ AUTH CHECK (on refresh / initial load)
 useEffect(() => {
  if (authCheckedRef.current) return;
  authCheckedRef.current = true;

  fetch(`${API_BASE}${API_URLS.AUTH_ME}`, {
    credentials: "include",
  })
    .then(async (res) => {
      if (res.status === 401) throw new Error("Unauthorized");
      return res.json();
    })
    .then((data) => {
      setUser(data.user);
      requestNotificationPermission();
    })
    .catch(() => {
      setUser(null);
    })
    .finally(() => {
      setLoading(false);
    });
}, []);


  // ✅ MULTI-TAB LOGOUT (PWA safe)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "logout") {
        setUser(null);
        router.replace("/");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [router]);

  useEffect(() => {
  if (!loading && user) {
    const redirect = sessionStorage.getItem("redirectAfterLogin");
    if (redirect) {
      sessionStorage.removeItem("redirectAfterLogin");
      router.replace(redirect);
    }
  }
}, [user, loading, router]);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
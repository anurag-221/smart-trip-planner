import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type Me = {
    user: {
        id: string;
        name: string;
    }
};

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    apiFetch<Me>("/auth/me")
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  return me;
}
import { create } from "zustand";

type AuthState = {
  token: string | null;
  setToken: (t: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,

  setToken: (t) => {
    localStorage.setItem("token", t);
    set({ token: t });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },
}));
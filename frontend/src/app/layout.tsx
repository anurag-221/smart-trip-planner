import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import {AuthProvider} from "@/context/AuthContext";
import ToastProvider from "@/components/providers/ToastProvider";
import PWARegister from "./pwa";
import BottomNav from "@/components/navbar/BottomNav";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <BottomNav />
        <ToastProvider />
        <PWARegister />
        </AuthProvider>
      </body>
    </html>
  );
}
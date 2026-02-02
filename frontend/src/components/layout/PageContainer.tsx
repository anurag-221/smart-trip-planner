// src/components/layout/PageContainer.tsx
"use client";

import { ReactNode } from "react";

export default function PageContainer({
  children,
  className = "",
  fullWidth = false,
}: {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <main
      className={`
        min-h-screen
        ${fullWidth ? "" : "pt-[calc(var(--navbar-height)+var(--safe-top))] px-4 sm:px-6"}
        md:pb-0
        pb-[calc(80px+var(--safe-bottom))] /* space for bottom nav */
        ${className}
      `}
    >
      {children}
    </main>
  );
}
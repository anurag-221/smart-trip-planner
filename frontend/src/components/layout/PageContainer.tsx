// src/components/layout/PageContainer.tsx
"use client";

import { ReactNode } from "react";

export default function PageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`
        min-h-screen
        pt-[calc(var(--navbar-height)+var(--safe-top))]
        pb-[calc(80px+var(--safe-bottom))] /* space for bottom nav */
        px-4 sm:px-6
        ${className}
      `}
    >
      {children}
    </main>
  );
}
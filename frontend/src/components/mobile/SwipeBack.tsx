"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SwipeBack() {
  const router = useRouter();

  useEffect(() => {
    let startX = 0;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;

      // swipe from left edge
      if (startX < 30 && diff > 80) {
        router.back();
      }
    };

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [router]);

  return null;
}
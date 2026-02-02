"use client";

import { useEffect, useRef, useState } from "react";
import HeroSlide from "./HeroSlide";
import content from "@/content/site.json";

const AUTO_DELAY = 5000;
const SWIPE_THRESHOLD = 60; // px

export default function HeroSlider() {
  const slides = content.hero.slides;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const startXRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- AUTO SLIDE ---------------- */
  useEffect(() => {
    if (paused) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_DELAY);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, slides.length]);

  /* ---------------- SWIPE HANDLERS ---------------- */
  function onTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX;
    setPaused(true);
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startXRef.current === null) return;

    const diff =
      e.changedTouches[0].clientX - startXRef.current;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        // swipe right
        setIndex((i) =>
          i === 0 ? slides.length - 1 : i - 1
        );
      } else {
        // swipe left
        setIndex((i) => (i + 1) % slides.length);
      }
    }

    startXRef.current = null;
    setPaused(false);
  }

  /* ---------------- DOT CLICK ---------------- */
  function goTo(i: number) {
    setIndex(i);
  }

  return (
    <section
      className="relative h-screen overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* SLIDES */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 relative">
             {/* Gradient Overlay for Text Readability */}
             <div className="absolute inset-0 bg-black/40 z-10" />
            <HeroSlide slide={slide} />
          </div>
        ))}
      </div>

      {/* DOTS */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`
              h-2 rounded-full transition-all duration-300
              ${i === index ? "bg-emerald-500 w-6" : "bg-white/50 w-2 hover:bg-white"}
            `}
          />
        ))}
      </div>
    </section>
  );
}
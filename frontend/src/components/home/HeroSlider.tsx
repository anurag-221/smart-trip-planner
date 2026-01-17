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
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* SLIDES */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full flex-shrink-0">
            <HeroSlide slide={slide} />
          </div>
        ))}
      </div>

      {/* DOTS */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`
              h-2 w-2 rounded-full transition-all
              ${i === index ? "bg-white w-5" : "bg-white/40"}
            `}
          />
        ))}
      </div>
    </section>
  );
}
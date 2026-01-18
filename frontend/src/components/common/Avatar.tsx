"use client";

export default function Avatar({ name }: { name: string }) {
  const initial = name?.[0]?.toUpperCase() || "?";

  return (
    <div
      className="
        w-9 h-9 rounded-full
        bg-emerald-600
        flex items-center justify-center
        text-white font-semibold
        select-none
      "
    >
      {initial}
    </div>
  );
}
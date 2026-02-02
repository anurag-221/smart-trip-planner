"use client";

export default function Avatar({ name, image, className }: { name: string; image?: string | null; className?: string }) {
  const initial = name?.[0]?.toUpperCase() || "?";

  if (image) {
    return (
      <img 
        src={image} 
        alt={name} 
        className={`w-9 h-9 rounded-full object-cover border border-white/10 ${className || ""}`}
      />
    );
  }

  return (
    <div
      className={`
        w-9 h-9 rounded-full
        bg-emerald-600
        flex items-center justify-center
        text-white font-semibold
        select-none
        border border-white/10
        ${className || ""}
      `}
    >
      {initial}
    </div>
  );
}
import Link from "next/link";

type Slide = {
  image: string;
  alt: string;
  title: string;
  highlight: string;
  subtitle: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
};

export default function HeroSlide({ slide }: { slide: Slide }) {
  return (
    <div className="relative h-[100svh] w-full flex items-center justify-center">
      {/* Background image */}
      <img
        src={slide.image}
        alt={slide.alt}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-center px-6">
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
          {slide.title}{" "}
          <span className="text-[var(--text-muted)]">
            {slide.highlight}
          </span>
        </h1>

        <p className="mt-6 text-lg text-[var(--text-muted)]">
          {slide.subtitle}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={slide.primaryCta.href}
            className="
              px-8 py-3 rounded-xl font-semibold
              bg-[var(--text-muted)]
              text-black
              hover:opacity-90 transition
            "
          >
            {slide.primaryCta.label}
          </Link>

          <Link
            href={slide.secondaryCta.href}
            className="
              px-8 py-3 rounded-xl font-semibold
              border border-white/30
              hover:bg-white/10 transition
            "
          >
            {slide.secondaryCta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
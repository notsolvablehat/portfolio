"use client";

import { scrollToTarget, useLenis } from "@/components/providers/SmoothScroll";

export default function ScrollCue({ target }: { target: string }) {
  const lenis = useLenis();
  return (
    <button
      type="button"
      aria-label="Scroll to work"
      onClick={() => scrollToTarget(lenis.current, target)}
      className="hero-cue hero-chrome group absolute right-[max(16px,3.25vw)] bottom-[max(16px,1.5vw)] z-50 flex size-[clamp(60px,6.9vw,140px)] items-center justify-center overflow-hidden rounded-full bg-accent text-white transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] hover:scale-105"
    >
      {/* arrow slides out bottom-right, a twin slides in from top-left */}
      <span className="relative size-[34%]">
        {[0, 1].map((i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="square"
            className={
              i === 0
                ? "absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:translate-x-[180%] group-hover:translate-y-[180%]"
                : "absolute inset-0 -translate-x-[180%] -translate-y-[180%] transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:translate-0"
            }
          >
            <path d="M5 5l14 14M19 8v11H8" />
          </svg>
        ))}
      </span>
    </button>
  );
}

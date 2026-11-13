"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type MouseEvent } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const RING_TEXT = "ALL PROJECTS • SEE EVERYTHING • ";

/**
 * Round CTA with orbiting pixel text. On click, an accent circle floods the
 * screen from the button (like the hero swap) and the next page opens under it;
 * /projects then drains the flood back out (see <FloodIn>).
 */
export default function AllProjectsButton({ className }: { className?: string }) {
  const router = useRouter();
  const coreRef = useRef<HTMLSpanElement>(null);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    const r = coreRef.current!.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const flood = document.createElement("div");
    flood.setAttribute("data-flood", "");
    Object.assign(flood.style, {
      position: "fixed",
      inset: "0",
      zIndex: "100",
      background: "var(--accent)",
      clipPath: `circle(${r.width / 2}px at ${x}px ${y}px)`,
    });
    document.body.appendChild(flood);
    router.prefetch("/projects");
    gsap.to(flood, {
      clipPath: `circle(${reach + 10}px at ${x}px ${y}px)`,
      duration: 0.7,
      ease: "power3.in",
      onComplete: () => router.push("/projects"),
    });
  };

  return (
    <Link
      href="/projects"
      onClick={onClick}
      className={cn("group relative grid size-[clamp(200px,20vw,340px)] place-items-center", className)}
    >
      <svg viewBox="0 0 200 200" aria-hidden className="absolute inset-0 size-full animate-[spin_22s_linear_infinite] group-hover:animate-[spin_8s_linear_infinite]">
        <defs>
          <path id="cta-ring" d="M100,100 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0" />
        </defs>
        <text className="fill-ink font-pixel text-[11.5px]">
          <textPath href="#cta-ring" textLength={538} lengthAdjust="spacing">
            {RING_TEXT.repeat(2)}
          </textPath>
        </text>
      </svg>
      <span
        ref={coreRef}
        className="relative grid size-[62%] place-items-center rounded-full bg-accent text-white transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-110"
      >
        <span className="flex flex-col items-center gap-1 font-display text-[clamp(16px,1.5vw,26px)] leading-none">
          VIEW ALL
          <svg viewBox="0 0 24 24" className="size-[1.1em] transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 19L19 5M8 5h11v11" />
          </svg>
        </span>
      </span>
    </Link>
  );
}

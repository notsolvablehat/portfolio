"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Icon from "@/components/ui/Icon";

/**
 * Red "VIEW ↗" circle that follows the mouse over project mockups (.work-media).
 * Rendered outside #work on purpose: #work is pinned with a transform, which
 * would make a `position: fixed` child position relative to it, not the viewport.
 */
export default function ViewCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cursor = ref.current!;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0 });
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    let shown = false;

    const show = (on: boolean) => {
      if (on === shown) return;
      shown = on;
      gsap.to(cursor, { scale: on ? 1 : 0, duration: 0.25, ease: on ? "back.out(2)" : "power2.out", overwrite: "auto" });
    };
    const move = (e: PointerEvent) => {
      if (!shown) gsap.set(cursor, { x: e.clientX, y: e.clientY }); // appear right under the pointer
      xTo(e.clientX);
      yTo(e.clientY);
      show(!!(e.target as Element | null)?.closest?.(".work-media"));
    };
    // scrolling moves content under a still mouse
    const recheck = () => {
      const x = gsap.getProperty(cursor, "x") as number;
      const y = gsap.getProperty(cursor, "y") as number;
      if (shown) show(!!document.elementFromPoint(x, y)?.closest(".work-media"));
    };
    const leave = () => show(false);

    document.addEventListener("pointermove", move);
    window.addEventListener("scroll", recheck, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", recheck);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  });

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ transform: "translate(-50%, -50%) scale(0)" }} // hidden until JS takes over
      className="pointer-events-none fixed top-0 left-0 z-30 flex size-24 items-center justify-center rounded-full bg-accent font-pixel text-[12px] tracking-[0.12em] text-white"
    >
      VIEW <Icon name="arrow_outward" />
    </div>
  );
}

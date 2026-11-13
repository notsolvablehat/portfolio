"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<RefObject<Lenis | null>>({ current: null });

/** Ref to the page's Lenis instance (null when reduced motion is on). */
export const useLenis = () => useContext(LenisContext);

/** Document scroll position for a target. Elements can override it with
 *  `data-scroll-at` (e.g. #work, which sits under the pinned hero transition). */
function targetY(el: HTMLElement) {
  if (el.dataset.scrollAt) return Number(el.dataset.scrollAt);
  return el.getBoundingClientRect().top + window.scrollY;
}

/** Scroll to a selector, via Lenis when available. Scroll-driven
 *  transitions (like the hero → work eye zoom) play on the way. */
export function scrollToTarget(lenis: Lenis | null, target: string) {
  const el = document.querySelector<HTMLElement>(target);
  if (!el) return;
  const y = target === "#top" ? 0 : targetY(el);
  if (lenis) {
    lenis.start();
    const distance = Math.abs(y - window.scrollY) / window.innerHeight;
    lenis.scrollTo(y, { duration: Math.min(2.4, 1.2 + distance * 0.5), easing: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2) });
  } else {
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

/** Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}

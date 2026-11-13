"use client";

import { useEffect } from "react";
import gsap from "gsap";

/** Drains the accent flood left by <AllProjectsButton> (or plays a fresh one) on page entry. */
export default function FloodIn() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll("[data-flood]").forEach((n) => n.remove());
      return;
    }
    let flood = document.querySelector<HTMLElement>("[data-flood]");
    if (!flood) {
      flood = document.createElement("div");
      flood.setAttribute("data-flood", "");
      Object.assign(flood.style, { position: "fixed", inset: "0", zIndex: "100", background: "var(--accent)" });
      document.body.appendChild(flood);
    }
    const el = flood;
    window.scrollTo(0, 0);
    const reach = Math.hypot(innerWidth, innerHeight);
    const tween = gsap.fromTo(
      el,
      { clipPath: `circle(${reach}px at 50% 0%)` },
      { clipPath: "circle(0px at 50% 0%)", duration: 0.8, ease: "power3.inOut", delay: 0.05, onComplete: () => el.remove() },
    );
    return () => {
      tween.kill();
      el.remove();
    };
  }, []);
  return null;
}

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Eye position inside the portrait image (fractions of its box). */
const EYE = { x: 0.584, y: 0.365 };
/** How far the hero zooms into the eye by the end of the transition. */
const ZOOM = 2.8;

/**
 * Hero → Experience transition, driven by scroll.
 *
 * For one viewport of scroll both sections are pinned on top of each other:
 * the hero zooms into the eye while #experience is revealed through a circle that
 * grows out of the pupil, traced by an accent ring. Anything that scrolls to
 * #experience (scroll cue, menu) passes through it, so they all get the animation.
 */
export default function EyeZoom() {
  const ringRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pin = document.getElementById("hero-pin")!;
    const hero = document.getElementById("top")!;
    const next = document.getElementById("experience")!;
    const portrait = hero.querySelector<HTMLElement>(".hero-portrait-box")!;
    const chrome = hero.querySelectorAll<HTMLElement>(".hero-chrome");
    const ring = ringRef.current!;

    let eye = { x: 0, y: 0 };
    let maxR = 0;

    // Measure at scale 1 (the hero may be mid-zoom when a refresh happens).
    const measure = () => {
      const s = gsap.getProperty(hero, "scale") as number;
      gsap.set(hero, { scale: 1 });
      const h = hero.getBoundingClientRect();
      const p = portrait.getBoundingClientRect();
      eye = { x: p.left - h.left + p.width * EYE.x, y: p.top - h.top + p.height * EYE.y };
      maxR = Math.hypot(Math.max(eye.x, h.width - eye.x), Math.max(eye.y, h.height - eye.y)) + 8;
      gsap.set(hero, { scale: s, transformOrigin: `${eye.x}px ${eye.y}px` });
      // #experience sits directly on top of the hero while both are pinned.
      next.style.marginTop = `-${hero.offsetHeight}px`;
      next.dataset.scrollAt = String(hero.offsetHeight);
    };

    const zoomEase = gsap.parseEase("power2.in");
    const circleEase = gsap.parseEase("power3.in");

    const render = (p: number) => {
      gsap.set(hero, { scale: 1 + (ZOOM - 1) * zoomEase(p) });
      chrome.forEach((el) => (el.style.opacity = String(Math.max(0, 1 - p * 4))));
      const r = maxR * circleEase(p);
      next.style.clipPath = p >= 1 ? "none" : `circle(${r}px at ${eye.x}px ${eye.y}px)`;
      // After the pin, ScrollTrigger holds #experience in place with a translateY of
      // one hero-height. position: sticky ignores that transform, so children
      // subtract it from their sticky offset (see `--pin-shift` in Experience).
      next.style.setProperty("--pin-shift", p >= 1 ? `${hero.offsetHeight}px` : "0px");
      ring.style.opacity = p > 0.001 && p < 1 ? "1" : "0";
      ring.style.width = ring.style.height = `${r * 2}px`;
      ring.style.left = `${eye.x}px`;
      ring.style.top = `${eye.y}px`;
    };

    ScrollTrigger.addEventListener("refreshInit", measure);
    measure();

    const end = () => `+=${hero.offsetHeight}`;
    ScrollTrigger.create({ trigger: pin, start: "top top", end, pin: true, pinSpacing: false });
    const st = ScrollTrigger.create({
      trigger: next,
      start: "top top",
      end,
      pin: true,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });
    render(st.progress);
    // Triggers inside #experience were measured before this pin existed.
    ScrollTrigger.refresh();

    // Deep link (e.g. /#work from another page): the browser scrolled before the
    // pins existed, so jump again now that the layout is final — past the transition.
    const linked = location.hash.length > 1 ? document.querySelector<HTMLElement>(location.hash) : null;
    if (linked === next) window.scrollTo(0, hero.offsetHeight);
    else if (linked && linked !== hero) window.scrollTo(0, linked.getBoundingClientRect().top + window.scrollY);

    // Undo everything render() wrote — these writes happen in scroll callbacks,
    // outside the gsap context, so they aren't reverted automatically. Without
    // this, navigating away mid/after the zoom and back leaves the hero at 2.8×.
    return () => {
      ScrollTrigger.removeEventListener("refreshInit", measure);
      gsap.set(hero, { clearProps: "transform,transformOrigin,scale" });
      chrome.forEach((el) => (el.style.opacity = ""));
      ring.style.opacity = "0";
      next.style.marginTop = next.style.clipPath = "";
      next.style.removeProperty("--pin-shift");
      delete next.dataset.scrollAt;
    };
  });

  return (
    <div
      ref={ringRef}
      aria-hidden
      className="pointer-events-none fixed z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent opacity-0"
    />
  );
}

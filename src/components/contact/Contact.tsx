"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import HeroClock from "@/components/hero/HeroClock";
import { scrollToTarget, useLenis } from "@/components/providers/SmoothScroll";
import { SITE, SOCIALS } from "@/lib/site";
import Icon from "@/components/ui/Icon";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EMAIL = SOCIALS.find((s) => s.label === "Email")!.href.replace("mailto:", "");
const LINKS = [
  ...SOCIALS.filter((s) => s.label !== "Email").map((s) => ({ label: s.label, href: s.href })),
  { label: "Résumé", href: SITE.resume },
];
const WORDS = ["LET'S", "TALK"];

/** Big round "say hello" button that leans toward the cursor. */
function MagneticHello() {
  const ref = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    const el = ref.current!;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.35);
      y((e.clientY - (r.top + r.height / 2)) * 0.35);
    };
    const leave = () => (x(0), y(0));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  });

  return (
    <a
      ref={ref}
      href={`mailto:${EMAIL}`}
      className="contact-hello group relative flex size-[clamp(130px,13vw,240px)] shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-white"
    >
      <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-cream transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:scale-y-100" />
      <span className="relative font-display text-[clamp(13px,1.05vw,20px)] leading-tight tracking-[0.04em] transition-colors duration-300 group-hover:text-ink">
        SAY HELLO <Icon name="arrow_outward" className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
      </span>
    </a>
  );
}

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      location.href = `mailto:${EMAIL}`;
    }
  };

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap
        .timeline({ scrollTrigger: { trigger: ref.current, start: "top 65%" } })
        .from(".contact-kicker", { autoAlpha: 0, y: 12, duration: 0.6 })
        .from(".contact-letter", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.05 }, 0.1)
        .from(".contact-hello", { scale: 0, rotate: -40, duration: 1, ease: "expo.out" }, 0.5)
        .from(".contact-rule", { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, 0.4)
        .from(".contact-col", { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.08 }, 0.7);
    },
    { scope: ref },
  );

  const label = "font-pixel text-[clamp(11px,0.8vw,14px)] tracking-[0.14em] text-cream/55";

  return (
    <section ref={ref} id="contact" className="relative z-10 overflow-hidden bg-ink text-cream">
      <div className="mx-auto flex min-h-svh max-w-[1680px] flex-col px-[max(20px,6.5vw)] pt-[clamp(96px,10vw,180px)] pb-[clamp(28px,3vw,48px)]">
        <p className="contact-kicker font-pixel text-[clamp(12px,1vw,18px)] tracking-[0.14em] text-accent">[GOT SOMETHING UNSOLVABLE?]</p>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <h2 className="font-display text-[clamp(72px,15vw,290px)] leading-[0.86]" aria-label="Let's talk">
            {WORDS.map((w) => (
              <span key={w} aria-hidden className="flex overflow-hidden">
                {w.split("").map((l, i) => (
                  <span
                    key={i}
                    className="contact-letter inline-block transition-[color,translate] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-[0.06em] hover:text-accent"
                  >
                    {l}
                  </span>
                ))}
              </span>
            ))}
          </h2>
          <div className="pb-[1.2vw]">
            <MagneticHello />
          </div>
        </div>

        <div className="relative mt-auto pt-[clamp(56px,7vw,120px)]">
          <span aria-hidden className="contact-rule absolute top-[clamp(56px,7vw,120px)] left-0 h-px w-full origin-left bg-[repeating-linear-gradient(to_right,var(--cream)_0_3px,transparent_3px_6px)] opacity-40" />
          <div className="grid gap-x-[4vw] gap-y-10 pt-[clamp(28px,3vw,48px)] md:grid-cols-12">
            {/* Email */}
            <div className="contact-col md:col-span-6">
              <p className={label}>[EMAIL]</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                <a
                  href={`mailto:${EMAIL}`}
                  className="font-sans text-[clamp(22px,2.4vw,44px)] font-medium tracking-[-0.02em] break-all transition-colors duration-200 hover:text-accent"
                >
                  {EMAIL}
                </a>
                <button
                  type="button"
                  onClick={copy}
                  className="font-pixel text-[clamp(11px,0.8vw,14px)] tracking-[0.14em] text-accent transition-opacity hover:opacity-80"
                  aria-live="polite"
                >
                  {copied ? "[COPIED ✓]" : "[COPY]"}
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="contact-col md:col-span-3">
              <p className={label}>[ELSEWHERE]</p>
              <ul className="mt-3 flex flex-col">
                {LINKS.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-4 border-b border-cream/15 py-2 font-sans text-[clamp(16px,1.2vw,21px)] transition-colors duration-200 hover:text-accent"
                    >
                      {l.label}
                      <Icon name="arrow_outward" className="inline-block transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Time */}
            <div className="contact-col md:col-span-3">
              <p className={label}>[LOCAL TIME]</p>
              <p className="mt-3 font-pixel text-[clamp(28px,2.6vw,48px)] leading-none tracking-[0.04em]">
                <HeroClock /> <span className="text-[0.45em] text-accent">IST</span>
              </p>
              <p className="mt-3 font-sans text-[clamp(14px,1vw,17px)] text-cream/70">Bengaluru, India</p>
            </div>
          </div>

          <div className="contact-col mt-[clamp(48px,6vw,100px)] flex items-center justify-between gap-6 font-pixel text-[clamp(11px,0.8vw,14px)] tracking-[0.14em] text-cream/55">
            <a href={SITE.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="group transition-colors hover:text-accent">
              [{SITE.handle} <Icon name="arrow_outward" className="inline-block transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />]
            </a>
            <button type="button" onClick={() => scrollToTarget(lenis.current, "#top")} className="group text-cream transition-colors hover:text-accent">
              [BACK TO TOP <Icon name="arrow_upward" className="inline-block transition-transform duration-200 group-hover:-translate-y-1" />]
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

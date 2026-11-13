"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { EXPERIENCE, type Role } from "@/lib/experience";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const pad = (n: number) => String(n).padStart(2, "0");
const HEADING = "EXPERIENCE";

function RoleRow({ role, index, open, onToggle }: { role: Role; index: number; open: boolean; onToggle: () => void }) {
  const panel = `exp-panel-${index}`;
  return (
    <li className="exp-row relative">
      <span aria-hidden className="exp-rule dash-h absolute top-0 left-0 h-px w-full origin-left" />

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={onToggle}
        className="group relative grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 py-[clamp(20px,2.2vw,36px)] text-left md:grid-cols-12 md:gap-x-[2vw]"
      >
        {/* accent flood on hover */}
        <span
          aria-hidden
          className="absolute inset-x-[calc(-1*max(20px,6.5vw))] inset-y-0 origin-bottom scale-y-0 bg-accent transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-y-100"
        />

        <span className="exp-fade relative font-pixel text-[clamp(12px,0.9vw,16px)] tracking-[0.12em] text-accent transition-colors duration-200 group-hover:text-white md:col-span-1">
          [{pad(index + 1)}]
        </span>

        <span className="exp-fade relative col-span-1 font-pixel text-[clamp(11px,0.85vw,15px)] tracking-[0.1em] text-ink/70 uppercase transition-colors duration-200 group-hover:text-white md:col-span-2 md:order-none">
          {role.start} — {role.end}
        </span>

        <span className="relative col-span-3 row-start-2 overflow-hidden pb-[0.1em] md:col-span-5 md:row-start-auto">
          <span className="exp-title inline-flex items-center gap-[0.4em] font-sans text-[clamp(30px,3.4vw,62px)] leading-none font-medium tracking-[-0.02em] text-ink transition-colors duration-200 group-hover:text-white">
            {role.company}
            {role.current && (
              <span className="relative inline-flex size-[0.22em] translate-y-[-0.1em]">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60 group-hover:bg-white" />
                <span className="relative size-full rounded-full bg-accent group-hover:bg-white" />
              </span>
            )}
          </span>
        </span>

        <span className="exp-fade relative col-span-3 row-start-3 font-sans text-[clamp(15px,1.1vw,20px)] text-ink/80 transition-colors duration-200 group-hover:text-white md:col-span-3 md:row-start-auto">
          {role.role}
        </span>

        {/* plus → cross */}
        <span
          aria-hidden
          className="exp-fade relative col-start-3 row-start-1 grid size-[clamp(36px,2.8vw,52px)] place-items-center justify-self-end rounded-full border border-ink/30 text-ink transition-colors duration-200 group-hover:border-white group-hover:text-white md:col-span-1 md:col-start-12 md:row-start-auto"
        >
          <svg
            viewBox="0 0 24 24"
            className={cn("size-[42%] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]", open && "rotate-45")}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M12 3v18M3 12h18" />
          </svg>
        </span>
      </button>

      {/* height animates via grid rows 0fr → 1fr */}
      <div
        id={panel}
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        onTransitionEnd={(e) => e.target === e.currentTarget && ScrollTrigger.refresh()}
      >
        <div className="overflow-hidden" inert={!open}>
          <div
            className={cn(
              "grid gap-y-6 pb-[clamp(28px,3vw,52px)] transition-opacity duration-300 md:grid-cols-12 md:gap-x-[2vw]",
              open ? "opacity-100 delay-100" : "opacity-0",
            )}
          >
            <ul className="flex flex-col gap-3 md:col-span-7 md:col-start-4">
              {role.points.map((p) => (
                <li key={p} className="flex gap-3 font-sans text-[clamp(15px,1.05vw,18px)] leading-relaxed text-ink/85">
                  <span aria-hidden className="mt-[0.65em] h-px w-3 shrink-0 bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-5 md:col-span-2 md:col-start-11">
              <ul className="flex flex-wrap gap-2">
                {role.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-ink/25 px-3 py-1 font-pixel text-[clamp(11px,0.75vw,13px)] tracking-[0.06em] text-ink"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              {role.project && (
                <Link
                  href={`/projects/${role.project}`}
                  className="group/l inline-flex items-center gap-2 font-pixel text-[clamp(12px,0.85vw,15px)] tracking-[0.12em] text-accent"
                >
                  [CASE STUDY
                  <span className="inline-block transition-transform duration-200 group-hover/l:translate-x-1 group-hover/l:-translate-y-1">↗</span>]
                </Link>
              )}
              {role.url && (
                <a
                  href={role.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group/l inline-flex items-center gap-2 font-pixel text-[clamp(12px,0.85vw,15px)] tracking-[0.12em] text-ink"
                >
                  [{new URL(role.url).hostname.toUpperCase()}
                  <span className="inline-block transition-transform duration-200 group-hover/l:translate-x-1 group-hover/l:-translate-y-1">↗</span>]
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

/** Career timeline as an accordion — the current role starts open. */
export default function Experience() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap
        .timeline({ scrollTrigger: { trigger: ".exp-head", start: "top 70%" } })
        .from(".exp-letter", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.04 })
        .from(".exp-kicker", { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08 }, 0.2);

      gsap.utils.toArray<HTMLElement>(".exp-row").forEach((row, i) => {
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: "top 88%" }, delay: i === 0 ? 0.2 : 0 })
          .from(row.querySelector(".exp-rule"), { scaleX: 0, duration: 1.1, ease: "expo.inOut" })
          .from(row.querySelector(".exp-title"), { yPercent: 110, duration: 0.9, ease: "expo.out" }, 0.2)
          .from(row.querySelectorAll(".exp-fade"), { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.05 }, 0.3);
      });

      gsap.from(".exp-end", { scrollTrigger: { trigger: ".exp-end", start: "top 92%" }, autoAlpha: 0, y: 14, duration: 0.6 });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="experience" className="relative z-10 overflow-x-clip bg-cream">
      <div className="mx-auto max-w-[1680px] px-[max(20px,6.5vw)] pt-[clamp(40px,5vw,100px)] pb-[clamp(90px,10vw,180px)]">
        <header className="exp-head flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="exp-kicker mb-2 font-pixel text-[clamp(12px,1vw,18px)] tracking-[0.14em] text-accent">[WHERE I&apos;VE BEEN]</p>
            <h2 className="flex overflow-hidden font-display text-[clamp(44px,9.4vw,180px)] leading-[0.85] text-ink" aria-label="Experience">
              {HEADING.split("").map((l, i) => (
                <span key={i} aria-hidden className="exp-letter inline-block">
                  {l}
                </span>
              ))}
            </h2>
          </div>
          <p className="exp-kicker pb-[1vw] md:text-right font-pixel text-[clamp(12px,0.95vw,17px)] leading-[1.7] tracking-[0.12em] text-ink">
            [{pad(EXPERIENCE.length)}] ROLES
            <br />
            SINCE {EXPERIENCE.at(-1)!.start.split(" ")[1]}
          </p>
        </header>

        <ul className="mt-[clamp(40px,5vw,90px)]">
          {EXPERIENCE.map((r, i) => (
            <RoleRow key={r.company} role={r} index={i} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
          <li aria-hidden className="exp-rule dash-h h-px w-full origin-left" />
        </ul>

        <div className="exp-end mt-[clamp(40px,4vw,72px)] flex justify-end">
          <a
            href={SITE.resume}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 font-pixel text-[clamp(12px,0.95vw,17px)] tracking-[0.14em] text-accent"
          >
            [FULL RÉSUMÉ
            <span className="inline-block transition-transform duration-200 group-hover:translate-y-1">↓</span>]
          </a>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { EXPERIENCE, type Role } from "@/lib/experience";
import { SITE } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const pad = (n: number) => String(n).padStart(2, "0");
const HEADING = "EXPERIENCE";
/** A value with exactly one number in it, e.g. "-91%", "1.0s", "+8 FPS". */
const COUNTABLE = /^(\D*?)(\d+(?:\.\d+)?)(\D*)$/;

const arrow = "inline-block transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1";

/**
 * One role: the company sits sticky on the left while its numbers scroll by
 * on the right, so each role "holds" the screen until its stats are read.
 */
function RoleBlock({ role, index }: { role: Role; index: number }) {
  return (
    <article className="exp-role relative grid gap-y-10 pt-[clamp(28px,3vw,52px)] md:grid-cols-12 md:gap-x-[3vw]">
      <span aria-hidden className="exp-rule dash-h absolute top-0 left-0 h-px w-full origin-left" />

      {/* Left — sticky identity */}
      <div className="self-start md:sticky md:top-[calc(clamp(96px,16vh,170px)-var(--pin-shift,0px))] md:col-span-5">
        <p className="exp-fade flex items-center gap-4 font-pixel text-[clamp(12px,0.9vw,16px)] tracking-[0.12em]">
          <span className="text-accent">
            [{pad(index + 1)} / {pad(EXPERIENCE.length)}]
          </span>
          <span className="text-ink/70 uppercase">
            {role.start} — {role.end}
          </span>
        </p>
        <h3 className="mt-4 overflow-hidden pb-[0.1em]">
          <span className="exp-title inline-flex items-center gap-[0.35em] font-sans text-[clamp(40px,4.6vw,84px)] leading-none font-medium tracking-[-0.03em] text-ink">
            {role.company}
            {role.current && (
              <span className="relative inline-flex size-[0.2em] -translate-y-[0.15em]" title="Current role">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative size-full rounded-full bg-accent" />
              </span>
            )}
          </span>
        </h3>
        <p className="exp-fade mt-3 font-sans text-[clamp(16px,1.25vw,22px)] text-ink/80">{role.role}</p>

        <ul className="exp-fade mt-6 flex flex-wrap gap-2">
          {role.stack.map((s) => (
            <li key={s} className="rounded-full border border-ink/25 px-3 py-1 font-pixel text-[clamp(11px,0.75vw,13px)] tracking-[0.06em] text-ink">
              {s}
            </li>
          ))}
        </ul>

        {(role.project || role.url) && (
          <p className="exp-fade mt-7 flex flex-wrap gap-x-6 gap-y-3 font-pixel text-[clamp(12px,0.85vw,15px)] tracking-[0.12em]">
            {role.project && (
              <Link href={`/projects/${role.project}`} className="group text-accent">
                [CASE STUDY <span className={arrow}>↗</span>]
              </Link>
            )}
            {role.url && (
              <a href={role.url} target="_blank" rel="noreferrer" className="group text-ink">
                [{new URL(role.url).hostname.toUpperCase()} <span className={arrow}>↗</span>]
              </a>
            )}
          </p>
        )}
      </div>

      {/* Right — the numbers, with a progress line that fills as you read */}
      <div className="relative md:col-span-7 md:col-start-6 md:pl-[clamp(24px,3vw,56px)]">
        <span aria-hidden className="dash-v absolute top-0 left-0 hidden h-full w-px md:block" />
        <span aria-hidden className="exp-progress absolute top-0 left-0 hidden h-full w-[3px] -translate-x-px origin-top bg-accent md:block" />

        <ul>
          {role.stats.map((s, i) => (
            <li key={s.label} className="exp-stat relative py-[clamp(24px,3vw,48px)] first:pt-0">
              {i > 0 && <span aria-hidden className="dash-h absolute top-0 left-0 h-px w-full opacity-40" />}
              <span className="exp-num block font-display text-[clamp(64px,7.4vw,140px)] leading-[0.9] text-accent" data-value={s.value}>
                {s.value}
              </span>
              <p className="exp-stat-text mt-4 font-sans text-[clamp(18px,1.5vw,26px)] font-medium tracking-[-0.01em] text-ink">{s.label}</p>
              <p className="exp-stat-text mt-2 max-w-[52ch] font-sans text-[clamp(14px,1vw,17px)] leading-relaxed text-ink/70">{s.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function Experience() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // #experience is pinned under the hero transition for one hero-height of
      // scroll, so every trigger inside it starts that much later than its layout says.
      const shift = () => document.getElementById("hero-pin")?.offsetHeight ?? 0;
      const at = (edge: string, vp: string) => () => `${edge}+=${shift()} ${vp}`;

      gsap
        .timeline({ scrollTrigger: { trigger: ".exp-head", start: at("top", "60%"), invalidateOnRefresh: true } })
        .from(".exp-letter", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.04 })
        .from(".exp-kicker", { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08 }, 0.2);

      const counters: { el: HTMLElement; value: string }[] = [];

      gsap.utils.toArray<HTMLElement>(".exp-role").forEach((role) => {
        gsap
          .timeline({ scrollTrigger: { trigger: role, start: at("top", "80%"), invalidateOnRefresh: true } })
          .from(role.querySelector(".exp-rule"), { scaleX: 0, duration: 1.1, ease: "expo.inOut" })
          .from(role.querySelector(".exp-title"), { yPercent: 110, duration: 0.9, ease: "expo.out" }, 0.15)
          .from(role.querySelectorAll(".exp-fade"), { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.06 }, 0.25);

        gsap.fromTo(
          role.querySelector(".exp-progress"),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: role, start: at("top", "60%"), end: at("bottom", "60%"), scrub: true, invalidateOnRefresh: true },
          },
        );

        role.querySelectorAll<HTMLElement>(".exp-stat").forEach((stat) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: stat, start: at("top", "85%"), invalidateOnRefresh: true } });
          const num = stat.querySelector<HTMLElement>(".exp-num")!;
          const value = num.dataset.value!;
          const m = value.match(COUNTABLE);
          if (m) {
            const [, pre, digits, post] = m;
            const decimals = digits.split(".")[1]?.length ?? 0;
            const n = { v: 0 };
            const write = () => (num.textContent = pre + n.v.toFixed(decimals) + post);
            write();
            counters.push({ el: num, value });
            tl.to(n, { v: Number(digits), duration: 1.6, ease: "expo.out", onUpdate: write }, 0);
          }
          tl.from(num, { yPercent: 30, autoAlpha: 0, duration: 0.8, ease: "expo.out" }, 0).from(
            stat.querySelectorAll(".exp-stat-text"),
            { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08 },
            0.15,
          );
        });
      });

      // The counters write text directly; put the real values back on cleanup.
      return () => counters.forEach(({ el, value }) => (el.textContent = value));
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="experience" className="relative z-10 overflow-x-clip bg-cream">
      <div className="mx-auto max-w-[1680px] px-[max(20px,6.5vw)] pt-[clamp(110px,11vw,200px)] pb-[clamp(60px,7vw,120px)]">
        <header className="exp-head relative flex flex-wrap items-end justify-between gap-6">
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
          <p className="exp-kicker pb-[1vw] font-pixel text-[clamp(12px,0.95vw,17px)] leading-[1.7] tracking-[0.12em] text-ink md:text-right">
            [{pad(EXPERIENCE.length)}] ROLES
            <br />
            SINCE {EXPERIENCE.at(-1)!.start.split(" ")[1]}
          </p>
        </header>

        <div className="mt-[clamp(56px,7vw,130px)] flex flex-col gap-[clamp(64px,8vw,150px)]">
          {EXPERIENCE.map((r, i) => (
            <RoleBlock key={r.company} role={r} index={i} />
          ))}
        </div>

        <div className="mt-[clamp(56px,6vw,110px)] flex justify-end">
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

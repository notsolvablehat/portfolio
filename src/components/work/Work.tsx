"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FEATURED, type Project } from "@/lib/projects";
import { cn } from "@/lib/utils";
import AllProjectsButton from "./AllProjectsButton";
import ProjectMockup from "./ProjectMockup";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Each mockup opens like the hero's window: a small framed square with a
 * dashed crosshair through it grows (scrubbed to scroll) into the full image.
 */
function ProjectRow({ project, index }: { project: Project; index: number }) {
  const href = `/projects/${project.slug}`;
  const lead = index === 0;
  return (
    <article
      className={cn(
        "work-row relative grid items-center gap-y-8 md:grid-cols-12 md:gap-x-[4vw]",
        index % 2 === 1 && "md:[&>.work-media]:col-start-2",
      )}
    >
      <Link
        href={href}
        aria-label={`${project.name} — view case study`}
        className={cn("work-media relative block", lead ? "md:col-span-7" : "md:col-span-6")}
        style={{ aspectRatio: `${project.mockup.bg.width} / ${project.mockup.bg.height}` }}
      >
        <span aria-hidden className="work-cross-h dash-h pointer-events-none absolute top-1/2 -left-[100vw] h-px w-[300vw]" />
        <span aria-hidden className="work-cross-v dash-v pointer-events-none absolute -top-[15vh] left-1/2 h-[calc(100%+30vh)] w-px" />
        <span className="work-clip absolute inset-0 overflow-hidden bg-cream">
          <ProjectMockup
            project={project}
            sizes="(min-width: 768px) 60vw, 100vw"
            eager={index === 0}
            className="size-full"
            bgClassName="work-img"
            screenClassName="work-screen"
          />
        </span>
        <span aria-hidden className="work-frame pointer-events-none absolute inset-0 border-[3px] border-ink" />
      </Link>

      <div className={cn("work-details", lead ? "md:col-span-5" : "md:col-span-5 md:col-start-8")}>
        <p className="work-fade font-pixel text-[clamp(12px,0.9vw,16px)] tracking-[0.12em] text-accent">
          [{pad(index + 1)} / {pad(FEATURED.length)}]
        </p>
        <h3 className="mt-3 overflow-hidden pb-[0.12em] font-sans text-[clamp(40px,4.2vw,76px)] leading-none font-medium tracking-[-0.02em] text-ink">
          <Link href={href} className="work-title inline-block transition-colors duration-200 hover:text-accent">
            {project.name}
          </Link>
        </h3>
        <span aria-hidden className="work-underline mt-2 block h-[2px] w-[min(40%,180px)] origin-left bg-ink" />
        <p className="work-fade mt-6 max-w-[34ch] font-sans text-[clamp(15px,1.05vw,19px)] leading-relaxed text-ink/80">
          {project.category}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <li
              key={s}
              className="work-chip rounded-full border border-ink/25 px-3 py-1 font-pixel text-[clamp(11px,0.75vw,13px)] tracking-[0.06em] text-ink"
            >
              {s}
            </li>
          ))}
        </ul>
        <Link
          href={href}
          className="work-fade group mt-8 inline-flex items-center gap-2 font-pixel text-[clamp(12px,0.85vw,15px)] tracking-[0.12em] text-accent"
        >
          [VIEW CASE STUDY
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>]
        </Link>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="work-fade group mt-8 ml-6 inline-flex items-center gap-2 font-pixel text-[clamp(12px,0.85vw,15px)] tracking-[0.12em] text-ink"
          >
            [VISIT LIVE
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>]
          </a>
        )}
      </div>
    </article>
  );
}

export default function Work() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduce) return;

      // #work is pinned over the window-reveal stage for one stage-height of scroll,
      // so triggers that fire after the reveal start that much later than layout says.
      const shift = () => document.getElementById("work-stage")?.offsetHeight ?? 0;
      const at = (edge: string, vp: string) => () => `${edge}+=${shift()} ${vp}`;

      // Heading
      gsap
        .timeline({ scrollTrigger: { trigger: ".work-head", start: "top 85%" } })
        .from(".work-letter", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.06 })
        .from(".work-kicker", { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08 }, 0.2)
        .from(".work-rule", { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, 0.1);

      gsap.utils.toArray<HTMLElement>(".work-row").forEach((row) => {
        const media = row.querySelector<HTMLElement>(".work-media")!;
        const side = () => Math.min(media.offsetWidth, media.offsetHeight) * 0.26;
        const iy = () => (media.offsetHeight - side()) / 2;
        const ix = () => (media.offsetWidth - side()) / 2;

        // The window opening — scrubbed
        gsap
          .timeline({
            scrollTrigger: { trigger: media, start: at("top", "100%"), end: at("center", "68%"), scrub: true, invalidateOnRefresh: true },
            defaults: { ease: "power2.inOut" },
          })
          .fromTo(row.querySelector(".work-clip"), { clipPath: () => `inset(${iy()}px ${ix()}px)` }, { clipPath: "inset(0px 0px)" }, 0)
          .fromTo(
            row.querySelector(".work-frame"),
            { top: iy, bottom: iy, left: ix, right: ix },
            { top: 0, bottom: 0, left: 0, right: 0 },
            0,
          )
          .fromTo(row.querySelector(".work-img"), { scale: 1.4 }, { scale: 1, ease: "none" }, 0)
          // the screenshot drifts up into place a little slower than the room — a touch of depth
          .fromTo(row.querySelector(".work-screen"), { yPercent: 18, scale: 0.92 }, { yPercent: 0, scale: 1, ease: "power2.out" }, 0)
          .to(row.querySelectorAll(".work-cross-h, .work-cross-v"), { autoAlpha: 0, duration: 0.25 }, 0.7)
          .to(row.querySelector(".work-frame"), { autoAlpha: 0, duration: 0.2 }, 0.8);

        // Details — play once
        gsap
          .timeline({ scrollTrigger: { trigger: row.querySelector(".work-details"), start: at("top", "80%"), invalidateOnRefresh: true } })
          .from(row.querySelector(".work-title"), { yPercent: 110, duration: 1, ease: "expo.out" })
          .from(row.querySelector(".work-underline"), { scaleX: 0, duration: 0.9, ease: "expo.inOut" }, 0.1)
          .from(row.querySelectorAll(".work-fade"), { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.08 }, 0.15)
          .from(row.querySelectorAll(".work-chip"), { autoAlpha: 0, y: 10, duration: 0.4, stagger: 0.05 }, 0.3);
      });

      gsap.from(".work-cta", {
        scrollTrigger: { trigger: ".work-cta", start: at("top", "85%"), invalidateOnRefresh: true },
        scale: 0.6,
        autoAlpha: 0,
        duration: 1,
        ease: "expo.out",
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="work" className="relative z-10 overflow-x-clip bg-cream">
      <div className="mx-auto max-w-[1680px] px-[max(20px,6.5vw)] pt-[clamp(90px,9vw,170px)] pb-[clamp(80px,9vw,160px)]">
        {/* Heading */}
        <header className="work-head relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="work-kicker mb-2 font-pixel text-[clamp(12px,1vw,18px)] tracking-[0.14em] text-accent">[BEST FEATURED]</p>
            <h2 className="flex overflow-hidden font-display text-[clamp(72px,13vw,240px)] leading-[0.85] text-ink" aria-label="Work">
              {"WORK".split("").map((l, i) => (
                <span key={i} aria-hidden className="work-letter inline-block">
                  {l}
                </span>
              ))}
            </h2>
          </div>
          <p className="work-kicker pb-[1vw] text-right font-pixel text-[clamp(12px,0.95vw,17px)] leading-[1.7] tracking-[0.12em] text-ink">
            [{pad(FEATURED.length)}] SELECTED
            <br />
            PROJECTS
          </p>
          <span aria-hidden className="work-rule dash-h absolute -bottom-6 left-0 h-px w-full origin-left" />
        </header>

        {/* Projects */}
        <div className="mt-[clamp(80px,9vw,170px)] flex flex-col gap-[clamp(96px,11vw,200px)]">
          {FEATURED.map((p, i) => (
            <ProjectRow key={p.slug} project={p} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-[clamp(110px,12vw,220px)] flex flex-col items-center gap-6 text-center">
          <p className="font-pixel text-[clamp(12px,0.95vw,17px)] tracking-[0.14em] text-accent">[WANT TO SEE EVERYTHING?]</p>
          <AllProjectsButton className="work-cta" />
        </div>
      </div>

    </section>
  );
}

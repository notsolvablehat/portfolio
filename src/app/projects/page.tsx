import type { Metadata } from "next";
import Link from "next/link";
import FloodIn from "@/components/work/FloodIn";
import ProjectMockup from "@/components/work/ProjectMockup";
import { PROJECTS } from "@/lib/projects";
import { SOCIALS } from "@/lib/site";

export const metadata: Metadata = {
  title: "All work — Mohammed Yaseen Agha",
  description: "Every project by Mohammed Yaseen Agha.",
};

const pad = (n: number) => String(n).padStart(2, "0");
const github = SOCIALS.find((s) => s.label === "GitHub")!.href;

export default function ProjectsPage() {
  return (
    <main className="mx-auto min-h-svh max-w-[1680px] px-[max(20px,6.5vw)] pt-[clamp(92px,7.5vw,132px)] pb-[clamp(80px,8vw,140px)]">
      <FloodIn />
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-dashed border-ink pb-6">
        <div>
          <Link href="/#work" className="relative z-10 inline-block font-pixel text-[clamp(12px,0.95vw,17px)] tracking-[0.14em] text-accent hover:underline">
            [← BACK HOME]
          </Link>
          <h1 className="mt-3 font-display text-[clamp(56px,10vw,180px)] leading-[0.85] text-ink">ALL WORK</h1>
        </div>
        <p className="font-pixel text-[clamp(12px,0.95vw,17px)] leading-[1.7] tracking-[0.12em] text-ink">[{pad(PROJECTS.length)}] PROJECTS</p>
      </header>

      <ul className="mt-[clamp(48px,6vw,110px)] grid gap-x-[4vw] gap-y-[clamp(56px,6vw,110px)] md:grid-cols-2">
        {PROJECTS.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/projects/${p.slug}`} className="group block">
              <span className="relative block">
                <ProjectMockup
                  project={p}
                  eager={i < 2}
                  sizes="(min-width: 768px) 45vw, 100vw"
                  bgClassName="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
                  screenClassName="transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-[3%]"
                />
                <span className="absolute inset-0 border-[3px] border-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </span>
              <span className="mt-5 flex items-baseline justify-between gap-4">
                <span className="font-sans text-[clamp(28px,2.6vw,46px)] font-medium tracking-[-0.02em] text-ink transition-colors duration-200 group-hover:text-accent">
                  {p.name}
                </span>
                <span className="font-pixel text-[12px] tracking-[0.12em] text-accent">[{pad(i + 1)}]</span>
              </span>
              <span className="mt-2 block font-sans text-[clamp(14px,1vw,17px)] text-ink/75">{p.category}</span>
              <span className="mt-3 block font-pixel text-[12px] tracking-[0.06em] text-ink/70">{p.stack.join(" · ")}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-[clamp(72px,8vw,140px)] text-center font-pixel text-[clamp(12px,0.95vw,17px)] tracking-[0.14em] text-accent">
        <a href={github} target="_blank" rel="noreferrer" className="hover:underline">
          [MORE EXPERIMENTS ON GITHUB ↗]
        </a>
      </p>
    </main>
  );
}

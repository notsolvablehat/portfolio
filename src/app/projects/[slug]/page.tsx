import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PROJECTS, getProject } from "@/lib/projects";
import { CaseStudy } from "./case-study";
import Icon from "@/components/ui/Icon";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: `${project.name} — Mohammed Yaseen Agha`, description: project.category } : {};
}

/** Shared shell for every case study; the URL-specific part streams in via <CaseStudy>. */
export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <main className="mx-auto min-h-svh max-w-[1680px] px-[max(20px,6.5vw)] pt-[clamp(92px,7.5vw,132px)] pb-[clamp(80px,8vw,140px)]">
      <Link href="/projects" className="relative z-10 inline-block font-pixel text-[clamp(12px,0.95vw,17px)] tracking-[0.14em] text-accent hover:underline">
        [<Icon name="arrow_back" /> ALL PROJECTS]
      </Link>
      <Suspense fallback={<CaseStudySkeleton />}>
        <CaseStudy params={params} />
      </Suspense>
    </main>
  );
}

function CaseStudySkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="mt-6 h-[clamp(56px,9vw,150px)] w-[55%] rounded bg-ink/10" />
      <div className="mt-[clamp(40px,5vw,90px)] aspect-[16/9] w-full bg-ink/10" />
    </div>
  );
}

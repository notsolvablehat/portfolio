import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECTS, getProject } from "@/lib/projects";
import ProjectMockup from "@/components/work/ProjectMockup";
import Icon from "@/components/ui/Icon";

const pad = (n: number) => String(n).padStart(2, "0");

/** Case-study content for one project. Reads URL params, so it renders inside
 *  the page's <Suspense> boundary (keeps the shared App Shell URL-independent).
 *  The long-form write-up goes here once content is ready. */
export async function CaseStudy({ params }: Pick<PageProps<"/projects/[slug]">, "params">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const i = PROJECTS.indexOf(project);
  const next = PROJECTS[(i + 1) % PROJECTS.length];

  return (
    <>
      <header className="mt-4 grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="font-pixel text-[clamp(12px,0.9vw,16px)] tracking-[0.12em] text-accent">
            [{pad(i + 1)} / {pad(PROJECTS.length)}]
          </p>
          <h1 className="mt-2 font-sans text-[clamp(56px,9vw,170px)] leading-[0.9] font-semibold tracking-[-0.03em] text-ink">{project.name}</h1>
        </div>
        <div className="md:col-span-4">
          <p className="font-sans text-[clamp(15px,1.1vw,19px)] leading-relaxed text-ink/80">{project.category}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <li key={s} className="rounded-full border border-ink/25 px-3 py-1 font-pixel text-[12px] tracking-[0.06em] text-ink">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <ProjectMockup project={project} eager sizes="(min-width: 1680px) 1460px, 88vw" className="mt-[clamp(40px,5vw,90px)]" />

      {project.url && (
        <p className="mt-8 text-center">
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="font-pixel text-[clamp(12px,0.95vw,17px)] tracking-[0.14em] text-accent hover:underline"
          >
            [VISIT LIVE SITE <Icon name="arrow_outward" />]
          </a>
        </p>
      )}

      <p className="mt-[clamp(48px,6vw,100px)] text-center font-pixel text-[clamp(12px,0.95vw,17px)] tracking-[0.14em] text-ink">
        [FULL CASE STUDY — COMING SOON]
      </p>

      <Link
        href={`/projects/${next.slug}`}
        className="group mt-[clamp(72px,8vw,140px)] flex items-end justify-between gap-6 border-t border-dashed border-ink pt-8"
      >
        <span>
          <span className="block font-pixel text-[12px] tracking-[0.14em] text-accent">[NEXT PROJECT]</span>
          <span className="mt-2 block font-sans text-[clamp(36px,5vw,90px)] leading-none font-semibold tracking-[-0.03em] text-ink transition-colors duration-200 group-hover:text-accent">
            {next.name}
          </span>
        </span>
        <Icon name="arrow_forward" className="font-display text-[clamp(32px,4vw,72px)] text-accent transition-transform duration-300 group-hover:translate-x-2" />
      </Link>
    </>
  );
}

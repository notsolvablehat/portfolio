import Image from "next/image";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

type Props = {
  project: Project;
  sizes: string;
  eager?: boolean;
  className?: string;
  /** Extra classes for the background / screenshot layers (animation hooks). */
  bgClassName?: string;
  screenClassName?: string;
};

/** Staged background with the site screenshot floated on it (positions in projects.ts). */
export default function ProjectMockup({ project, sizes, eager, className, bgClassName, screenClassName }: Props) {
  const { bg, screen } = project.mockup;
  return (
    <span className={cn("relative block overflow-hidden", className)} style={{ aspectRatio: `${bg.width} / ${bg.height}` }}>
      <Image
        src={bg.src}
        alt=""
        fill
        sizes={sizes}
        loading={eager ? "eager" : undefined}
        className={cn("object-cover", bgClassName)}
      />
      <span
        className={cn(
          "absolute block overflow-hidden rounded-[0.4%] shadow-[0_24px_48px_-16px_rgba(50,50,50,0.35)] ring-1 ring-ink/10",
          screenClassName,
        )}
        style={{ left: `${screen.x * 100}%`, top: `${screen.y * 100}%`, width: `${screen.w * 100}%` }}
      >
        <Image
          src={screen.src}
          alt={`${project.name} website`}
          width={screen.width}
          height={screen.height}
          sizes={sizes}
          loading={eager ? "eager" : undefined}
          className="block h-auto w-full"
        />
      </span>
    </span>
  );
}

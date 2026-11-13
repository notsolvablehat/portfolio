import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** [x, y, width?, fontSize?] — desktop: all in stage cqw; phone: y in cqh, rest in cqw. */
export type Spec = readonly [x: number, y: number, w?: number, f?: number];

type Props = HTMLAttributes<HTMLDivElement> & { d: Spec; m: Spec };

/** Absolutely positions its children on the hero stage at per-breakpoint coordinates. */
export default function Place({ d, m, className, style, ...rest }: Props) {
  const vars = {
    "--dx": d[0],
    "--dy": d[1],
    "--dw": d[2],
    "--df": d[3],
    "--px": m[0],
    "--py": m[1],
    "--pw": m[2],
    "--pf": m[3],
  } as CSSProperties;
  return <div className={cn("place", className)} style={{ ...vars, ...style }} {...rest} />;
}

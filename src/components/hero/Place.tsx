import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** [x, y, width?, fontSize?] — desktop: all in stage cqw; tall & phone: y in cqh, rest in cqw. */
export type Spec = readonly [x: number, y: number, w?: number, f?: number];

type Props = HTMLAttributes<HTMLDivElement> & { d: Spec; t: Spec; m: Spec };

const vars = (prefix: string, s: Spec) => ({
  [`--${prefix}x`]: s[0],
  [`--${prefix}y`]: s[1],
  [`--${prefix}w`]: s[2],
  [`--${prefix}f`]: s[3],
});

/** Absolutely positions its children on the hero stage at per-composition coordinates. */
export default function Place({ d, t, m, className, style, ...rest }: Props) {
  const v = { ...vars("d", d), ...vars("t", t), ...vars("p", m) } as CSSProperties;
  return <div className={cn("place", className)} style={{ ...v, ...style }} {...rest} />;
}

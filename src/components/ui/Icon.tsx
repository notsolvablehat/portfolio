import { cn } from "@/lib/utils";

/** Google Material Symbols (Sharp, weight 400) — inlined so no icon font loads. */
const PATHS = {
  arrow_outward: "m256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z",
  arrow_forward: "M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z",
  arrow_back: "m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z",
  arrow_downward: "M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z",
  arrow_upward: "M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z",
} as const;

export type IconName = keyof typeof PATHS;

/** Sized to the surrounding text (1em) and coloured by currentColor. */
export default function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 -960 960 960" fill="currentColor" className={cn("inline-block size-[1.15em] shrink-0 align-[-0.22em]", className)}>
      <path d={PATHS[name]} />
    </svg>
  );
}

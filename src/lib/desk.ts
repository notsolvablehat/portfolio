import { SITE } from "./site";

/** Sizes are in desk units (1u = 1% of the desk width on desktop). */
export type DeskPoster = {
  id: string;
  src: string;
  alt: string;
  w: number;
  h: number;
  size: number;
  /** Clicking (not dragging) opens this. */
  href?: string;
  hint?: string;
};

export type DeskNote = {
  id: string;
  front: string;
  /** Shown when the note is flipped. */
  back?: string;
  href?: string;
};

export const DESK_POSTERS: DeskPoster[] = [
  { id: "max", src: "/images/max_verstappen.png", alt: "Max Verstappen F1 poster", w: 188, h: 188, size: 11 },
  { id: "porsche", src: "/images/porsche.png", alt: "Porsche 911 GT3 RS poster", w: 195, h: 260, size: 9.5 },
  {
    id: "ironman",
    src: "/images/iron_man.png",
    alt: "Iron Man — opens my favourite side project",
    w: 151,
    h: 358,
    size: 7,
    href: "/projects/paisa",
    hint: "OPEN",
  },
  { id: "pele", src: "/images/pele_footballer.png", alt: "Pelé poster", w: 153, h: 272, size: 7.5 },
  { id: "himmy", src: "/images/himmy_450.png", alt: "Royal Enfield Himalayan 450 poster", w: 178, h: 238, size: 9 },
];

export const DESK_NOTES: DeskNote[] = [
  { id: "f1", front: "[I LIKE F1]", back: "Max on the wall. Sundays are for races." },
  { id: "25", front: "[WANNA BE SUCCESSFUL BY 25]", back: "The clock is ticking. So I ship fast." },
  { id: "iron", front: "[IRON MAN !!]", back: "Genius, builder, a bit of a show-off. The goal." },
  { id: "football", front: "[OCCASIONALLY WATCH FOOTBALL]", back: "Pelé stays on the wall, always." },
  { id: "bike", front: "[THIS HAS TO BE MY FIRST BIKE]", back: "Royal Enfield Himalayan 450. Saving up." },
  { id: "resume", front: "[LOOKING FOR RESUME?]", href: SITE.resume },
];

/** At most this many coins on the desk; the oldest is removed first. */
export const MAX_COINS = 24;

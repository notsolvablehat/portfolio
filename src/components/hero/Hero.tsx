"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Place, { type Spec } from "./Place";
import HeroClock from "./HeroClock";
import ScrollCue from "./ScrollCue";
import { SITE } from "@/lib/site";

gsap.registerPlugin(useGSAP);

/* ─── Composition ───────────────────────────────────────────────────────────
   Three compositions, picked in CSS (see globals.css):
   d · desktop  — measured from the 2000×1218 reference (px / 20 = cqw)
   t · tall     — md+ screens squarer than 13:10 (x/size cqw, y cqh)
   m · phone    — under 768px (x/size cqw, y cqh)
   Both layers share coordinates so the window lines up perfectly.         */

type Spot = { d: Spec; t: Spec; m: Spec };

const ROW_1: Spot = { d: [24.75, 10.4, undefined, 7], t: [12, 18, undefined, 10], m: [7, 14, undefined, 14.5] };
const ROW_A: Spot = { d: [32.6, 21.2, undefined, 6.6], t: [12, 32.5, undefined, 9], m: [7, 26.5, undefined, 13] };
const ROW_3: Spot = { d: [15.25, 32.2, undefined, 7.85], t: [12, 43, undefined, 12], m: [7, 33.5, undefined, 15] };

const NOTE_F = { d: 1.12, t: 1.4, m: 3.1 };
const HANDLE: Spot = { d: [59, 18.65, undefined, NOTE_F.d], t: [56, 30, undefined, NOTE_F.t], m: [52, 24.6, undefined, NOTE_F.m] };
const SWAP_BTN: Spot = { d: [87.5, 9.2, 2.1], t: [71, 29.3, 3.4], m: [84, 24, 8] };

/** Window size as a fraction of stage width. */
const WINDOW_SIZE = { desktop: 0.074, tall: 0.1, mobile: 0.3 };
const TALL_MQ = "(min-width: 768px) and (max-aspect-ratio: 13/10)";

type Note = Spot & { text: ReactNode; href?: string; className?: string };
const NOTES: Note[] = [
  { text: "[I like F1]", d: [5.15, 12.6], t: [5, 70.5], m: [6, 51.8] },
  { text: "[Wanna be successful by 25]", d: [53.1, 9.15], t: [12, 12.5], m: [7, 9.6] },
  { text: "[IRON MAN !!]", d: [83.5, 15.75], t: [78, 10.5], m: [70, 49.8] },
  { text: "[OCCASIONALLY WATCH FOOTBALL]", d: [60.4, 33.6], t: [66, 67, 22], m: [39, 72.6, 32] },
  { text: "[THIS HAS TO BE MY FIRST BIKE]", d: [19.85, 47.8], t: [26, 68.5, 18], m: [6, 71, 30] },
  {
    text: (
      <>
        [LOOKING
        <br />
        FOR
        <br />
        RESUME?]
      </>
    ),
    d: [5.75, 47.3, 7.5],
    t: [79, 55, 14],
    m: [70, 80, 22],
    href: SITE.resume,
    className: "text-center leading-[1.55] underline-offset-4 hover:underline",
  },
];

type Poster = Spot & { src: string; alt: string; w: number; h: number; home?: boolean };
const POSTERS: Poster[] = [
  { src: "/images/max_verstappen.png", alt: "Max Verstappen F1 poster", w: 188, h: 188, d: [7.55, 16.6, 13.05], t: [5, 74, 17], m: [6, 55, 28] },
  { src: "/images/porsche.png", alt: "Porsche 911 GT3 RS poster", w: 195, h: 260, d: [59.6, 12.35, 13.5], t: [46, 71.5, 16], m: [38, 52.5, 27] },
  { src: "/images/iron_man.png", alt: "Iron Man", w: 151, h: 358, d: [83.35, 17.75, 10.5], t: [78, 14, 15], m: [72, 53, 20], home: true },
  { src: "/images/pele_footballer.png", alt: "Pelé poster", w: 153, h: 272, d: [67.3, 37.1, 10.6], t: [66, 72.5, 12.5], m: [42, 79, 20] },
  { src: "/images/himmy_450.png", alt: "Royal Enfield Himalayan 450 poster", w: 178, h: 238, d: [43.85, 41.9, 12.3], t: [26, 73.5, 15], m: [8, 77, 25] },
];

const BIG = "font-sans font-bold leading-none tracking-[-0.015em] text-ink whitespace-nowrap";
const NOTE = "font-pixel text-accent leading-[1.4] tracking-[0.06em]";

const withFont = (s: Spec, f: number): Spec => [s[0], s[1], s[2], f];

/** Clips its child for a slide-up reveal; extra bottom padding keeps descenders. */
function Mask({ children }: { children: ReactNode }) {
  return (
    <span className="block overflow-hidden pb-[0.16em]">
      <span className="hero-line block will-change-transform">{children}</span>
    </span>
  );
}

function Headline({ first, second, accentFirst }: { first: string; second: string; accentFirst?: boolean }) {
  return (
    <Place {...ROW_3} className={BIG}>
      <Mask>
        <span className={accentFirst ? "text-accent" : undefined}>
          <span className="hero-break">{first}</span>
          <span className="hero-space"> </span>
        </span>
        <span className="hero-indent">{second}</span>
      </Mask>
    </Place>
  );
}

/** "I'm Yaseen, a Software Engineer" — text half (the portrait is its own layer). */
function YaseenText() {
  return (
    <>
      <Place {...ROW_1} className={BIG}>
        <Mask>
          <span className="font-display font-normal">I’m</span> <span className="text-accent">Yaseen</span>
        </Mask>
      </Place>
      <Place {...HANDLE} className={`${NOTE} hero-note tracking-[0.12em]`}>
        [{SITE.handle}]
      </Place>
      <Place {...ROW_A} className={`${BIG} font-display font-normal`}>
        <Mask>a</Mask>
      </Place>
      <Headline first="Software" second="Engineer" />
    </>
  );
}

/** "I'm just a child inside." with the posters and notes. */
function ChildLayer() {
  return (
    <>
      <Place {...ROW_1} className={BIG}>
        <Mask>
          <span className="font-display font-normal">I’m</span> <span className="text-accent">just</span>
        </Mask>
      </Place>
      <Place {...ROW_A} className={`${BIG} font-display font-normal`}>
        <Mask>a</Mask>
      </Place>
      <Headline first="child" second="inside." accentFirst />

      {POSTERS.map((p) => (
        <Place key={p.src} d={p.d} t={p.t} m={p.m} data-window-home={p.home || undefined} className="hero-note">
          <Image
            src={p.src}
            alt={p.alt}
            width={p.w}
            height={p.h}
            loading="eager"
            sizes="(min-width: 768px) 17vw, 30vw"
            className="h-auto w-full"
          />
        </Place>
      ))}

      {NOTES.map((n, i) => {
        const spot = { d: withFont(n.d, NOTE_F.d), t: withFont(n.t, NOTE_F.t), m: withFont(n.m, NOTE_F.m) };
        const cls = `${NOTE} hero-note ${n.className ?? ""}`;
        return (
          <Place key={i} {...spot} className={cls}>
            {n.href ? (
              <a href={n.href} target="_blank" rel="noreferrer">
                {n.text}
              </a>
            ) : (
              n.text
            )}
          </Place>
        );
      })}
    </>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const swapRef = useRef<() => void>(() => {});
  const [swapped, setSwapped] = useState(false);

  // Window tracking: pointer/touch sets a target; the ticker eases toward it
  // and writes --mx/--my/--win on the hero, which CSS turns into clip + frame.
  useGSAP(
    (_ctx, contextSafe) => {
      const hero = heroRef.current!;
      const stage = hero.querySelector<HTMLElement>("[data-stage]")!;
      const label = hero.querySelector<HTMLElement>(".hero-time")!;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 768px)");
      const tall = window.matchMedia(TALL_MQ);
      const target = { x: 0, y: 0 };
      const cur = { x: 0, y: 0 };
      const win = { base: 120, scale: 1 };
      let touched = false;
      let flipped = false;

      const applyWin = () => hero.style.setProperty("--win", `${win.base * win.scale}px`);

      // Clock label: top-right of the window (below it on phones); flips to the
      // other side when it would run off the right edge. Positioning is in CSS.
      const write = () => {
        hero.style.setProperty("--mx", `${cur.x}px`);
        hero.style.setProperty("--my", `${cur.y}px`);
        const left = desktop.matches ? cur.x + win.base * 0.35 : cur.x - win.base / 2;
        const room = hero.clientWidth - left - 16;
        const flip = flipped ? room < label.offsetWidth + 40 : room < label.offsetWidth;
        if (flip !== flipped) {
          flipped = flip;
          label.toggleAttribute("data-flip", flip);
        }
      };

      const homePoint = () => {
        const h = hero.getBoundingClientRect();
        const r = hero.querySelector("[data-window-home]")!.getBoundingClientRect();
        // divide out any scale on the hero so the point is in layout pixels
        const k = h.width / hero.offsetWidth || 1;
        return { x: (r.left + r.width * 0.5 - h.left) / k, y: (r.top + r.height * 0.24 - h.top) / k };
      };

      const measure = () => {
        // layout width — unaffected by the eye-zoom's scale transform on the hero
        const w = stage.offsetWidth;
        const f = tall.matches ? WINDOW_SIZE.tall : desktop.matches ? WINDOW_SIZE.desktop : WINDOW_SIZE.mobile;
        win.base = Math.max(desktop.matches ? 84 : 104, w * f);
        applyWin();
        if (!touched) {
          Object.assign(target, homePoint());
          Object.assign(cur, target);
        }
        write();
      };

      const aim = (clientX: number, clientY: number) => {
        const h = hero.getBoundingClientRect();
        target.x = clientX - h.left;
        target.y = clientY - h.top;
        touched = true;
      };

      const onPointer = (e: PointerEvent) => e.pointerType !== "touch" && aim(e.clientX, e.clientY);
      const onTouch = (e: TouchEvent) => aim(e.touches[0].clientX, e.touches[0].clientY);

      const tick = (_t: number, dt: number) => {
        const k = reduce ? 1 : 1 - Math.pow(1 - 0.14, dt / 16.67);
        const dx = target.x - cur.x;
        const dy = target.y - cur.y;
        if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return;
        cur.x += dx * k;
        cur.y += dy * k;
        write();
      };

      // Swap: the window floods the screen with the lower layer, the layers
      // trade places while the window is at 0, then it reopens on the old surface.
      let swapping = false;
      // In the swapped state the window is just a see-through, click-through
      // frame: the engineer layer is hidden except while the swap-back flood needs it.
      const engineer = hero.querySelectorAll<HTMLElement>(".layer-y-text, .layer-y-portrait");
      const setPeek = (on: boolean) => engineer.forEach((el) => (el.style.visibility = on ? "" : "hidden"));
      const toggleRoles = () => {
        const next = !hero.hasAttribute("data-swapped");
        hero.toggleAttribute("data-swapped", next);
        setPeek(!next);
        setSwapped(next);
      };
      swapRef.current = contextSafe!(() => {
        if (swapping) return;
        if (reduce) return toggleRoles();
        swapping = true;
        setPeek(true);
        const flood = (2 * Math.hypot(hero.clientWidth, hero.clientHeight)) / win.base;
        gsap
          .timeline({ onComplete: () => void (swapping = false) })
          .to(label, { autoAlpha: 0, duration: 0.15 }, 0)
          .to(win, { scale: flood, duration: 0.6, ease: "power3.in", onUpdate: applyWin }, 0)
          .add(() => {
            toggleRoles();
            win.scale = 0;
            applyWin();
          })
          .to(win, { scale: 1, duration: 0.7, ease: "back.out(1.7)", onUpdate: applyWin }, "+=0.05")
          .to(label, { autoAlpha: 1, duration: 0.3 }, "-=0.2");
      });

      measure();
      document.fonts.ready.then(write);
      const ro = new ResizeObserver(measure);
      ro.observe(hero);
      // the clock's text changes width once it hydrates (and with the time), so re-check the flip
      const labelRo = new ResizeObserver(() => write());
      labelRo.observe(label);
      hero.addEventListener("pointermove", onPointer);
      hero.addEventListener("touchstart", onTouch, { passive: true });
      hero.addEventListener("touchmove", onTouch, { passive: true });
      gsap.ticker.add(tick);

      // Intro
      if (!reduce) {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from(".hero-line", { yPercent: 115, duration: 1.3, stagger: 0.08 }, 0.15)
          .from(".hero-portrait", { yPercent: 12, autoAlpha: 0, duration: 1.6 }, 0.35)
          .from(".hero-note", { autoAlpha: 0, duration: 0.8, stagger: 0.04 }, 0.8)
          .from(".hero-cross-v", { scaleY: 0, duration: 1.4, ease: "expo.inOut" }, 0.6)
          .from(".hero-cross-h", { scaleX: 0, duration: 1.4, ease: "expo.inOut" }, 0.6)
          .from(".hero-frame", { scale: 0, duration: 0.9, ease: "back.out(1.6)" }, 1.2)
          .from(".hero-time, .hero-cue, .hero-swap", { autoAlpha: 0, duration: 0.8 }, 1.4);
      }

      return () => {
        ro.disconnect();
        labelRo.disconnect();
        hero.removeEventListener("pointermove", onPointer);
        hero.removeEventListener("touchstart", onTouch);
        hero.removeEventListener("touchmove", onTouch);
        gsap.ticker.remove(tick);
      };
    },
    { scope: heroRef },
  );

  return (
    <section ref={heroRef} id="top" className="hero relative isolate h-svh min-h-[560px] w-full overflow-hidden bg-cream">
      <h1 className="sr-only">
        {swapped
          ? "I’m just a child inside. Mohammed Yaseen Agha — Software Engineer."
          : "Mohammed Yaseen Agha — Software Engineer. I’m just a child inside."}
      </h1>

      {/* Layer stacking (normal ↔ swapped) lives in CSS on [data-swapped]. */}
      <div aria-hidden className="layer-y-text absolute inset-0 bg-cream">
        <div className="stage" data-stage>
          <YaseenText />
        </div>
      </div>

      <div aria-hidden className="layer-cross pointer-events-none absolute inset-0">
        <div className="hero-cross-v dash-v absolute inset-y-0 w-px" style={{ left: "var(--mx)" }} />
        <div className="hero-cross-h dash-h absolute inset-x-0 h-px" style={{ top: "var(--my)" }} />
      </div>

      <div aria-hidden className="layer-y-portrait pointer-events-none absolute inset-0">
        <div className="stage">
          <div className="hero-portrait hero-portrait-box">
            <Image
              src="/images/ME_STEVE_JOBS_LIKE_POSE (1).png"
              alt=""
              width={654}
              height={783}
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 768px) 60vw, 116vw"
            />
          </div>
        </div>
      </div>

      <div className="layer-child absolute inset-0 bg-cream">
        <div className="stage">
          <ChildLayer />
        </div>
      </div>

      {/* Window frame, clock, swap button — always on top */}
      <div className="hero-chrome pointer-events-none absolute inset-0 z-40">
        <div
          aria-hidden
          className="absolute"
          style={{ left: "var(--mx)", top: "var(--my)", width: "var(--win)", height: "var(--win)", translate: "-50% -50%" }}
        >
          <div className="hero-frame size-full border-[3px] border-ink" />
        </div>
        <p aria-hidden className="hero-time absolute whitespace-nowrap font-pixel tracking-[0.08em] text-pure-black">
          YOUR TIME: <HeroClock viewer />
        </p>
        <div className="stage">
          <Place {...SWAP_BTN} className="hero-swap pointer-events-auto min-w-[26px]">
            <button
              type="button"
              onClick={() => swapRef.current()}
              aria-label={swapped ? "Show the software engineer" : "Show the child inside"}
              aria-pressed={swapped}
              title="Swap layers"
              className="group flex aspect-square w-full items-center justify-center rounded-full border-[1.5px] border-accent bg-cream text-accent transition-colors duration-200 hover:bg-accent hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="square"
                className="size-[55%] transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]"
                style={{ rotate: swapped ? "180deg" : "0deg" }}
              >
                <path d="M7 4v14M3 14l4 4 4-4M17 20V6M13 10l4-4 4 4" />
              </svg>
            </button>
          </Place>
        </div>
      </div>

      <ScrollCue target="#experience" />
    </section>
  );
}

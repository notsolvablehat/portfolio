"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Place, { type Spec } from "./Place";
import HeroClock from "./HeroClock";
import ScrollCue from "./ScrollCue";
import { SITE } from "@/lib/site";

gsap.registerPlugin(useGSAP);

/* ─── Composition ───────────────────────────────────────────────────────────
   Desktop numbers are measured from the 2000×1218 reference (px / 20 = cqw).
   Both layers share these coordinates so the window lines up perfectly.     */

const ROW_1 = { d: [24.75, 10.4, undefined, 7], m: [7, 14, undefined, 14.5] } as const;
const ROW_A = { d: [32.6, 21.2, undefined, 6.6], m: [7, 26.5, undefined, 13] } as const;
const ROW_3 = { d: [15.25, 32.2, undefined, 7.85], m: [7, 33.5, undefined, 15] } as const;

const PORTRAIT = { d: [25.4, 0, 45.5], m: [-8, 0, 116] } as const;

/** Window as a fraction of stage width. */
const WINDOW_SIZE = { desktop: 0.074, mobile: 0.3 };

type Note = { text: ReactNode; d: Spec; m: Spec; href?: string; className?: string };
const NOTE_F = { d: 1.12, m: 3.1 };

const NOTES: Note[] = [
  { text: "[I like F1]", d: [5.15, 12.6], m: [6, 51.8] },
  { text: "[Wanna be successful by 25]", d: [53.1, 9.15], m: [7, 9.6] },
  { text: "[IRON MAN !!]", d: [83.5, 15.75], m: [70, 49.8] },
  { text: "[OCCASIONALLY WATCH FOOTBALL]", d: [60.4, 33.6], m: [39, 72.6, 32] },
  { text: "[THIS HAS TO BE MY FIRST BIKE]", d: [19.85, 47.8], m: [6, 71, 30] },
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
    m: [70, 80, 22],
    href: SITE.resume,
    className: "text-center leading-[1.55] underline-offset-4 hover:underline",
  },
];

type Poster = { src: string; alt: string; w: number; h: number; d: Spec; m: Spec; home?: boolean };
const POSTERS: Poster[] = [
  { src: "/images/max_verstappen.png", alt: "Max Verstappen F1 poster", w: 188, h: 188, d: [7.55, 16.6, 13.05], m: [6, 55, 28] },
  { src: "/images/porsche.png", alt: "Porsche 911 GT3 RS poster", w: 195, h: 260, d: [59.6, 12.35, 13.5], m: [38, 52.5, 27] },
  { src: "/images/iron_man.png", alt: "Iron Man", w: 151, h: 358, d: [83.35, 17.75, 10.5], m: [72, 53, 20], home: true },
  { src: "/images/pele_footballer.png", alt: "Pelé poster", w: 153, h: 272, d: [67.3, 37.1, 10.6], m: [42, 79, 20] },
  { src: "/images/himmy_450.png", alt: "Royal Enfield Himalayan 450 poster", w: 178, h: 238, d: [43.85, 41.9, 12.3], m: [8, 77, 25] },
];

const BIG = "font-sans font-bold leading-none tracking-[-0.015em] text-ink whitespace-nowrap";
const NOTE = "font-pixel text-accent leading-[1.4] tracking-[0.06em]";

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
          <span className="block md:inline">{first}</span>
          <span className="hidden md:inline"> </span>
        </span>
        <span className="block pl-[14cqw] md:inline md:pl-0">{second}</span>
      </Mask>
    </Place>
  );
}

/** The layer everyone sees first. */
function SurfaceText() {
  return (
    <>
      <Place {...ROW_1} className={BIG}>
        <Mask>
          <span className="font-display font-normal">I’m</span> <span className="text-accent">Yaseen</span>
        </Mask>
      </Place>
      <Place d={[59, 18.65, undefined, NOTE_F.d]} m={[52, 24.6, undefined, NOTE_F.m]} className={`${NOTE} hero-note tracking-[0.12em]`}>
        [{SITE.handle}]
      </Place>
      <Place {...ROW_A} className={`${BIG} font-display font-normal`}>
        <Mask>a</Mask>
      </Place>
      <Headline first="Software" second="Engineer" />
    </>
  );
}

/** The layer underneath, seen only through the window. */
function HiddenLayer() {
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
        <Place key={p.src} d={p.d} m={p.m} data-window-home={p.home || undefined} className="hero-note">
          <Image src={p.src} alt={p.alt} width={p.w} height={p.h} loading="eager" sizes="(min-width: 768px) 14vw, 30vw" className="h-auto w-full" />
        </Place>
      ))}

      {NOTES.map((n, i) => {
        const cls = `${NOTE} hero-note ${n.className ?? ""}`;
        const d: Spec = [n.d[0], n.d[1], n.d[2], NOTE_F.d];
        const m: Spec = [n.m[0], n.m[1], n.m[2], NOTE_F.m];
        return n.href ? (
          <Place key={i} d={d} m={m} className={cls}>
            <a href={n.href} target="_blank" rel="noreferrer">
              {n.text}
            </a>
          </Place>
        ) : (
          <Place key={i} d={d} m={m} className={cls}>
            {n.text}
          </Place>
        );
      })}
    </>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  // Window tracking: pointer/touch sets a target; the ticker eases toward it
  // and writes --mx/--my/--win on the hero, which CSS turns into clip + frame.
  useGSAP(
    () => {
      const hero = heroRef.current!;
      const stage = hero.querySelector<HTMLElement>("[data-stage]")!;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 768px)");
      const target = { x: 0, y: 0 };
      const cur = { x: 0, y: 0 };
      let touched = false;

      const homePoint = () => {
        const h = hero.getBoundingClientRect();
        const r = hero.querySelector("[data-window-home]")!.getBoundingClientRect();
        return { x: r.left + r.width * 0.5 - h.left, y: r.top + r.height * 0.24 - h.top };
      };

      const measure = () => {
        const w = stage.getBoundingClientRect().width;
        const win = desktop.matches ? Math.max(84, w * WINDOW_SIZE.desktop) : Math.max(104, w * WINDOW_SIZE.mobile);
        hero.style.setProperty("--win", `${win}px`);
        if (!touched) {
          Object.assign(target, homePoint());
          Object.assign(cur, target);
          write();
        }
      };

      // Clock label: top-right of the window (below it on phones); flips to the
      // other side when it would run off the right edge. Positioning is in CSS.
      const label = hero.querySelector<HTMLElement>(".hero-time")!;
      let flipped = false;
      const write = () => {
        hero.style.setProperty("--mx", `${cur.x}px`);
        hero.style.setProperty("--my", `${cur.y}px`);
        const win = parseFloat(hero.style.getPropertyValue("--win")) || 120;
        const left = desktop.matches ? cur.x + win * 0.35 : cur.x - win / 2;
        const room = hero.clientWidth - left - 16;
        const flip = flipped ? room < label.offsetWidth + 40 : room < label.offsetWidth;
        if (flip !== flipped) {
          flipped = flip;
          label.toggleAttribute("data-flip", flip);
        }
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

      measure();
      document.fonts.ready.then(() => write());
      const ro = new ResizeObserver(measure);
      ro.observe(hero);
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
          .from(".hero-time, .hero-cue", { autoAlpha: 0, duration: 0.8 }, 1.4);
      }

      return () => {
        ro.disconnect();
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
      <h1 className="sr-only">Mohammed Yaseen Agha — Software Engineer. I’m just a child inside.</h1>

      {/* 1 · surface text */}
      <div aria-hidden className="stage z-0" data-stage>
        <SurfaceText />
      </div>

      {/* 2 · crosshair through the window centre (behind the portrait) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
        <div className="hero-cross-v dash-v absolute inset-y-0 w-px" style={{ left: "var(--mx)" }} />
        <div className="hero-cross-h dash-h absolute inset-x-0 h-px" style={{ top: "var(--my)" }} />
      </div>

      {/* 3 · portrait cut-out */}
      <div aria-hidden className="stage pointer-events-none z-20">
        <Place d={PORTRAIT.d} m={PORTRAIT.m} className="hero-portrait top-auto! bottom-0">
          <Image
            src="/images/ME_STEVE_JOBS_LIKE_POSE.png"
            alt=""
            width={654}
            height={783}
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 768px) 46vw, 116vw"
            className="h-auto w-full"
          />
        </Place>
      </div>

      {/* 4 · hidden layer, clipped to the window */}
      <div className="reveal absolute inset-0 z-30 bg-cream">
        <div className="stage">
          <HiddenLayer />
        </div>
      </div>

      {/* 5 · window frame + clock */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-40">
        <div
          className="absolute"
          style={{ left: "var(--mx)", top: "var(--my)", width: "var(--win)", height: "var(--win)", translate: "-50% -50%" }}
        >
          <div className="hero-frame size-full border-[3px] border-ink" />
        </div>
        <p
          className="hero-time absolute whitespace-nowrap font-pixel tracking-[0.08em] text-pure-black"
        >
          CURRENT TIME: <HeroClock /> IST
        </p>
      </div>

      <ScrollCue target="#work" />
    </section>
  );
}

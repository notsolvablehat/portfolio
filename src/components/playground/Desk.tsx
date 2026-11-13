"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type Matter from "matter-js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DESK_NOTES, DESK_POSTERS, MAX_COINS } from "@/lib/desk";
import { cn } from "@/lib/utils";
import Icon from "@/components/ui/Icon";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const COIN_KEY = "desk:coins";
type Api = { syncCoins: (ids: number[]) => void };

/** Width in desk units (`--u`, set from the desk's width). */
const u = (n: number, min = 0): CSSProperties => ({ width: `max(${min}px, calc(var(--u) * ${n}))` });

/**
 * The "child inside" desk: the hero's posters and notes, now physical.
 * Drag, throw and stack them (matter-js, rendered as DOM). A tap instead of
 * a drag flips a note or opens what an item links to; coins dropped in the
 * jar are counted for this visitor.
 */
export default function Desk() {
  const ref = useRef<HTMLElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const jarRef = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<string, HTMLElement>());
  const api = useRef<Api | null>(null);
  const coinId = useRef(0);
  const router = useRouter();

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [coins, setCoins] = useState<number[]>([]);
  const [jarCount, setJarCount] = useState(0);

  const register = (id: string) => (el: HTMLElement | null) => {
    if (el) els.current.set(id, el);
    else els.current.delete(id);
  };

  const act = (id: string) => {
    const note = DESK_NOTES.find((n) => n.id === id);
    if (note?.href) return void window.open(note.href, "_blank", "noopener");
    if (note?.back) return setFlipped((f) => ({ ...f, [id]: !f[id] }));
    const poster = DESK_POSTERS.find((p) => p.id === id);
    if (poster?.href) router.push(poster.href);
  };
  const actRef = useRef(act);
  useEffect(() => {
    actRef.current = act;
  });

  const dropCoin = () => setCoins((c) => [...c, coinId.current++].slice(-MAX_COINS));

  // Physics world — created when the desk first scrolls into view.
  useEffect(() => {
    const desk = deskRef.current!;
    const jarEl = jarRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let teardown = () => {};

    const unitFor = (w: number) => (w < 640 ? w / 60 : w / 100);
    desk.style.setProperty("--u", `${unitFor(desk.clientWidth)}px`);

    const boot = async () => {
      const M = (await import("matter-js")).default;
      if (disposed) return;
      const { Engine, Runner, Bodies, Body, Composite, Constraint, Events, Sleeping } = M;

      const engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = 1.1;
      const runner = Runner.create();
      type Toy = { body: Matter.Body; el: HTMLElement; w: number; h: number; coin?: boolean; counted?: boolean };
      const toys = new Map<string, Toy>();
      let W = desk.clientWidth;
      let H = desk.clientHeight;
      let unit = unitFor(W);
      let statics: Matter.Body[] = [];
      let jar = { l: 0, r: 0, top: 0 };
      let z = 10;

      const rand = (a: number, b: number) => a + Math.random() * (b - a);

      // Walls, a ceiling well above the desk (throws come back down) and the jar.
      const build = () => {
        Composite.remove(engine.world, statics);
        const T = 400;
        const jw = Math.max(76, unit * 12);
        const jh = Math.max(90, unit * 15);
        const jr = W - Math.max(16, unit * 4);
        jar = { l: jr - jw, r: jr, top: H - jh };
        const glass = { isStatic: true, friction: 0.2 };
        statics = [
          Bodies.rectangle(W / 2, H + T / 2, W * 3, T, { isStatic: true, friction: 0.8 }),
          Bodies.rectangle(-T / 2, H / 2 - H, T, H * 4, { isStatic: true }),
          Bodies.rectangle(W + T / 2, H / 2 - H, T, H * 4, { isStatic: true }),
          Bodies.rectangle(W / 2, -H * 1.5 - T / 2, W * 3, T, { isStatic: true }),
          Bodies.rectangle(jar.l, H - jh / 2, 6, jh, glass),
          Bodies.rectangle(jar.r, H - jh / 2, 6, jh, glass),
        ];
        Composite.add(engine.world, statics);
        Object.assign(jarEl.style, { left: `${jar.l - 3}px`, width: `${jw + 6}px`, height: `${jh}px`, opacity: "1" });
      };

      const add = (id: string, at: { x: number; y: number }, coin = false) => {
        const el = els.current.get(id);
        if (!el || toys.has(id)) return;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const body = coin
          ? Bodies.circle(at.x, at.y, w / 2, { restitution: 0.45, friction: 0.05, density: 0.004 })
          : Bodies.rectangle(at.x, at.y, w, h, {
              restitution: 0.2,
              friction: 0.6,
              frictionAir: 0.015,
              angle: rand(-0.35, 0.35),
              chamfer: { radius: Math.min(6, w * 0.05) },
            });
        toys.set(id, { body, el, w, h, coin });
        Composite.add(engine.world, body);
        el.style.opacity = "1";
      };

      const remove = (id: string) => {
        const t = toys.get(id);
        if (!t) return;
        Composite.remove(engine.world, t.body);
        toys.delete(id);
      };

      // DOM follows the bodies.
      Events.on(engine, "afterUpdate", () => {
        toys.forEach((t) => {
          const { position: p, velocity: v } = t.body;
          const speed = Math.hypot(v.x, v.y);
          if (speed > 45) Body.setVelocity(t.body, { x: (v.x / speed) * 45, y: (v.y / speed) * 45 });
          if (p.y > H + 300 || p.x < -300 || p.x > W + 300) {
            Body.setPosition(t.body, { x: W / 2, y: -t.h });
            Body.setVelocity(t.body, { x: 0, y: 0 });
          }
          t.el.style.transform = `translate(${p.x - t.w / 2}px, ${p.y - t.h / 2}px) rotate(${t.body.angle}rad)`;
          if (t.coin && !t.counted && p.x > jar.l && p.x < jar.r && p.y > jar.top + t.h / 2) {
            t.counted = true;
            setJarCount((n) => n + 1);
            try {
              localStorage.setItem(COIN_KEY, String(Number(localStorage.getItem(COIN_KEY) || 0) + 1));
            } catch {}
          }
        });
      });

      // Dragging: a spring from the pointer to the grabbed point of the body.
      let drag: { id: string; c: Matter.Constraint; x0: number; y0: number; t0: number } | null = null;
      const local = (e: PointerEvent) => {
        const r = desk.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };
      const onDown = (e: PointerEvent) => {
        const el = (e.target as HTMLElement).closest<HTMLElement>("[data-toy]");
        const id = el?.dataset.toy;
        const t = id && toys.get(id);
        if (!el || !id || !t) return;
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        const p = local(e);
        Sleeping.set(t.body, false);
        const c = Constraint.create({
          pointA: p,
          bodyB: t.body,
          pointB: { x: p.x - t.body.position.x, y: p.y - t.body.position.y },
          length: 0,
          stiffness: 0.2,
          damping: 0.1,
        });
        Composite.add(engine.world, c);
        drag = { id, c, x0: e.clientX, y0: e.clientY, t0: performance.now() };
        el.style.zIndex = String(++z);
        el.style.cursor = "grabbing";
      };
      const onMove = (e: PointerEvent) => {
        if (drag) drag.c.pointA = local(e);
      };
      const onUp = (e: PointerEvent) => {
        if (!drag) return;
        const { id, c, x0, y0, t0 } = drag;
        Composite.remove(engine.world, c);
        const el = toys.get(id)?.el;
        if (el) el.style.cursor = "";
        drag = null;
        if (e.type === "pointerup" && Math.hypot(e.clientX - x0, e.clientY - y0) < 6 && performance.now() - t0 < 350) actRef.current(id);
      };
      desk.addEventListener("pointerdown", onDown);
      desk.addEventListener("pointermove", onMove);
      desk.addEventListener("pointerup", onUp);
      desk.addEventListener("pointercancel", onUp);

      // Rescale everything when the desk changes size.
      const ro = new ResizeObserver(() => {
        const nW = desk.clientWidth;
        const nH = desk.clientHeight;
        if (nW === W && nH === H) return;
        const nUnit = unitFor(nW);
        desk.style.setProperty("--u", `${nUnit}px`);
        const f = nUnit / unit;
        toys.forEach((t) => {
          Body.scale(t.body, f, f);
          t.w = t.el.offsetWidth;
          t.h = t.el.offsetHeight;
          Body.setPosition(t.body, { x: (t.body.position.x * nW) / W, y: Math.min(t.body.position.y * f, nH - t.h) });
        });
        W = nW;
        H = nH;
        unit = nUnit;
        build();
      });
      ro.observe(desk);

      build();

      // Drop the toys in, staggered; reduced motion places them on the desk instead.
      const ids = [...DESK_POSTERS.map((p) => p.id), ...DESK_NOTES.map((n) => n.id)];
      const timers = ids.map((id, i) =>
        window.setTimeout(
          () => {
            const el = els.current.get(id);
            const h = el?.offsetHeight ?? 100;
            const x = rand(unit * 8, Math.max(unit * 9, jar.l - unit * 8));
            add(id, { x, y: reduce ? H - h / 2 - 1 : -h - rand(0, 160) });
          },
          reduce ? 0 : i * 110,
        ),
      );

      // Run the simulation only while the desk is on screen.
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? Runner.run(runner, engine) : Runner.stop(runner)));
      io.observe(desk);

      try {
        setJarCount(Number(localStorage.getItem(COIN_KEY) || 0));
      } catch {}

      api.current = {
        syncCoins: (list) => {
          const want = new Set(list.map((n) => `coin-${n}`));
          toys.forEach((t, id) => t.coin && !want.has(id) && remove(id));
          list.forEach((n) => add(`coin-${n}`, { x: rand(jar.l + 14, jar.r - 14), y: -40 }, true));
        },
      };

      teardown = () => {
        timers.forEach(clearTimeout);
        io.disconnect();
        ro.disconnect();
        desk.removeEventListener("pointerdown", onDown);
        desk.removeEventListener("pointermove", onMove);
        desk.removeEventListener("pointerup", onUp);
        desk.removeEventListener("pointercancel", onUp);
        Runner.stop(runner);
        Engine.clear(engine);
        api.current = null;
      };
    };

    // Boot once the desk is near the viewport.
    const lazy = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        lazy.disconnect();
        void boot();
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    lazy.observe(desk);

    return () => {
      disposed = true;
      lazy.disconnect();
      teardown();
    };
  }, []);

  useEffect(() => {
    api.current?.syncCoins(coins);
  }, [coins]);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap
        .timeline({ scrollTrigger: { trigger: ".desk-head", start: "top 70%" } })
        .from(".desk-letter", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.06 })
        .from(".desk-kicker", { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08 }, 0.2);
    },
    { scope: ref },
  );

  const toy = "absolute top-0 left-0 cursor-grab touch-none opacity-0 select-none will-change-transform";

  return (
    <section ref={ref} id="playground" className="relative z-10 overflow-x-clip bg-cream">
      <div className="mx-auto max-w-[1680px] px-[max(20px,6.5vw)] pt-[clamp(40px,5vw,90px)] pb-[clamp(80px,9vw,160px)]">
        <header className="desk-head flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="desk-kicker mb-2 font-pixel text-[clamp(12px,1vw,18px)] tracking-[0.14em] text-accent">[I&apos;M JUST A CHILD INSIDE.]</p>
            <h2 className="flex overflow-hidden font-display text-[clamp(72px,13vw,240px)] leading-[0.85] text-ink" aria-label="Play">
              {"PLAY".split("").map((l, i) => (
                <span key={i} aria-hidden className="desk-letter inline-block">
                  {l}
                </span>
              ))}
            </h2>
          </div>
          <p className="desk-kicker pb-[1vw] font-pixel text-[clamp(12px,0.95vw,17px)] leading-[1.7] tracking-[0.12em] text-ink md:text-right">
            GRAB · THROW · STACK
            <br />
            <span className="text-ink/60">TAP A NOTE TO FLIP IT</span>
          </p>
        </header>

        <div
          ref={deskRef}
          className="relative mt-[clamp(32px,4vw,64px)] h-[clamp(480px,76svh,860px)] overflow-hidden border-b-[3px] border-ink select-none"
        >
          <span aria-hidden className="dash-h absolute inset-x-0 top-0 h-px opacity-50" />

          {/* the coin jar (its glass walls are physics bodies) */}
          <div ref={jarRef} aria-hidden className="absolute bottom-0 opacity-0">
            <div className="absolute inset-0 rounded-b-[14px] border-[3px] border-t-0 border-ink/50 bg-white/40" />
            <p className="absolute right-0 bottom-full mb-3 text-right font-pixel text-[clamp(10px,0.8vw,13px)] leading-[1.6] tracking-[0.1em] whitespace-nowrap text-ink">
              <span className="text-accent">[{String(jarCount).padStart(2, "0")}]</span> IN THE JAR
            </p>
          </div>
          <button
            type="button"
            onClick={dropCoin}
            className="absolute top-4 right-[max(16px,calc(var(--u)*4))] z-[5] font-pixel text-[clamp(11px,0.85vw,15px)] tracking-[0.14em] text-accent transition-opacity hover:opacity-75"
          >
            [DROP A COIN <Icon name="arrow_downward" />]
          </button>

          {DESK_POSTERS.map((p) => (
            <button
              key={p.id}
              ref={register(p.id)}
              data-toy={p.id}
              type="button"
              aria-label={p.alt}
              onClick={(e) => e.detail === 0 && act(p.id)}
              className={cn(toy, "group")}
              style={{ ...u(p.size, 56), aspectRatio: `${p.w} / ${p.h}` }}
            >
              <Image src={p.src} alt="" fill sizes="(min-width: 640px) 12vw, 25vw" draggable={false} className="pointer-events-none object-contain drop-shadow-[0_8px_14px_rgba(50,50,50,0.18)]" />
              {p.hint && (
                <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 font-pixel text-[10px] tracking-[0.14em] whitespace-nowrap text-accent">
                  [{p.hint}]
                </span>
              )}
            </button>
          ))}

          {DESK_NOTES.map((n) => (
            <button
              key={n.id}
              ref={register(n.id)}
              data-toy={n.id}
              type="button"
              aria-label={n.back ? `${n.front} — flip for more` : n.front}
              onClick={(e) => e.detail === 0 && act(n.id)}
              className={cn(toy, "[perspective:700px]")}
              style={u(14, 100)}
            >
              <span
                className={cn(
                  "relative block transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] [transform-style:preserve-3d]",
                  flipped[n.id] && "[transform:rotateY(180deg)]",
                )}
              >
                <span className="block bg-white px-3 py-3 text-left font-pixel text-[clamp(10px,calc(var(--u)*1.05),15px)] leading-[1.45] tracking-[0.06em] text-accent shadow-[0_6px_16px_rgba(50,50,50,0.16)] [backface-visibility:hidden]">
                  {n.front}
                  <span className="mt-2 block text-right text-[0.85em] text-ink/40">{n.href ? <>[OPEN <Icon name="arrow_outward" />]</> : "[TAP TO FLIP]"}</span>
                </span>
                {n.back && (
                  <span className="absolute inset-0 flex items-center bg-ink px-3 text-left font-sans text-[clamp(10px,calc(var(--u)*1),14px)] leading-snug text-cream [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    {n.back}
                  </span>
                )}
              </span>
            </button>
          ))}

          {coins.map((c) => (
            <button
              key={c}
              ref={register(`coin-${c}`)}
              data-toy={`coin-${c}`}
              type="button"
              aria-label="Coin"
              tabIndex={-1}
              className={cn(toy, "grid aspect-square place-items-center rounded-full bg-accent font-sans text-[clamp(11px,calc(var(--u)*1.4),18px)] font-bold text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)]")}
              style={u(3.2, 26)}
            >
              ₹
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

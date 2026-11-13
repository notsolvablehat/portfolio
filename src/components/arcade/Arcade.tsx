"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { CreateGame, Game, Key } from "./engine";

type Meta = {
  id: string;
  name: string;
  help: string;
  /** Lower scores are better (reaction time). */
  lower?: boolean;
  unit?: string;
  load: () => Promise<{ default: CreateGame }>;
};

const GAMES: Meta[] = [
  { id: "snake", name: "SNAKE", help: "ARROWS TO STEER · EAT THE COINS · DON'T BITE YOURSELF", load: () => import("./games/snake") },
  { id: "stacker", name: "STACKER", help: "LEFT / RIGHT MOVE · UP ROTATE · DOWN DROP · SPACE SLAM", load: () => import("./games/stacker") },
  { id: "pitstop", name: "PIT STOP", help: "WAIT FOR LIGHTS OUT · THEN SPACE / TAP · DON'T JUMP THE START", lower: true, unit: "MS", load: () => import("./games/pitstop") },
  { id: "runner", name: "BIKE RUN", help: "SPACE / UP / TAP TO JUMP · HOLD FOR HIGHER", unit: "M", load: () => import("./games/runner") },
  { id: "breaker", name: "BREAKER", help: "LEFT / RIGHT OR MOUSE · SPACE / TAP TO LAUNCH · A NEW WORD EVERY ROUND", load: () => import("./games/breaker") },
];

const KEYS: Record<string, Key> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
  " ": "action",
  Enter: "action",
};

// Best scores live in localStorage, read through useSyncExternalStore.
const BEST_KEY = "arcade:best";
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const readBest = () => {
  try {
    return localStorage.getItem(BEST_KEY) ?? "{}";
  } catch {
    return "{}";
  }
};
function saveBest(id: string, value: number, lower?: boolean) {
  if (!lower && value <= 0) return false;
  const all = JSON.parse(readBest()) as Record<string, number>;
  const prev = all[id];
  const better = prev === undefined || (lower ? value < prev : value > prev);
  if (!better) return false;
  all[id] = value;
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(all));
  } catch {}
  listeners.forEach((l) => l());
  return true;
}

const fmt = (n: number | undefined, unit?: string) => (n === undefined ? "--" : `${n}${unit ? ` ${unit}` : ""}`);

const PAD: { k: Key; icon?: IconName; label?: string; area: string }[] = [
  { k: "up", icon: "arrow_upward", area: "col-start-2 row-start-1" },
  { k: "left", icon: "arrow_back", area: "col-start-1 row-start-2" },
  { k: "right", icon: "arrow_forward", area: "col-start-3 row-start-2" },
  { k: "down", icon: "arrow_downward", area: "col-start-2 row-start-3" },
];

/** A small arcade: pick a cartridge, play on the shared screen, beat your best. */
export default function Arcade() {
  const [id, setId] = useState(GAMES[0].id);
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const best = JSON.parse(useSyncExternalStore(subscribe, readBest, () => "{}")) as Record<string, number>;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const meta = GAMES.find((g) => g.id === id)!;

  // Load and create the selected game.
  useEffect(() => {
    let dead = false;
    const canvas = canvasRef.current!;
    const m = GAMES.find((g) => g.id === id)!;
    m.load().then(({ default: create }) => {
      if (dead) return;
      gameRef.current = create(canvas, {
        score: (n) => setScore(n),
        over: (n, opts) => {
          setStatus("over");
          setScore(n);
          const record = opts?.record ?? true;
          const isBest = record && saveBest(m.id, n, m.lower);
          setNote(opts?.note ?? (isBest ? "NEW BEST!" : null));
        },
      });
      gameRef.current.draw();
    });
    const ro = new ResizeObserver(() => gameRef.current?.draw());
    ro.observe(canvas);
    return () => {
      dead = true;
      ro.disconnect();
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [id]);

  const pick = (next: string) => {
    if (next === id) return;
    setId(next);
    setStatus("idle");
    setScore(0);
    setNote(null);
  };

  const start = () => {
    if (!gameRef.current) return;
    setStatus("playing");
    setScore(0);
    setNote(null);
    gameRef.current.start();
    screenRef.current?.focus({ preventScroll: true });
  };

  const press = (k: Key, down: boolean) => {
    if (status !== "playing") {
      if (down && k === "action") start();
      return;
    }
    gameRef.current?.key(k, down);
  };

  const onKey = (e: KeyboardEvent, down: boolean) => {
    const k = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (!k) return;
    e.preventDefault(); // keep arrows / space from scrolling the page
    if (down && e.repeat && k === "action") return;
    press(k, down);
  };

  return (
    <section id="arcade" className="relative z-10 bg-cream">
    <div className="mx-auto max-w-[1680px] px-[max(20px,6.5vw)] pt-[clamp(40px,5vw,90px)] pb-[clamp(80px,9vw,160px)]">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-dashed border-ink pb-4">
        <h3 className="font-display text-[clamp(32px,4vw,64px)] leading-none text-ink">ARCADE</h3>
        <p className="font-pixel text-[clamp(11px,0.85vw,15px)] tracking-[0.14em] text-accent">[PICK A GAME · BEST SCORES STAY ON THIS DEVICE]</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-12 md:gap-[3vw]">
        {/* Cartridges */}
        <ul className="-mx-[max(20px,6.5vw)] flex gap-3 overflow-x-auto px-[max(20px,6.5vw)] pb-2 md:col-span-3 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
          {GAMES.map((g, i) => (
            <li key={g.id} className="shrink-0">
              <button
                type="button"
                onClick={() => pick(g.id)}
                aria-pressed={g.id === id}
                className={cn(
                  "group flex w-full min-w-[150px] items-center justify-between gap-4 border-[2px] px-4 py-3 text-left transition-colors duration-150",
                  g.id === id ? "border-ink bg-ink text-cream" : "border-ink/25 text-ink hover:border-accent",
                )}
              >
                <span>
                  <span className={cn("block font-pixel text-[10px] tracking-[0.14em]", g.id === id ? "text-accent" : "text-ink/50")}>[{String(i + 1).padStart(2, "0")}]</span>
                  <span className="mt-1 block font-display text-[clamp(16px,1.3vw,22px)] leading-none">{g.name}</span>
                </span>
                <span className={cn("text-right font-pixel text-[10px] leading-[1.5] tracking-[0.1em]", g.id === id ? "text-cream/70" : "text-ink/60")}>
                  BEST
                  <br />
                  {fmt(best[g.id], g.unit)}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Screen */}
        <div className="md:col-span-9">
          <div className="flex items-center justify-between gap-4 font-pixel text-[clamp(11px,0.85vw,15px)] tracking-[0.12em] text-ink">
            <span>{meta.name}</span>
            <span>
              SCORE <span className="text-accent">{fmt(status === "idle" ? undefined : score, meta.unit)}</span>
              <span className="mx-3 text-ink/30">/</span>
              BEST <span className="text-accent">{fmt(best[id], meta.unit)}</span>
            </span>
          </div>

          <div
            ref={screenRef}
            tabIndex={0}
            role="application"
            aria-label={`${meta.name} game. ${meta.help}`}
            onKeyDown={(e) => onKey(e, true)}
            onKeyUp={(e) => onKey(e, false)}
            onPointerDown={() => {
              screenRef.current?.focus({ preventScroll: true });
              if (status !== "playing") start();
              else if (gameRef.current?.tap) gameRef.current.key("action", true);
            }}
            onPointerUp={() => status === "playing" && gameRef.current?.tap && gameRef.current.key("action", false)}
            className="relative mt-3 aspect-[4/3] w-full touch-none overflow-hidden rounded-[10px] bg-ink outline-none select-none focus-visible:ring-4 focus-visible:ring-accent/40"
          >
            <canvas ref={canvasRef} className="absolute inset-0 size-full" />

            {status !== "playing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/70 px-6 text-center text-cream">
                {status === "over" ? (
                  <>
                    <p className="font-display text-[clamp(28px,4vw,56px)] leading-none">{note ?? "GAME OVER"}</p>
                    <p className="font-pixel text-[clamp(12px,1vw,16px)] tracking-[0.12em]">
                      SCORE <span className="text-accent">{fmt(score, meta.unit)}</span> · BEST <span className="text-accent">{fmt(best[id], meta.unit)}</span>
                    </p>
                  </>
                ) : (
                  <p className="font-display text-[clamp(28px,4vw,56px)] leading-none">{meta.name}</p>
                )}
                <p className="max-w-[46ch] font-pixel text-[clamp(10px,0.8vw,13px)] leading-[1.7] tracking-[0.12em] text-cream/70">{meta.help}</p>
                <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-pixel text-[clamp(11px,0.85vw,14px)] tracking-[0.14em] text-white">
                  {status === "over" ? "PLAY AGAIN" : "PRESS SPACE OR TAP TO PLAY"}
                </span>
              </div>
            )}
          </div>

          {/* Touch controls */}
          <div className="mt-5 hidden items-center justify-between pointer-coarse:flex">
            <div className="grid grid-cols-3 grid-rows-3 gap-1.5">
              {PAD.map((p) => (
                <button
                  key={p.k}
                  type="button"
                  aria-label={p.k}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    press(p.k, true);
                  }}
                  onPointerUp={() => press(p.k, false)}
                  onPointerLeave={() => press(p.k, false)}
                  className={cn("grid size-14 place-items-center rounded-[10px] bg-ink text-cream active:bg-accent", p.area)}
                >
                  <Icon name={p.icon!} className="size-6" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                press("action", true);
              }}
              onPointerUp={() => press("action", false)}
              className="grid size-20 place-items-center rounded-full bg-accent font-pixel text-[12px] tracking-[0.14em] text-white active:scale-95"
            >
              ACTION
            </button>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
}

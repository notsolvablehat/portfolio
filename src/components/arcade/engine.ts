/** Shared plumbing for the arcade games: input keys, the game contract, canvas fit and a frame loop. */

export type Key = "left" | "right" | "up" | "down" | "action";

export type GameApi = {
  /** Live score while playing. */
  score: (n: number) => void;
  /** The run ended. `record: false` keeps it off the best list (e.g. a jump start). */
  over: (n: number, opts?: { record?: boolean; note?: string }) => void;
};

export type Game = {
  start: () => void;
  key: (k: Key, down: boolean) => void;
  /** Redraw the current frame (after a resize, or while idle). */
  draw: () => void;
  destroy: () => void;
  /** A tap / click on the screen acts as "action" while playing. */
  tap?: boolean;
};

export type CreateGame = (canvas: HTMLCanvasElement, api: GameApi) => Game;

export const C = {
  bg: "#323232",
  fg: "#fdf0d5",
  accent: "#e63e21",
  white: "#ffffff",
  dim: "rgba(253, 240, 213, 0.1)",
  mid: "rgba(253, 240, 213, 0.45)",
};

let pixelFamily = "";
/** The pixel font's real family name (next/font generates it). */
export function pixelFont(size: number) {
  if (!pixelFamily) {
    const probe = document.createElement("span");
    probe.className = "font-pixel";
    document.body.appendChild(probe);
    pixelFamily = getComputedStyle(probe).fontFamily;
    probe.remove();
  }
  return `${size}px ${pixelFamily}`;
}

/**
 * Size the canvas to its box (crisp on HiDPI), clear it, and set a transform so
 * the game draws in its own w × h units, letterboxed and centred.
 */
export function fit(canvas: HTMLCanvasElement, w: number, h: number) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cw = canvas.clientWidth || 1;
  const ch = canvas.clientHeight || 1;
  const pw = Math.round(cw * dpr);
  const ph = Math.round(ch * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, pw, ph);
  const s = Math.min(cw / w, ch / h);
  const ox = (cw - w * s) / 2;
  const oy = (ch - h * s) / 2;
  ctx.setTransform(s * dpr, 0, 0, s * dpr, ox * dpr, oy * dpr);
  return { ctx, toLocal: (x: number, y: number) => ({ x: (x - ox) / s, y: (y - oy) / s }) };
}

/** requestAnimationFrame loop with a capped delta (ms). */
export function loop(step: (dt: number) => void) {
  let raf = 0;
  let last = 0;
  let on = false;
  const frame = (t: number) => {
    if (!on) return;
    const dt = last ? Math.min(50, t - last) : 16;
    last = t;
    step(dt);
    if (on) raf = requestAnimationFrame(frame);
  };
  return {
    start() {
      if (on) return;
      on = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      on = false;
      cancelAnimationFrame(raf);
    },
  };
}

export const randInt = (n: number) => Math.floor(Math.random() * n);

import { C, fit, loop, pixelFont, randInt, type CreateGame } from "../engine";

const W = 10;
const H = 20;
type Grid = number[][];

const SHAPES: Grid[] = [
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
];
const COLORS = [C.accent, C.fg, C.white, "#f2a48f", "#d8c9a8", C.accent, C.fg];
const LINE_POINTS = [0, 100, 300, 500, 800];

const rotate = (m: Grid) => m[0].map((_, i) => m.map((r) => r[i]).reverse());

type Piece = { m: Grid; t: number; x: number; y: number };

/** Stacker: falling blocks. Fill a row to clear it; it speeds up every 10 rows. */
const create: CreateGame = (canvas, api) => {
  let board: Grid = [];
  let cur: Piece | null = null;
  let next = randInt(7);
  let score = 0;
  let lines = 0;
  let acc = 0;
  let alive = false;
  let flash: number[] = [];
  let flashT = 0;

  const level = () => 1 + Math.floor(lines / 10);
  const dropMs = () => Math.max(90, 720 - (level() - 1) * 65);

  const fits = (m: Grid, x: number, y: number) =>
    m.every((row, j) => row.every((v, i) => !v || (x + i >= 0 && x + i < W && y + j < H && (y + j < 0 || !board[y + j][x + i]))));

  const spawn = () => {
    const t = next;
    next = randInt(7);
    const m = SHAPES[t];
    cur = { m, t, x: Math.floor((W - m[0].length) / 2), y: t === 0 ? -1 : 0 };
    if (!fits(cur.m, cur.x, cur.y)) end();
  };

  const end = () => {
    alive = false;
    run.stop();
    draw();
    api.over(score);
  };

  const lock = () => {
    if (!cur) return;
    const { m, t, x, y } = cur;
    m.forEach((row, j) => row.forEach((v, i) => v && y + j >= 0 && (board[y + j][x + i] = t + 1)));
    const full = board.map((r, j) => (r.every(Boolean) ? j : -1)).filter((j) => j >= 0);
    if (full.length) {
      board = board.filter((_, j) => !full.includes(j));
      while (board.length < H) board.unshift(Array(W).fill(0));
      lines += full.length;
      score += LINE_POINTS[full.length] * level();
      flash = full;
      flashT = 180;
    }
    api.score(score);
    cur = null;
    spawn();
  };

  const move = (dx: number, dy: number) => {
    if (cur && fits(cur.m, cur.x + dx, cur.y + dy)) {
      cur.x += dx;
      cur.y += dy;
      return true;
    }
    return false;
  };

  const cell = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x + 0.06, y + 0.06, 0.88, 0.88);
    ctx.globalAlpha = 1;
  };

  const draw = () => {
    const { ctx } = fit(canvas, 20, 21);
    const ox = 1;
    const oy = 0.5;
    ctx.save();
    ctx.translate(ox, oy);
    ctx.fillStyle = C.dim;
    for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) ctx.fillRect(x + 0.45, y + 0.45, 0.1, 0.1);
    ctx.strokeStyle = C.mid;
    ctx.lineWidth = 0.06;
    ctx.strokeRect(-0.05, -0.05, W + 0.1, H + 0.1);
    board.forEach((row, y) => row.forEach((v, x) => v && cell(ctx, x, y, COLORS[v - 1])));
    if (cur) {
      // ghost
      let gy = cur.y;
      while (fits(cur.m, cur.x, gy + 1)) gy++;
      const p = cur;
      p.m.forEach((row, j) => row.forEach((v, i) => v && cell(ctx, p.x + i, gy + j, COLORS[p.t], 0.18)));
      p.m.forEach((row, j) => row.forEach((v, i) => v && p.y + j >= 0 && cell(ctx, p.x + i, p.y + j, COLORS[p.t])));
    }
    if (flashT > 0) {
      ctx.fillStyle = `rgba(255,255,255,${flashT / 300})`;
      flash.forEach((y) => ctx.fillRect(0, y, W, 1));
    }
    ctx.restore();

    // side panel
    const sx = 12.5;
    ctx.fillStyle = C.mid;
    ctx.font = pixelFont(0.55);
    ctx.fillText("NEXT", sx, 1.6);
    const nm = SHAPES[next];
    nm.forEach((row, j) => row.forEach((v, i) => v && cell(ctx, sx + i, 2.3 + j, COLORS[next])));
    ctx.fillStyle = C.mid;
    ctx.fillText("LINES", sx, 8);
    ctx.fillText("LEVEL", sx, 11.5);
    ctx.fillStyle = C.fg;
    ctx.font = pixelFont(1.1);
    ctx.fillText(String(lines), sx, 9.5);
    ctx.fillText(String(level()), sx, 13);
  };

  const run = loop((dt) => {
    if (flashT > 0) flashT -= dt;
    acc += dt;
    if (alive && acc >= dropMs()) {
      acc = 0;
      if (!move(0, 1)) lock();
    }
    if (alive) draw();
  });

  const reset = () => {
    board = Array.from({ length: H }, () => Array(W).fill(0));
    score = 0;
    lines = 0;
    acc = 0;
    flashT = 0;
    next = randInt(7);
    cur = null;
  };
  reset();

  return {
    start() {
      reset();
      alive = true;
      spawn();
      run.start();
    },
    key(k, down) {
      if (!down || !alive || !cur) return;
      if (k === "left") move(-1, 0);
      else if (k === "right") move(1, 0);
      else if (k === "down") {
        if (move(0, 1)) {
          score += 1;
          acc = 0;
        } else lock();
        api.score(score);
      } else if (k === "up") {
        const r = rotate(cur.m);
        const kick = [0, -1, 1, -2, 2].find((dx) => fits(r, cur!.x + dx, cur!.y));
        if (kick !== undefined) {
          cur.m = r;
          cur.x += kick;
        }
      } else if (k === "action") {
        let n = 0;
        while (move(0, 1)) n++;
        score += n * 2;
        lock();
      }
      draw();
    },
    draw,
    destroy: () => run.stop(),
  };
};

export default create;

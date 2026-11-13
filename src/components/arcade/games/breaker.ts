import { C, fit, loop, pixelFont, type CreateGame } from "../engine";

const W = 32;
const H = 24;
const PADDLE = { w: 4.4, h: 0.5, y: 22 };
const BALL_R = 0.32;

/** 3×5 pixel letters — each word becomes the brick wall. */
const GLYPHS: Record<string, string[]> = {
  A: [".#.", "#.#", "###", "#.#", "#.#"],
  B: ["##.", "#.#", "##.", "#.#", "##."],
  C: [".##", "#..", "#..", "#..", ".##"],
  D: ["##.", "#.#", "#.#", "#.#", "##."],
  E: ["###", "#..", "##.", "#..", "###"],
  F: ["###", "#..", "##.", "#..", "#.."],
  G: [".##", "#..", "#.#", "#.#", ".##"],
  H: ["#.#", "#.#", "###", "#.#", "#.#"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  J: ["..#", "..#", "..#", "#.#", ".#."],
  K: ["#.#", "#.#", "##.", "#.#", "#.#"],
  L: ["#..", "#..", "#..", "#..", "###"],
  M: ["#.#", "###", "###", "#.#", "#.#"],
  N: ["##.", "#.#", "#.#", "#.#", "#.#"],
  O: [".#.", "#.#", "#.#", "#.#", ".#."],
  P: ["##.", "#.#", "##.", "#..", "#.."],
  Q: [".#.", "#.#", "#.#", "##.", ".##"],
  R: ["##.", "#.#", "##.", "#.#", "#.#"],
  S: [".##", "#..", ".#.", "..#", "##."],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  V: ["#.#", "#.#", "#.#", "#.#", ".#."],
  W: ["#.#", "#.#", "###", "###", "#.#"],
  X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  Y: ["#.#", "#.#", ".#.", ".#.", ".#."],
  Z: ["###", "..#", ".#.", "#..", "###"],
};

const FALLBACK = ["PIXEL", "ORBIT", "TURBO", "COMET", "DRIFT", "SPARK", "RADAR", "MANGO", "NOVA", "LASER", "GHOST", "ROBOT", "PRISM", "BLAZE"];

/** A random word from a free API (4–6 letters), with a local fallback. */
async function randomWord(): Promise<string> {
  const length = 4 + Math.floor(Math.random() * 3);
  try {
    const res = await fetch(`https://random-word-api.herokuapp.com/word?length=${length}`, { signal: AbortSignal.timeout(2500) });
    const [w] = (await res.json()) as string[];
    if (/^[a-z]{3,7}$/i.test(w)) return w.toUpperCase();
  } catch {}
  return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
}

type Brick = { x: number; y: number; w: number; h: number; alive: boolean; tone: number };

/** Breaker: bounce the ball to knock out a wall that spells a new random word each round. */
const create: CreateGame = (canvas, api) => {
  let bricks: Brick[] = [];
  let word = "";
  let paddleX = W / 2 - PADDLE.w / 2;
  let ball = { x: 0, y: 0, vx: 0, vy: 0 };
  let stuck = true;
  let lives = 3;
  let score = 0;
  let round = 0;
  let loading = false;
  let alive = false;
  const held = { left: false, right: false };
  let toLocal = (x: number, y: number) => ({ x, y });

  const build = (w: string) => {
    word = w;
    const cols = w.length * 4 - 1;
    const bw = Math.min(1.25, 29 / cols);
    const bh = 0.62;
    const ox = (W - cols * bw) / 2;
    bricks = [];
    [...w].forEach((ch, li) =>
      (GLYPHS[ch] ?? GLYPHS.O).forEach((row, ry) =>
        [...row].forEach((c, rx) => {
          if (c === "#") bricks.push({ x: ox + (li * 4 + rx) * bw, y: 3 + ry * bh * 1.25, w: bw, h: bh, alive: true, tone: ry });
        }),
      ),
    );
  };

  const nextRound = async () => {
    loading = true;
    stuck = true;
    build(await randomWord());
    round++;
    loading = false;
  };

  const speed = () => 15 + round * 1.6;

  const launch = () => {
    if (!stuck || loading) return;
    stuck = false;
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    ball.vx = Math.cos(a) * speed();
    ball.vy = Math.sin(a) * speed();
  };

  const draw = () => {
    const f = fit(canvas, W, H);
    const { ctx } = f;
    toLocal = f.toLocal;
    ctx.strokeStyle = C.mid;
    ctx.lineWidth = 0.06;
    ctx.strokeRect(0.03, 0.03, W - 0.06, H - 0.06);

    ctx.font = pixelFont(0.6);
    ctx.fillStyle = C.mid;
    ctx.fillText(loading ? "FETCHING A WORD…" : `WORD: ${word}`, 0.8, 1.5);
    ctx.textAlign = "right";
    ctx.fillText(`LIVES ${lives}`, W - 0.8, 1.5);
    ctx.textAlign = "start";

    bricks.forEach((b) => {
      if (!b.alive) return;
      ctx.fillStyle = b.tone % 2 ? C.fg : C.accent;
      ctx.fillRect(b.x + 0.05, b.y + 0.05, b.w - 0.1, b.h - 0.1);
    });

    ctx.fillStyle = C.white;
    ctx.beginPath();
    ctx.roundRect(paddleX, PADDLE.y, PADDLE.w, PADDLE.h, 0.25);
    ctx.fill();

    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  };

  const physics = (s: number) => {
    ball.x += ball.vx * s;
    ball.y += ball.vy * s;
    if (ball.x < BALL_R) {
      ball.x = BALL_R;
      ball.vx = Math.abs(ball.vx);
    }
    if (ball.x > W - BALL_R) {
      ball.x = W - BALL_R;
      ball.vx = -Math.abs(ball.vx);
    }
    if (ball.y < BALL_R) {
      ball.y = BALL_R;
      ball.vy = Math.abs(ball.vy);
    }

    // paddle: the bounce angle depends on where it hits
    if (ball.vy > 0 && ball.y + BALL_R >= PADDLE.y && ball.y < PADDLE.y + PADDLE.h && ball.x > paddleX - BALL_R && ball.x < paddleX + PADDLE.w + BALL_R) {
      const hit = (ball.x - (paddleX + PADDLE.w / 2)) / (PADDLE.w / 2);
      const a = -Math.PI / 2 + Math.max(-1, Math.min(1, hit)) * 1.05;
      const v = Math.hypot(ball.vx, ball.vy);
      ball.vx = Math.cos(a) * v;
      ball.vy = Math.sin(a) * v;
      ball.y = PADDLE.y - BALL_R;
    }

    for (const b of bricks) {
      if (!b.alive) continue;
      const cx = Math.max(b.x, Math.min(ball.x, b.x + b.w));
      const cy = Math.max(b.y, Math.min(ball.y, b.y + b.h));
      if ((ball.x - cx) ** 2 + (ball.y - cy) ** 2 > BALL_R ** 2) continue;
      b.alive = false;
      score += 10;
      api.score(score);
      const overlapX = Math.min(ball.x + BALL_R - b.x, b.x + b.w - (ball.x - BALL_R));
      const overlapY = Math.min(ball.y + BALL_R - b.y, b.y + b.h - (ball.y - BALL_R));
      if (overlapX < overlapY) ball.vx = -ball.vx;
      else ball.vy = -ball.vy;
      break;
    }
  };

  const run = loop((dt) => {
    const s = dt / 1000;
    const pv = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    paddleX = Math.max(0, Math.min(W - PADDLE.w, paddleX + pv * 26 * s));

    if (stuck) {
      ball.x = paddleX + PADDLE.w / 2;
      ball.y = PADDLE.y - BALL_R - 0.05;
    } else {
      const steps = Math.ceil((Math.hypot(ball.vx, ball.vy) * s) / 0.2);
      for (let i = 0; i < steps; i++) physics(s / steps);
      if (ball.y > H + 1) {
        lives--;
        if (lives <= 0) {
          alive = false;
          run.stop();
          draw();
          api.over(score);
          return;
        }
        stuck = true;
      }
      if (!loading && bricks.length && bricks.every((b) => !b.alive)) {
        score += 100;
        api.score(score);
        void nextRound();
      }
    }
    draw();
  });

  const onMove = (e: PointerEvent) => {
    if (!alive) return;
    const p = toLocal(e.clientX - canvas.getBoundingClientRect().left, 0);
    paddleX = Math.max(0, Math.min(W - PADDLE.w, p.x - PADDLE.w / 2));
  };
  canvas.parentElement?.addEventListener("pointermove", onMove);

  build(FALLBACK[0]);
  ball = { x: W / 2, y: PADDLE.y - BALL_R, vx: 0, vy: 0 };

  return {
    tap: true,
    start() {
      lives = 3;
      score = 0;
      round = 0;
      alive = true;
      paddleX = W / 2 - PADDLE.w / 2;
      held.left = held.right = false;
      void nextRound();
      run.start();
    },
    key(k, down) {
      if (k === "left" || k === "right") held[k] = down;
      else if ((k === "action" || k === "up") && down) launch();
    },
    draw,
    destroy() {
      run.stop();
      canvas.parentElement?.removeEventListener("pointermove", onMove);
    },
  };
};

export default create;

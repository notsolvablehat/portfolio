import { C, fit, loop, randInt, type CreateGame, type Key } from "../engine";

const COLS = 24;
const ROWS = 18;
type P = { x: number; y: number };
const DIRS: Partial<Record<Key, P>> = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } };

/** Snake: eat ₹ coins, grow, speed up. Walls and your own tail end the run. */
const create: CreateGame = (canvas, api) => {
  let snake: P[] = [];
  let dir: P = { x: 1, y: 0 };
  let queue: P[] = [];
  let coin: P = { x: 0, y: 0 };
  let score = 0;
  let interval = 130;
  let acc = 0;
  let alive = false;
  let pulse = 0;

  const placeCoin = () => {
    do coin = { x: randInt(COLS), y: randInt(ROWS) };
    while (snake.some((s) => s.x === coin.x && s.y === coin.y));
  };

  const reset = () => {
    snake = [
      { x: 8, y: 9 },
      { x: 7, y: 9 },
      { x: 6, y: 9 },
    ];
    dir = { x: 1, y: 0 };
    queue = [];
    score = 0;
    interval = 130;
    acc = 0;
    placeCoin();
  };

  const draw = () => {
    const { ctx } = fit(canvas, COLS, ROWS);
    ctx.fillStyle = C.dim;
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) ctx.fillRect(x + 0.46, y + 0.46, 0.08, 0.08);
    ctx.strokeStyle = C.mid;
    ctx.lineWidth = 0.06;
    ctx.strokeRect(0.03, 0.03, COLS - 0.06, ROWS - 0.06);

    // coin
    const r = 0.36 + Math.sin(pulse / 160) * 0.03;
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.arc(coin.x + 0.5, coin.y + 0.5, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = C.fg;
    ctx.lineWidth = 0.06;
    ctx.beginPath();
    ctx.arc(coin.x + 0.5, coin.y + 0.5, r * 0.62, 0, Math.PI * 2);
    ctx.stroke();

    // snake
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? C.white : C.fg;
      ctx.globalAlpha = i === 0 ? 1 : Math.max(0.45, 1 - i / (snake.length * 1.4));
      ctx.fillRect(s.x + 0.08, s.y + 0.08, 0.84, 0.84);
    });
    ctx.globalAlpha = 1;
    const h = snake[0];
    if (h) {
      ctx.fillStyle = C.accent;
      const ex = h.x + 0.5 + dir.x * 0.22;
      const ey = h.y + 0.5 + dir.y * 0.22;
      ctx.fillRect(ex - 0.12 - dir.y * 0.18, ey - 0.12 - dir.x * 0.18, 0.24, 0.24);
      ctx.fillRect(ex - 0.12 + dir.y * 0.18, ey - 0.12 + dir.x * 0.18, 0.24, 0.24);
    }
  };

  const step = () => {
    const next = queue.shift();
    if (next) dir = next;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const eats = head.x === coin.x && head.y === coin.y;
    const body = eats ? snake : snake.slice(0, -1);
    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || body.some((s) => s.x === head.x && s.y === head.y)) {
      alive = false;
      run.stop();
      draw();
      api.over(score);
      return;
    }
    snake.unshift(head);
    if (eats) {
      score++;
      api.score(score);
      interval = Math.max(60, interval - 3);
      placeCoin();
    } else snake.pop();
  };

  const run = loop((dt) => {
    pulse += dt;
    acc += dt;
    while (alive && acc >= interval) {
      acc -= interval;
      step();
    }
    if (alive) draw();
  });

  reset();

  return {
    start() {
      reset();
      alive = true;
      run.start();
    },
    key(k, down) {
      const d = DIRS[k];
      if (!down || !alive || !d) return;
      const last = queue.at(-1) ?? dir;
      if ((d.x === -last.x && d.y === -last.y) || (d.x === last.x && d.y === last.y)) return;
      if (queue.length < 3) queue.push(d);
    },
    draw,
    destroy: () => run.stop(),
  };
};

export default create;

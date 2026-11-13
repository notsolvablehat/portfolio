import { C, fit, loop, type CreateGame } from "../engine";

const WIDTH = 32;
const HEIGHT = 12;
const GROUND = 10;
const BIKE = { x: 4, w: 2.6, h: 1.6 };
const GRAVITY = 70;
const JUMP = -20;

type Obstacle = { x: number; w: number; h: number; kind: "rock" | "cone" | "log" };

/** Bike run: an endless off-road run. Jump the rocks, cones and logs; score is distance. */
const create: CreateGame = (canvas, api) => {
  let y = 0; // height above the ground (negative is up)
  let vy = 0;
  let holding = false;
  let speed = 11;
  let dist = 0;
  let obstacles: Obstacle[] = [];
  let nextGap = 10;
  let alive = false;
  let wheel = 0;
  let scroll = 0;

  const grounded = () => y >= 0;

  const reset = () => {
    y = 0;
    vy = 0;
    speed = 11;
    dist = 0;
    obstacles = [];
    nextGap = 12;
    scroll = 0;
  };

  const draw = () => {
    const { ctx } = fit(canvas, WIDTH, HEIGHT);
    // far hills (parallax)
    ctx.fillStyle = "rgba(253, 240, 213, 0.05)";
    for (let i = -1; i < 6; i++) {
      const hx = i * 8 - ((scroll * 0.2) % 8);
      ctx.beginPath();
      ctx.moveTo(hx, GROUND);
      ctx.quadraticCurveTo(hx + 4, GROUND - 4.5, hx + 8, GROUND);
      ctx.fill();
    }
    // ground
    ctx.fillStyle = C.mid;
    ctx.fillRect(0, GROUND, WIDTH, 0.06);
    ctx.fillStyle = C.dim;
    for (let i = 0; i < 24; i++) {
      const gx = (i * 1.7 - (scroll % 1.7) + WIDTH) % (WIDTH + 1.7);
      ctx.fillRect(gx, GROUND + 0.5 + (i % 3) * 0.4, 0.5, 0.08);
    }

    obstacles.forEach((o) => {
      ctx.fillStyle = o.kind === "cone" ? C.accent : C.fg;
      if (o.kind === "cone") {
        ctx.beginPath();
        ctx.moveTo(o.x, GROUND);
        ctx.lineTo(o.x + o.w / 2, GROUND - o.h);
        ctx.lineTo(o.x + o.w, GROUND);
        ctx.fill();
        ctx.fillStyle = C.white;
        ctx.fillRect(o.x + o.w * 0.28, GROUND - o.h * 0.55, o.w * 0.44, 0.16);
      } else if (o.kind === "log") {
        ctx.beginPath();
        ctx.roundRect(o.x, GROUND - o.h, o.w, o.h, o.h / 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(o.x, GROUND);
        ctx.lineTo(o.x + o.w * 0.2, GROUND - o.h * 0.8);
        ctx.lineTo(o.x + o.w * 0.6, GROUND - o.h);
        ctx.lineTo(o.x + o.w, GROUND);
        ctx.fill();
      }
    });

    // the bike
    const by = GROUND + y;
    const tilt = grounded() ? 0 : Math.max(-0.35, Math.min(0.25, vy / 60));
    ctx.save();
    ctx.translate(BIKE.x + 1.3, by - 0.5);
    ctx.rotate(tilt);
    ctx.strokeStyle = C.fg;
    ctx.lineWidth = 0.14;
    for (const wx of [-0.85, 0.85]) {
      ctx.beginPath();
      ctx.arc(wx, 0, 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.save();
      ctx.translate(wx, 0);
      ctx.rotate(wheel);
      ctx.beginPath();
      ctx.moveTo(-0.5, 0);
      ctx.lineTo(0.5, 0);
      ctx.moveTo(0, -0.5);
      ctx.lineTo(0, 0.5);
      ctx.lineWidth = 0.05;
      ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 0.18;
    ctx.beginPath();
    ctx.moveTo(-0.85, 0);
    ctx.lineTo(-0.2, -0.65);
    ctx.lineTo(0.55, -0.65);
    ctx.lineTo(0.85, 0);
    ctx.moveTo(0.55, -0.65);
    ctx.lineTo(0.75, -1.05);
    ctx.stroke();
    // rider
    ctx.strokeStyle = C.fg;
    ctx.lineWidth = 0.14;
    ctx.beginPath();
    ctx.moveTo(-0.1, -0.7);
    ctx.lineTo(0.15, -1.45);
    ctx.lineTo(0.7, -1.05);
    ctx.stroke();
    ctx.fillStyle = C.white;
    ctx.beginPath();
    ctx.arc(0.25, -1.75, 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const run = loop((dt) => {
    const s = dt / 1000;
    speed = Math.min(26, speed + s * 0.35);
    const dx = speed * s;
    dist += dx;
    scroll += dx;
    wheel += dx * 2;

    // jump physics; holding the button floats a little longer on the way up
    vy += GRAVITY * (holding && vy < 0 ? 0.55 : 1) * s;
    y = Math.min(0, y + vy * s);
    if (grounded()) vy = 0;

    obstacles.forEach((o) => (o.x -= dx));
    obstacles = obstacles.filter((o) => o.x + o.w > -1);
    nextGap -= dx;
    if (nextGap <= 0) {
      const r = Math.random();
      const kind = r < 0.4 ? "rock" : r < 0.75 ? "cone" : "log";
      const o: Obstacle =
        kind === "log" ? { kind, x: WIDTH + 1, w: 2.4, h: 0.7 } : kind === "cone" ? { kind, x: WIDTH + 1, w: 0.9, h: 1.3 } : { kind, x: WIDTH + 1, w: 1.3, h: 1 + Math.random() * 0.7 };
      obstacles.push(o);
      nextGap = 7 + Math.random() * 9 + speed * 0.25;
    }

    // collision (a forgiving box around the bike)
    const bx1 = BIKE.x + 0.35;
    const bx2 = BIKE.x + BIKE.w - 0.35;
    const bottom = GROUND + y;
    if (obstacles.some((o) => o.x < bx2 && o.x + o.w > bx1 && bottom > GROUND - o.h + 0.15)) {
      alive = false;
      run.stop();
      draw();
      api.over(Math.floor(dist));
      return;
    }
    api.score(Math.floor(dist));
    draw();
  });

  reset();

  return {
    tap: true,
    start() {
      reset();
      alive = true;
      run.start();
    },
    key(k, down) {
      if (k !== "action" && k !== "up") return;
      holding = down;
      if (down && alive && grounded()) vy = JUMP;
    },
    draw,
    destroy: () => run.stop(),
  };
};

export default create;

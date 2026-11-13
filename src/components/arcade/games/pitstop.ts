import { C, fit, loop, pixelFont, type CreateGame } from "../engine";

const LIGHT_MS = 900;

/** Pit stop: five red lights come on one by one, then go out — react. Score is your reaction time. */
const create: CreateGame = (canvas, api) => {
  let state: "idle" | "lights" | "hold" | "go" | "done" | "jump" = "idle";
  let lit = 0;
  let t = 0;
  let hold = 0;
  let goAt = 0;
  let result = 0;

  const draw = () => {
    const { ctx } = fit(canvas, 32, 24);
    // gantry
    ctx.fillStyle = "#262626";
    ctx.fillRect(3, 5, 26, 1.2);
    for (let i = 0; i < 5; i++) {
      const x = 4.2 + i * 5;
      ctx.fillStyle = "#1e1e1e";
      ctx.beginPath();
      ctx.roundRect(x, 4, 3.6, 8.4, 0.6);
      ctx.fill();
      for (const row of [0, 1]) {
        const on = (state === "lights" || state === "hold") && i < lit;
        ctx.fillStyle = on ? C.accent : "#3d3d3d";
        if (on) {
          ctx.shadowColor = C.accent;
          ctx.shadowBlur = 1.4;
        }
        ctx.beginPath();
        ctx.arc(x + 1.8, 6.2 + row * 3.8, 1.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.textAlign = "center";
    if (state === "done") {
      ctx.fillStyle = C.fg;
      ctx.font = pixelFont(3.4);
      ctx.fillText(`${result} MS`, 16, 18.5);
      ctx.fillStyle = C.mid;
      ctx.font = pixelFont(0.75);
      ctx.fillText(result < 200 ? "POLE POSITION PACE" : result < 280 ? "SOLID LAUNCH" : "BOXED IN AT TURN 1", 16, 21);
    } else if (state === "jump") {
      ctx.fillStyle = C.accent;
      ctx.font = pixelFont(2.6);
      ctx.fillText("JUMP START", 16, 18.5);
    } else if (state === "go") {
      ctx.fillStyle = C.fg;
      ctx.font = pixelFont(2.2);
      ctx.fillText("GO GO GO", 16, 18.5);
    } else if (state !== "idle") {
      ctx.fillStyle = C.mid;
      ctx.font = pixelFont(0.8);
      ctx.fillText("WAIT FOR LIGHTS OUT", 16, 18.5);
    }
    ctx.textAlign = "start";
  };

  const run = loop((dt) => {
    t += dt;
    if (state === "lights" && t >= LIGHT_MS) {
      t = 0;
      lit++;
      if (lit >= 5) {
        state = "hold";
        hold = 300 + Math.random() * 2600;
      }
    } else if (state === "hold" && t >= hold) {
      state = "go";
      lit = 0;
      goAt = performance.now();
    }
    draw();
  });

  return {
    tap: true,
    start() {
      state = "lights";
      lit = 0;
      t = 0;
      run.start();
    },
    key(k, down) {
      if (!down || (k !== "action" && k !== "up")) return;
      if (state === "lights" || state === "hold") {
        state = "jump";
        run.stop();
        draw();
        api.over(0, { record: false, note: "JUMP START" });
      } else if (state === "go") {
        result = Math.round(performance.now() - goAt);
        state = "done";
        run.stop();
        draw();
        api.over(result);
      }
    },
    draw,
    destroy: () => run.stop(),
  };
};

export default create;

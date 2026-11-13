"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import HeroClock from "@/components/hero/HeroClock";
import Icon from "@/components/ui/Icon";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Experience → Work transition: the hero's window comes back.
 *
 * A cream stage is pinned for one viewport of scroll with a framed square and
 * dashed crosshair over it. #work sits on top of the stage, clipped to that
 * square (centred on the WORK heading), and the window opens until #work
 * fills the screen while the stage behind zooms in.
 */
export default function WindowReveal() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const stage = stageRef.current!;
    const work = document.getElementById("work")!;
    const heading = work.querySelector<HTMLElement>("h2")!;
    const zoom = stage.querySelector<HTMLElement>(".wr-zoom")!;
    const frame = stage.querySelector<HTMLElement>(".wr-frame")!;
    const labels = stage.querySelectorAll<HTMLElement>(".wr-label");
    const crossH = stage.querySelector<HTMLElement>(".wr-cross-h")!;
    const crossV = stage.querySelector<HTMLElement>(".wr-cross-v")!;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stage.style.display = "none";
      return () => (stage.style.display = "");
    }

    let vw = 0;
    let vh = 0;
    let cx = 0;
    let cy = 0;
    let side = 0;

    const measure = () => {
      vw = stage.offsetWidth;
      vh = stage.offsetHeight;
      side = Math.min(vw, vh) * 0.3;
      const w = work.getBoundingClientRect();
      const h = heading.getBoundingClientRect();
      cx = h.left - w.left + h.width / 2;
      cy = gsap.utils.clamp(side / 2 + 24, vh - side / 2 - 24, h.top - w.top + h.height / 2);
      work.style.marginTop = `-${vh}px`;
      gsap.set(zoom, { transformOrigin: `${cx}px ${cy}px` });
    };

    const ease = gsap.parseEase("power3.inOut");

    const render = (p: number) => {
      const k = 1 - ease(p);
      const l = (cx - side / 2) * k;
      const r = (vw - cx - side / 2) * k;
      const t = (cy - side / 2) * k;
      const b = (vh - cy - side / 2) * k;
      work.style.clipPath = p >= 1 ? "none" : `inset(${t}px ${r}px ${work.offsetHeight - vh + b}px ${l}px)`;
      Object.assign(frame.style, { left: `${l - 3}px`, right: `${r - 3}px`, top: `${t - 3}px`, bottom: `${b - 3}px` });
      frame.style.opacity = p < 1 ? "1" : "0";
      crossH.style.top = `${cy}px`;
      crossV.style.left = `${cx}px`;
      const fade = String(Math.max(0, 1 - p * 3));
      crossH.style.opacity = crossV.style.opacity = fade;
      labels.forEach((el) => (el.style.opacity = fade));
      gsap.set(zoom, { scale: 1 + 0.35 * ease(p) });
    };

    ScrollTrigger.addEventListener("refreshInit", measure);
    measure();

    const end = () => `+=${stage.offsetHeight}`;
    ScrollTrigger.create({ trigger: stage, start: "top top", end, pin: true, pinSpacing: false });
    const st = ScrollTrigger.create({
      trigger: work,
      start: "top top",
      end,
      pin: true,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => {
        render(self.progress);
        // menu / deep links land after the transition
        work.dataset.scrollAt = String(Math.ceil(self.end));
      },
    });
    render(st.progress);
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", measure);
      work.style.marginTop = work.style.clipPath = "";
      delete work.dataset.scrollAt;
    };
  });

  return (
    <div ref={stageRef} id="work-stage" aria-hidden className="relative z-0 h-svh overflow-hidden bg-cream">
      <div className="wr-zoom absolute inset-0">
        <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-[26vw] leading-none text-ink/[0.05] select-none">
          WORK
        </p>
      </div>
      <span className="wr-cross-h dash-h absolute left-0 h-px w-full" />
      <span className="wr-cross-v dash-v absolute top-0 h-full w-px" />
      <div className="wr-frame absolute border-[3px] border-ink">
        <p className="wr-label absolute right-0 bottom-full mb-3 font-pixel text-[11px] tracking-[0.08em] whitespace-nowrap text-pure-black">
          CURRENT TIME: <HeroClock /> IST
        </p>
        <p className="wr-label absolute top-full left-0 mt-3 font-pixel text-[clamp(11px,0.85vw,15px)] tracking-[0.14em] whitespace-nowrap text-accent">
          [SELECTED WORK <Icon name="arrow_downward" />]
        </p>
      </div>
    </div>
  );
}

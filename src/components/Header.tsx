"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { NAV, SITE, SOCIALS } from "@/lib/site";
import { scrollToTarget, useLenis } from "@/components/providers/SmoothScroll";
import { cn } from "@/lib/utils";

const EASE = [0.76, 0, 0.24, 1] as const;
/** Snappy spring used for the panel, close button and hover dot. */
const SNAP = { type: "spring", stiffness: 520, damping: 44, mass: 0.8 } as const;

/** Which nav section currently holds the middle of the viewport. */
function currentSection() {
  const mid = window.innerHeight / 2;
  for (const { href } of NAV) {
    const r = document.querySelector(href)?.getBoundingClientRect();
    if (r && r.top <= mid && r.bottom >= mid) return href;
  }
  return NAV[0].href;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(NAV[0].href);
  const [hovered, setHovered] = useState<number | null>(null);
  const lenis = useLenis();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const instance = lenis.current;
    instance?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      instance?.start();
    };
  }, [open, lenis]);

  // Past the top the header gets a cream backdrop so it never sits on top of
  // content; it slides away while scrolling down and returns on scroll up.
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setSolid(y > 40);
        if (Math.abs(y - last) > 6) {
          setHidden(y > last && y > 160);
          last = y;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const openMenu = () => {
    setActive(pathname === "/" ? currentSection() : "");
    setHovered(null);
    setOpen(true);
  };

  // On the home page, close the menu and scroll (scroll-driven transitions play
  // on the way, e.g. the eye zoom into #work). Elsewhere, go home first.
  const go = (href: string) => {
    setOpen(false);
    if (pathname !== "/") return router.push(`/${href === "#top" ? "" : href}`);
    // let the panel start sliding out before the page moves
    setTimeout(() => scrollToTarget(lenis.current, href), 180);
  };

  return (
    <>
      <header
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[max(20px,3.6vw)] pt-[max(20px,2.2vw)] pb-[max(14px,1.2vw)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          hidden && !open && "-translate-y-full",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10 border-b border-dashed border-ink/30 bg-cream/85 backdrop-blur-md transition-opacity duration-300",
            solid && !open ? "opacity-100" : "opacity-0",
          )}
        />
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            go("#top");
          }}
          className="pointer-events-auto font-pixel text-[clamp(13px,1.2vw,22px)] text-pure-black"
        >
          {SITE.name}
        </a>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={openMenu}
          className={cn(
            "group pointer-events-auto -m-3 mr-[max(-12px,calc(1.9vw-12px))] flex flex-col items-end gap-[6px] p-3 transition-opacity duration-300",
            open && "opacity-0",
          )}
        >
          <span className="block h-[1.5px] w-[clamp(32px,2.5vw,52px)] bg-ink transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:scale-x-75 origin-right" />
          <span className="block h-[1.5px] w-[clamp(26px,2vw,42px)] bg-ink transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:scale-x-125 origin-right" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Menu">
            <motion.button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-ink/75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />

            <motion.nav
              className="absolute inset-y-0 right-0 flex w-full flex-col bg-cream md:w-[max(400px,30vw)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={SNAP}
            >
              <ul className="mt-[max(120px,28vh)] flex flex-col gap-[clamp(20px,2.6vw,52px)] pl-[max(36px,4.6vw)]">
                {NAV.map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        go(item.href);
                      }}
                      className="group flex items-baseline gap-[clamp(16px,2.2vw,44px)]"
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "110%" }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 + i * 0.04 }}
                    >
                      <span className="w-[1.4em] font-display text-[clamp(12px,0.85vw,16px)] text-ink">{i + 1}.</span>
                      <span
                        className={cn(
                          "font-display text-[clamp(34px,2.6vw,54px)] leading-none transition-[color,translate] duration-150 ease-out group-hover:translate-x-2 group-hover:text-accent",
                          active === item.href ? "text-accent" : "text-ink",
                        )}
                      >
                        {item.label}
                      </span>
                    </motion.a>
                  </li>
                ))}
              </ul>

              <motion.ul
                onPointerLeave={() => setHovered(null)}
                onBlur={() => setHovered(null)}
                className="mt-auto mb-[max(40px,7vh)] flex items-center justify-between px-[max(28px,3.6vw)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.3 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                {SOCIALS.map((s, i) => (
                  <li key={s.label} onPointerEnter={() => setHovered(i)} onFocus={() => setHovered(i)}>
                    <a
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className={cn(
                        "relative flex size-[clamp(60px,3.6vw,76px)] items-center justify-center font-display text-[clamp(11px,0.75vw,14px)] transition-colors duration-100",
                        hovered === i ? "text-white" : "text-ink",
                      )}
                    >
                      {/* one dot, shared between links via layoutId, so it glides from link to link */}
                      {hovered === i && (
                        <motion.span
                          layoutId="social-dot"
                          className="absolute inset-0 rounded-full bg-accent"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ ...SNAP, stiffness: 650, damping: 38 }}
                        />
                      )}
                      <span className="relative">{s.label}</span>
                    </a>
                  </li>
                ))}
              </motion.ul>

              {/* Close: sits outside the panel on desktop, inside on mobile */}
              <motion.button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="group absolute top-[max(20px,4.6vw)] right-[max(20px,3.6vw)] flex size-[clamp(64px,6.9vw,140px)] items-center justify-center rounded-full bg-accent text-white md:top-[4.4vw] md:right-auto md:left-[calc(-1*clamp(64px,6.9vw,140px)-6.2vw)]"
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { ...SNAP, stiffness: 700, damping: 28, delay: 0.08 } }}
                exit={{ scale: 0, transition: { duration: 0.15, ease: EASE } }}
              >
                <svg viewBox="0 0 24 24" className="size-[34%] transition-transform duration-200 ease-out group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 4l16 16M20 4L4 20" />
                </svg>
              </motion.button>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useSyncExternalStore } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};

/** Live IST clock (HH:MM). Renders "--:--" on the server to avoid a hydration mismatch. */
export default function HeroClock() {
  const time = useSyncExternalStore(subscribe, () => fmt.format(new Date()), () => "--:--");
  return <span suppressHydrationWarning>{time}</span>;
}

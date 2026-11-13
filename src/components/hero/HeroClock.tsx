"use client";

import { useSyncExternalStore } from "react";

const IST = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });

const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
let zone = "";
/** The visitor's zone as a short name: no one locale knows them all (en-US: EST, en-IN: IST, en-GB: GST); else a GMT offset. */
const zoneName = () => {
  if (zone) return zone;
  const names = ["en-US", "en-IN", "en-GB"].map(
    (l) => new Intl.DateTimeFormat(l, { timeZoneName: "short" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value ?? "",
  );
  zone = (names.find((n) => n && !n.startsWith("GMT+") && !n.startsWith("GMT-") && !n.startsWith("UTC")) ?? names[0]).toUpperCase();
  return zone;
};
/** HH:MM plus the zone name, in the visitor's own time zone. */
const viewerTime = () => `${TIME.format(new Date())} ${zoneName()}`;

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};

/**
 * Live clock. By default Bengaluru time (HH:MM, IST). With `viewer`, the
 * visitor's own time and zone name. Renders "--:--" on the server to avoid a
 * hydration mismatch.
 */
export default function HeroClock({ viewer: own = false }: { viewer?: boolean }) {
  const time = useSyncExternalStore(subscribe, () => (own ? viewerTime() : IST.format(new Date())), () => "--:--");
  return <span suppressHydrationWarning>{time}</span>;
}

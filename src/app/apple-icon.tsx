import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Pixel hat cells: [x, y, w, h, colour] on a 16×16 grid (same art as icon.svg). */
const CELLS: [number, number, number, number, string][] = [
  [4, 2, 8, 6, "#323232"],
  [5, 3, 1, 3, "#4d4d4d"],
  [4, 8, 8, 2, "#e63e21"],
  [10, 8, 1, 2, "#ffffff"],
  [2, 10, 12, 1, "#323232"],
  [1, 11, 14, 2, "#323232"],
];

/** Home-screen icon: the pixel hat, full-bleed (iOS rounds the corners itself). */
export default function AppleIcon() {
  const u = 180 / 16;
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, display: "flex", position: "relative", background: "#fdf0d5" }}>
        {CELLS.map(([x, y, w, h, c], i) => (
          <div key={i} style={{ position: "absolute", left: x * u, top: y * u + u * 0.5, width: w * u, height: h * u, background: c }} />
        ))}
      </div>
    ),
    size,
  );
}

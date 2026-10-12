import { ImageResponse } from "next/og";

export const alt = "Kept";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#f6f1e7", color: "#111" }}>
        <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: -4 }}>Kept</div>
        <div style={{ fontSize: 48, marginTop: 24, color: "#444" }}>A note that waits. €1. No account.</div>
        <div style={{ fontSize: 30, marginTop: 56, color: "#e8590c" }}>kept.nyttolabs.com</div>
      </div>
    ),
    size
  );
}

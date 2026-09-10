import { ImageResponse } from "next/og";

// Serves iOS splash images at their exact physical pixel size, e.g.
// /apple-splash/1290x2796. Referenced from layout.tsx's apple-touch-
// startup-image link tags (src/lib/apple-splash-devices.ts).
export async function GET(_request: Request, { params }: { params: Promise<{ dims: string }> }) {
  const { dims } = await params;
  const [wStr, hStr] = dims.split("x");
  const width = Math.min(3200, Math.max(200, Number(wStr) || 1170));
  const height = Math.min(3200, Math.max(200, Number(hStr) || 2532));
  const badge = Math.round(width * 0.28);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf9f7",
        }}
      >
        <div
          style={{
            width: badge,
            height: badge,
            borderRadius: 9999,
            background: "#3f7d63",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.round(width * 0.16),
          }}
        >
          🐨
        </div>
      </div>
    ),
    { width, height },
  );
}

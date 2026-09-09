import { ImageResponse } from "next/og";

// Serves PWA manifest icons at explicit sizes, e.g. /icons/192, /icons/512.
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const px = Math.min(1024, Math.max(16, Number(size) || 192));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3f7d63",
          fontSize: px * 0.6,
        }}
      >
        🐨
      </div>
    ),
    { width: px, height: px },
  );
}

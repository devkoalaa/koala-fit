import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 10,
          fontSize: 32,
        }}
      >
        🐨
      </div>
    ),
    { ...size },
  );
}

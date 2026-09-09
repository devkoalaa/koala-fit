"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

// Catches errors thrown by the root layout itself (e.g. theme cookie
// resolution) — error.tsx can't, since it renders *inside* that layout.
// Root layout may have failed, so this can't rely on tokens.css/design
// system being available: plain inline styles only.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          paddingTop: "calc(24px + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
          textAlign: "center",
          background: "#faf9f7",
          color: "#2a2822",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <TriangleAlert size={40} color="#c9503f" strokeWidth={1.5} aria-hidden="true" />
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Algo deu errado</h1>
          <p style={{ fontSize: 14, color: "#6b665c" }}>Tente recarregar a página.</p>
        </div>
        <button
          onClick={reset}
          style={{
            minHeight: 44,
            padding: "0 20px",
            borderRadius: 10,
            background: "#3f7d63",
            color: "#fff",
            fontWeight: 500,
            border: "none",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}

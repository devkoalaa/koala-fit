import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Koala Fit",
    short_name: "Koala Fit",
    description: "Registre seus treinos, acompanhe sua evolução e mantenha a constância.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f7",
    theme_color: "#3f7d63",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import {
  THEME_BACKGROUND,
  THEME_COOKIE,
  isThemePreference,
  resolvedDataTheme,
  type ThemePreference,
} from "@/lib/theme";
import { APPLE_SPLASH_DEVICES } from "@/lib/apple-splash-devices";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Koala Fit",
  description: "Registre seus treinos, acompanhe sua evolução e mantenha a constância.",
  manifest: "/manifest.webmanifest",
  // Neither the icon.tsx/apple-icon.tsx file-convention <link> tags NOR an
  // unprefixed path declared here pick up `basePath` automatically (unlike
  // `manifest` above — `icons` can point at an external URL, so Next.js
  // doesn't assume it's same-origin/relative). The prefix has to be
  // hardcoded; it must match next.config.ts's basePath.
  icons: {
    icon: "/koala-fit/icon",
    apple: "/koala-fit/apple-icon",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Koala Fit",
  },
};

export async function generateViewport(): Promise<Viewport> {
  const pref = await readThemePreference();

  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    // Draws the app edge-to-edge on notched iPhones; the safe-area insets in
    // globals.css are what keep content out from under the system bars.
    viewportFit: "cover",
    // An explicit preference is known here, so pin the chrome to it. Only
    // "system" is left to the OS to resolve.
    themeColor:
      pref === "system"
        ? [
            { media: "(prefers-color-scheme: light)", color: THEME_BACKGROUND.light },
            { media: "(prefers-color-scheme: dark)", color: THEME_BACKGROUND.dark },
          ]
        : THEME_BACKGROUND[pref],
  };
}

async function readThemePreference(): Promise<ThemePreference> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(THEME_COOKIE)?.value;
  return isThemePreference(raw) ? raw : "system";
}

// Resolves "system" to an actual light/dark data-theme attribute before paint,
// so pages never flash the wrong theme while JS boots.
const THEME_BOOT_SCRIPT = `
(function () {
  try {
    var pref = document.documentElement.getAttribute('data-theme-pref') || 'system';
    if (pref === 'system') {
      var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const pref = await readThemePreference();
  const dataTheme = resolvedDataTheme(pref);

  return (
    <html
      lang="pt-BR"
      data-theme={dataTheme}
      data-theme-pref={pref}
      className={`${geistSans.variable} ${geistMono.variable} min-h-lvh antialiased`}
      suppressHydrationWarning
    >
      <head>
        {!dataTheme && (
          <Script id="theme-boot" strategy="beforeInteractive">
            {THEME_BOOT_SCRIPT}
          </Script>
        )}
        {/* iOS doesn't generate a splash screen from the manifest like Android
            does — these give it one per device size instead of a blank flash
            on launch. Hardcoded /koala-fit prefix for the same reason as the
            icons above: basePath isn't auto-applied here. */}
        {APPLE_SPLASH_DEVICES.map((d) => (
          <link
            key={`${d.widthCss}x${d.heightCss}@${d.dpr}`}
            rel="apple-touch-startup-image"
            href={`/koala-fit/apple-splash/${d.widthCss * d.dpr}x${d.heightCss * d.dpr}`}
            media={`(device-width: ${d.widthCss}px) and (device-height: ${d.heightCss}px) and (-webkit-device-pixel-ratio: ${d.dpr}) and (orientation: portrait)`}
          />
        ))}
      </head>
      <body className="min-h-lvh flex flex-col">{children}</body>
    </html>
  );
}

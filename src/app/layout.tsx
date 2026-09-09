import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { THEME_COOKIE, isThemePreference, resolvedDataTheme } from "@/lib/theme";
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Koala Fit",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#18160f" },
  ],
};

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
  const cookieStore = await cookies();
  const rawPref = cookieStore.get(THEME_COOKIE)?.value;
  const pref = isThemePreference(rawPref) ? rawPref : "system";
  const dataTheme = resolvedDataTheme(pref);

  return (
    <html
      lang="pt-BR"
      data-theme={dataTheme}
      data-theme-pref={pref}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {!dataTheme && (
          <Script id="theme-boot" strategy="beforeInteractive">
            {THEME_BOOT_SCRIPT}
          </Script>
        )}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

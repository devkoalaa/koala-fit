"use client";

import { useEffect, useState } from "react";

type Reading = { label: string; value: string };

/**
 * Reads what iOS actually reports on the device, instead of what we assume it
 * reports. Temporary diagnostic page — safe to delete once the safe-area
 * behaviour is confirmed.
 */
export function SafeAreaProbe() {
  const [readings, setReadings] = useState<Reading[] | null>(null);

  useEffect(() => {
    // Measured on the next frame: the values only exist once the browser has
    // laid the probe out, and reading them synchronously here would cascade a
    // render out of the effect body.
    const frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);

    function measure() {
      const probe = document.createElement("div");
      probe.style.cssText = [
        "position:fixed",
        "top:0",
        "left:0",
        "visibility:hidden",
        "padding-top:env(safe-area-inset-top,0px)",
        "padding-right:env(safe-area-inset-right,0px)",
        "padding-bottom:env(safe-area-inset-bottom,0px)",
        "padding-left:env(safe-area-inset-left,0px)",
      ].join(";");
      document.body.appendChild(probe);
      const probed = getComputedStyle(probe);
      const root = getComputedStyle(document.documentElement);
      const nav = document.querySelector("nav");

      setReadings([
        { label: "env inset top", value: probed.paddingTop },
        { label: "env inset bottom", value: probed.paddingBottom },
        {
          label: "env inset left / right",
          value: `${probed.paddingLeft} / ${probed.paddingRight}`,
        },
        {
          label: "--safe-top",
          value: root.getPropertyValue("--safe-top").trim() || "(vazio)",
        },
        {
          label: "--safe-bottom",
          value: root.getPropertyValue("--safe-bottom").trim() || "(vazio)",
        },
        {
          label: "--bottom-nav-inset",
          value:
            root.getPropertyValue("--bottom-nav-inset").trim() || "(vazio)",
        },
        {
          label: "altura da <nav>",
          value: nav
            ? `${Math.round(nav.getBoundingClientRect().height)}px`
            : "(sem nav)",
        },
        {
          label: "padding-bottom da <nav>",
          value: nav ? getComputedStyle(nav).paddingBottom : "(sem nav)",
        },
        {
          label: "standalone (instalado)",
          value: String(
            ("standalone" in navigator &&
              (navigator as Navigator & { standalone?: boolean }).standalone) ??
              "n/d",
          ),
        },
        {
          label: "display-mode: standalone",
          value: String(matchMedia("(display-mode: standalone)").matches),
        },
        {
          label: "innerHeight / screen.height",
          value: `${innerHeight} / ${screen.height}`,
        },
        {
          label: "base da <nav> / innerHeight",
          value: nav
            ? `${Math.round(nav.getBoundingClientRect().bottom)} / ${innerHeight}`
            : "(sem nav)",
        },
        {
          label: "sobra abaixo da <nav>",
          value: nav
            ? `${Math.round(screen.height - nav.getBoundingClientRect().bottom)}px`
            : "(sem nav)",
        },
        {
          label: "svh / lvh / dvh",
          value: `${measureUnit("svh")} / ${measureUnit("lvh")} / ${measureUnit("dvh")}`,
        },
        {
          label: "página rola?",
          value: String(
            document.documentElement.scrollHeight >
              document.documentElement.clientHeight,
          ),
        },
        { label: "devicePixelRatio", value: String(devicePixelRatio) },
      ]);

      probe.remove();
    }

    /** Resolves one viewport unit to px, so we can see how iOS sizes each. */
    function measureUnit(unit: "svh" | "lvh" | "dvh") {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;top:0;left:0;visibility:hidden;height:100${unit}`;
      document.body.appendChild(el);
      const height = Math.round(el.getBoundingClientRect().height);
      el.remove();
      return height;
    }
  }, []);

  if (!readings) return <p className="text-sm text-text-tertiary">Medindo…</p>;

  return (
    <dl className="flex flex-col gap-2 text-sm">
      {readings.map((r) => (
        <div
          key={r.label}
          className="flex items-baseline justify-between gap-3 border-b border-border pb-1"
        >
          <dt className="text-text-secondary">{r.label}</dt>
          <dd className="font-mono font-semibold text-text">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

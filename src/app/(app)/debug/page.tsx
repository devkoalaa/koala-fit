import { SafeAreaProbe } from "./SafeAreaProbe";

// Temporary diagnostic route. Lives inside (app) so it renders under the same
// layout and bottom nav as every other screen — the probe measures the real
// nav, not a stand-in — and prints the build actually being served.
export default function DebugPage() {
  const sha = process.env.GIT_COMMIT_SHA?.slice(0, 7) ?? "local";

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Diagnóstico</h1>
        <p className="text-sm text-text-secondary">
          Build em execução: <span className="font-mono font-semibold text-text">{sha}</span>
        </p>
      </div>

      <SafeAreaProbe />

      <p className="text-xs text-text-tertiary">
        A faixa vermelha marca o topo reservado pelo iOS e a verde, a base. Se o conteúdo não
        encostar nelas, os insets estão sendo aplicados.
      </p>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-50 bg-danger/40"
        style={{ height: "var(--safe-top)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 bg-primary/40"
        style={{ height: "var(--safe-bottom)" }}
      />
    </div>
  );
}

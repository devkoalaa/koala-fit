import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * True only after the client has taken over from the server-rendered HTML.
 * Used to gate portals (Sheet, Toast) that need `document.body` — checking
 * `typeof document` directly mismatches server/client output on first paint,
 * since the server always sees `undefined` but the client doesn't.
 * useSyncExternalStore (server snapshot always false) avoids that without
 * an extra setState-in-effect render.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

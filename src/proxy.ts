import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

// Optimistic gate: redirects to /login when there's no session cookie at all.
// This is a fast, DB-free check — the real session (cookie signature/expiry
// against the `sessions` table) is validated in the (app) route group layout.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Every route except:
     * - /login
     * - Next internals (_next/static, _next/image)
     * - PWA/static files (manifest, icons, favicon, service worker)
     */
    "/((?!login|_next/static|_next/image|manifest\\.webmanifest|sw\\.js|icons|favicon\\.ico).*)",
  ],
};
